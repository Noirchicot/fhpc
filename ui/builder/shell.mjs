/* ══ LA COQUILLE DU BUILDER — lots 30/31/33 ═══════════════════════════
   Assistant pur + plan escamotable, forme ratifiée le 2026-08-10. AUCUN
   bandeau permanent (loi du builder) : la seule chose visible en dehors de
   la décision courante est le repère de progression (belt menu) et le
   bouton du plan, fermé par défaut.

   DEPUIS LE LOT 33 : le moteur tourne DANS la page (lot 32, prouvé
   portable) et l'étape Compétences lit le VRAI carnet `decisions[]`
   (lot 28) sur le VRAI document d'exemple EN+FH. Les huit autres étapes
   restent des placeholders — un lot par étape, sur ce même modèle.

   Zéro framework, zéro build (loi Q3 du chantier) : DOM natif, ESM natif. */

import { bootEngine, loadExampleDocument, loadDocSchema } from "./engine.mjs";
import { renderConceptStep } from "./concept-step.mjs";
import { renderUniverseStep, currentStack, fhRefChoices, FH_LAYER_IDS } from "./universe-step.mjs";
import { renderSkillsStep } from "./skills-step.mjs";
import { renderClassStep } from "./class-step.mjs";
import { renderSpeciesStep } from "./species-step.mjs";
import { renderInheritanceStep } from "./inheritance-step.mjs";
import { renderAbilitiesStep, rollAbilitySet, emptyAbilityAssign } from "./abilities-step.mjs";
import { renderDestinyStep } from "./destiny-step.mjs";
import { renderEquipmentStep, currentCurrency, nextGearIndex, INHERITED_PURSE_GP } from "./equipment-step.mjs";
import { CURRENCY_KEYS } from "../../src/build/index.mjs";
/* LOT 54, §1 — PAS `createDoc` : ce bloc refuse de se construire sans
   magasin, et le navigateur n'en a aucun (voir la tête de
   `src/doc/store.mjs` et `universe-step.mjs`). `createDocWriters` est
   PUR — ni magasin ni bus — importé directement de `writers.mjs`, jamais
   via `src/doc/index.mjs` (qui, lui, importe `store.mjs` et donc
   `node:crypto` : un import que le navigateur ne sait pas résoudre). */
import { createDocWriters } from "../../src/doc/writers.mjs";
/* LOT 40 — `render()` rend une CHAÎNE HTML (voir src/tools/render-fiche.mjs,
   §« LE HTML »), pas des nœuds : c'est une décision d'architecture du lot 25,
   antérieure à ce lot, mesurée et non rouverte ici (voir INVENTAIRE-LOT-40.md
   §0.1). La coquille est déjà le seul endroit du builder qui pose du HTML en
   chaîne (`item.innerHTML` du repère de progression, `app.innerHTML = ""`
   plus bas) : l'étape Review suit exactement ce précédent, dans `shell.mjs`
   seul — jamais dans un module testé par `tests/dom-stub.mjs`, qui ne connaît
   pas `innerHTML` par construction (son propre commentaire le dit). */
/* Aliasé : `shell.mjs` a déjà son propre `render()` (la fonction de redessin
   de la page, plus bas) — deux fonctions distinctes, un seul nom aurait
   masqué l'une des deux. */
import { render as renderFiche } from "../../src/tools/render-fiche.mjs";

/* Mots d'interface en ANGLAIS (arbitrage d'Eric, 2026-08-10) : la table joue
   en anglais, décidé de longue date pour la couche FH — l'écran réel qui
   servira à la table doit être dans la même langue dès le départ, pas
   traduit après coup. */
const STEPS = [
  { id: "universe",   label: "Universe & Layers" },
  { id: "concept",    label: "Concept" },
  { id: "class",      label: "Class" },
  { id: "species",    label: "Species" },
  { id: "background", label: "Inheritance" }, // LOT 42, §3d — l'arrière-plan n'existe plus en Fate's Hand ; le libellé change seul, l'écran reste un placeholder (un autre lot)
  { id: "abilities",  label: "Abilities" },
  { id: "destiny",    label: "Destiny" },
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
  planOpen: false,
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
     `planOpen` — perdus si l'onglet ferme, et c'est voulu. */
  /* LOT 50 — `abilityRoll` porte maintenant aussi `assign` : la carte
     `clef → index de dé` (commande §2a, « la carte vit au même endroit que
     le lot »). Ni l'un ni l'autre champ n'existe dans `document` — voir
     `abilities-step.mjs`, en-tête. */
  abilityRoll: null,     // le dernier lot de dix jets ({rolls, rerollCount, assign}), ou null
  destinyMode: "draw",   // "draw" (défaut, ADDENDUMS §4) ou "choice" — jamais écrit au document (fh.destiny.* est un namespace strict, mesuré)
  /* LOT 54 — Concept/Universe. `docWriters` = `createDocWriters({schema})`,
     construit UNE FOIS au boot (juste en dessous) : PUR, sans magasin ni bus
     (voir shell.mjs, imports, et universe-step.mjs en tête). `fieldErrors`
     et `pendingStack` sont de l'état d'ÉCRAN, comme `abilityRoll` —
     jamais écrits au document, perdus si l'onglet ferme. */
  docWriters: null,       // { rename, describe } une fois le schéma chargé, sinon null
  fieldErrors: {},        // le dernier refus de rename/describe, par champ ({name, gender, alignment, campaign})
  pendingStack: null      // "srd" pendant qu'une confirmation de passage à SRD est en attente, sinon null
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
  const out = verbs.rebuild({ document: state.document });
  state.document = out.document;
  state.decisions = out.decisions || [];
  state.resolved = out.resolved;
  state.report = out;
  state.violations = verbs.validate({ document: state.document }).violations || [];
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
function applyLayerStack(value) {
  const layersVerbs = state.engine.layers.verbs;
  for (const id of FH_LAYER_IDS) {
    if (value === "srdfh") layersVerbs.enable({ id }); else layersVerbs.disable({ id });
  }
  state.document = { ...state.document, build: { ...state.document.build, layers: [] } };
  rebuild();
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
    render();
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
    render();
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
    if (currentStack(state.document) === action.value) { render(); return; } // déjà cette pile : rien à faire
    const needsConfirm = action.value === "srd" && fhRefChoicesPresent(state.document);
    if (needsConfirm) {
      state.pendingStack = "srd";
      render();
      return;
    }
    applyLayerStack(action.value);
    render();
    return;
  }
  if (action.kind === "confirmLayerStack") {
    applyLayerStack("srd");
    state.pendingStack = null;
    render();
    return;
  }
  if (action.kind === "cancelLayerStack") {
    /* Annuler NE TOUCHE RIEN — même loi que Class (lot 46, `confirm.mjs`
       en tête) : aucun verbe, aucune mutation du document ni de la pile
       montée dans `layers`. */
    state.pendingStack = null;
    render();
    return;
  }
  /* LOT 45 — DEUX GESTES QUI NE TOUCHENT JAMAIS LE DOCUMENT, traités ICI et
     RENDUS AVANT tout appel de verbe : `roll` régénère le lot de dix dés
     (`state.abilityRoll`), `destinyMode` bascule l'onglet Destinée
     (`state.destinyMode`) — ni l'un ni l'autre n'est un choix `fh-char/1`
     (voir l'en-tête de `abilities-step.mjs`/`destiny-step.mjs`). Aucun
     `rebuild()` : rien dans le document n'a changé. */
  if (action.kind === "roll") {
    /* LOT 50, §2b — un nouveau lot (premier tirage OU relance) remet TOUTE
       la carte d'assignation à `null` : relancer invalide l'assignation
       précédente, `rerollCount` (dans `rollAbilitySet`) dit déjà au joueur
       quand ça arrive. `emptyAbilityAssign()` vient d'`abilities-step.mjs`
       — jamais une seconde liste de six clefs recopiée ici. */
    state.abilityRoll = { ...rollAbilitySet(Math.random), assign: emptyAbilityAssign() };
    render();
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
    render();
    return;
  }
  if (action.kind === "destinyMode") {
    state.destinyMode = action.value;
    render();
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
    render();
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
    render();
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
    render();
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
    render();
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
  render();
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

/* ── LE REPÈRE DE PROGRESSION ─────────────────────────────────────────
   PAS un bandeau de fiche : il ne montre aucune valeur du personnage, que
   des étapes et leur statut de navigation (fait / courante / à venir). */
function renderBelt() {
  const belt = el("nav", "belt");
  belt.setAttribute("aria-label", "Character creation steps");
  STEPS.forEach((step, index) => {
    const item = button(
      "",
      () => { state.step = index; render(); }
    );
    item.className = "belt-item";
    item.dataset.status = index < state.step ? "done" : index === state.step ? "current" : "upcoming";
    item.setAttribute("aria-current", index === state.step ? "step" : "false");
    item.innerHTML = `<span class="belt-index">${index}</span><span class="belt-label">${step.label}</span>`;
    belt.append(item);
  });
  return belt;
}

function renderToggle() {
  return el("div", "toggle-bar", [
    button(state.planOpen ? "Hide plan" : "Show plan",
      () => { state.planOpen = !state.planOpen; render(); })
  ]);
}

function renderStage() {
  const step = STEPS[state.step];
  const card = el("section", "decision-card");
  const heading = el("h1", null, [document.createTextNode(step.label)]);
  card.append(heading);

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
  } else if (step.id === "class" && state.engine) {
    card.append(renderClassStep({
      decisions: state.decisions,
      query: state.engine.layers.verbs.query
    }, applyDecisionAction));
  } else if (step.id === "class" && state.engineError) {
    card.append(el("p", "placeholder", [document.createTextNode(
      "Engine failed to load: " + state.engineError)]));
  } else if (step.id === "class") {
    card.append(el("p", "placeholder", [document.createTextNode("Loading the engine…")]));
  } else if (step.id === "species" && state.engine) {
    card.append(renderSpeciesStep({
      decisions: state.decisions,
      query: state.engine.layers.verbs.query
    }, applyDecisionAction));
  } else if (step.id === "species" && state.engineError) {
    card.append(el("p", "placeholder", [document.createTextNode(
      "Engine failed to load: " + state.engineError)]));
  } else if (step.id === "species") {
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
      query: state.engine.layers.verbs.query
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
      rollBatch: state.abilityRoll
    }, applyDecisionAction));
  } else if (step.id === "abilities" && state.engineError) {
    card.append(el("p", "placeholder", [document.createTextNode(
      "Engine failed to load: " + state.engineError)]));
  } else if (step.id === "abilities") {
    card.append(el("p", "placeholder", [document.createTextNode("Loading the engine…")]));
  } else if (step.id === "destiny" && state.engine) {
    card.append(renderDestinyStep({
      document: state.document,
      resolved: state.resolved,
      query: state.engine.layers.verbs.query,
      mode: state.destinyMode,
      onModeChange: (id) => applyDecisionAction({ kind: "destinyMode", value: id })
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
    card.append(renderEquipmentStep({
      document: state.document,
      resolved: state.resolved,
      query: state.engine.layers.verbs.query
    }, applyDecisionAction));
  } else if (step.id === "equipment" && state.engineError) {
    card.append(el("p", "placeholder", [document.createTextNode(
      "Engine failed to load: " + state.engineError)]));
  } else if (step.id === "equipment") {
    card.append(el("p", "placeholder", [document.createTextNode("Loading the engine…")]));
  } else if (step.id === "review" && state.document && state.report) {
    /* LOT 40 — §3a. `render()` rend une CHAÎNE, jamais recalculée : la loi
       que ses 27+8 tests gardent (« un total menteur s'affiche MENTEUR »)
       tient tant que ce module ne fait qu'AFFICHER `state.document`/
       `state.report`, sans y toucher. Mots en anglais (§3b) : c'est la
       langue du builder, pas celle par défaut de `render()`. */
    const fiche = el("div", "review-fiche", []);
    fiche.innerHTML = renderFiche(state.document, state.report, "en");
    card.append(fiche);
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

  const nav = el("div", "stage-nav", [
    button("Back", () => { state.step = Math.max(0, state.step - 1); render(); }, state.step === 0),
    /* LOT 55 — §1 de la commande : SUR REVIEW IL N'Y A PAS DE PAS SUIVANT,
       donc pas de bouton d'avance — même geste que `Back` ci-dessus, désactivé
       à l'AUTRE bout de la ceinture (`state.step === 0`). Avant ce lot, la
       condition du LIBELLÉ et la condition du SAUT étaient la même expression
       (`state.step === STEPS.length - 1`), qui coïncidait avec `REVIEW_INDEX`
       PAR LA LONGUEUR du tableau (lot 40, commentaire au-dessus de `STEPS`) :
       sur Review, le bouton affichait « Open the sheet » et remettait
       `state.step` À SA PROPRE VALEUR — un clic qui ne fait rien, zéro erreur
       en console (mesuré dans le navigateur, commande §1).
       ⛔ Toujours PAR `REVIEW_INDEX` (trouvé par id), jamais par
       `STEPS.length - 1` (une coïncidence de position) : c'est la loi que le
       lot 40 posait déjà sans la voir appliquée jusqu'ici. La sauvegarde et
       l'export appartiennent au bloc `doc`, pas à ce lot — ce bouton
       n'invente aucune destination : il s'arrête, honnêtement, à Review. */
    button(state.step === REVIEW_INDEX ? "Open the sheet" : "Continue",
      () => { state.step = Math.min(REVIEW_INDEX, state.step + 1); render(); },
      state.step === REVIEW_INDEX)
  ]);
  return el("main", "stage", [renderToggle(), card, nav]);
}

/* ── LE PLAN ESCAMOTABLE ──────────────────────────────────────────────
   Desktop : colonne. Téléphone : surface temporaire plein écran. Même
   contenu, même verbes des deux côtés — jamais un second builder. */
function renderPlan() {
  const aside = el("aside", "plan");
  aside.setAttribute("aria-label", "Decision plan");
  aside.hidden = !state.planOpen;

  const header = el("div", "plan-header", [el("h2", null, [document.createTextNode("Plan")])]);
  header.append(button("Close", () => { state.planOpen = false; render(); }));

  const list = el("ol", "plan-list");
  STEPS.forEach((step, index) => {
    const li = document.createElement("li");
    li.dataset.status = index < state.step ? "done" : index === state.step ? "current" : "upcoming";
    li.textContent = step.label;
    list.append(li);
  });

  aside.append(header, list);
  return aside;
}

function renderScrim() {
  const scrim = el("div", "scrim");
  scrim.addEventListener("click", () => { state.planOpen = false; render(); });
  return scrim;
}

/* La garantie qui rend la molette sûre (bible §4) : l'étape courante
   REVIENT dans le champ à chaque changement d'étape, sinon la ceinture
   peut cacher le cran allumé — la seule chose qu'elle existe pour montrer.
   `scrollIntoView` évite le piège connu de `offsetLeft` (il remonte au
   premier parent positionné) : le navigateur calcule le centrage lui-même,
   rien à mesurer à la main. `block: "nearest"` empêche un défilement
   VERTICAL parasite sur desktop, où la ceinture n'a jamais besoin de
   défiler — `inline: "center"` n'agit que si elle déborde horizontalement.
   La vitesse (animée ou instantanée) suit `--bp-hint`-independent
   `scroll-behavior` posé en CSS, qui obéit déjà à `prefers-reduced-motion`. */
function recenterBelt() {
  const current = app.querySelector('.belt-item[data-status="current"]');
  if (current) current.scrollIntoView({ inline: "center", block: "nearest" });
}

function render() {
  app.dataset.plan = state.planOpen ? "open" : "closed";
  app.innerHTML = "";
  const nodes = [renderBelt(), renderStage(), renderPlan()];
  if (isMobile() && state.planOpen) nodes.push(renderScrim());
  app.append(...nodes);
  recenterBelt();
}

window.addEventListener("resize", render);
render();

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
  render();
})();
