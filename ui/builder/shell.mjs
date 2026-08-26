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

import { bootEngine, loadExampleDocument, loadDocSchema } from "./engine.mjs?v=329";
import { swapContent, keepInView, watchSnap, mountChevrons } from "./socle.mjs?v=329";
import { mountPopup } from "./popup.mjs?v=329";
import { renderLorePanel } from "./lore.mjs?v=329";
import { nomDeFichier, renderReviewStep, reviewValidate } from "./review-step.mjs?v=329";
/* ⭐ LE VOYANT DU BELT LIT LA SIGNATURE DU JOUEUR, plus le carnet — voir
   `paintBelt`. `etapeFaite` reste l'organe de Review et n'est plus importé
   ici : deux réponses à deux questions différentes, chacune chez elle. */
import { estConfirme, refusDuDone, etatDeLEtape, etapeAchevee, itemsDeLEtape, ETAT } from "./parcours.mjs?v=329";
import { renderGuideSpecifique, renderItem as renderItemDalle, renderBilan, renderGuideGeneral } from "./parcours-ecrans.mjs?v=329";
import {
  tutorielActif, setTutorielActif, generalVu, setGeneralVu,
  guideVu, setGuideVu,
  renderTutorielGeneral, renderTutorielSpecifique, renderPointInterrogation
} from "./tutoriel.mjs?v=329";
/* ⭐ LA MÉMOIRE DU NAVIGATEUR (2026-08-20) — elle n'est PAS l'export disque.
   Celle-ci reprend là où on en était ; `fichier.mjs` sort une copie qui
   survit au nettoyage du navigateur. Voir la tête de `memoire.mjs`. */
import { lirePersonnage, ecrirePersonnage } from "./memoire.mjs?v=329";
/* ⭐ 2026-08-20 — la coquille rend UN écran de choix : les deux langues de
   l'Héritage. Ce n'est pas une entorse à « la coquille ne dessine pas » : le
   parcours de l'Inheritance vit ICI (elle n'a pas de catalogue), et son
   `itemCorps` y est déjà. */
import { planAt, planSlots } from "./carnet.mjs?v=329";
import { renderChoixGlisses } from "./glisser.mjs?v=329";
import { renderConceptStep } from "./concept-step.mjs?v=329";
import { renderUniverseStep, currentStack, fhRefChoices, FH_LAYER_IDS } from "./universe-step.mjs?v=329";
import { renderSkillsStep, renderSkillsBar, skillsCategories, skillsValidate, skillsRefusalWord } from "./skills-step.mjs?v=329";
import {
  catalogueCursor, catalogueValidate, renderCatalogueRail, renderCatalogueCards, recordName
} from "./catalogue.mjs?v=329";
import { CLASS_CATALOGUE, renderClassCardBody, renderClassChoices, classPalier2 } from "./class-step.mjs?v=329";
import { SPECIES_CATALOGUE, renderSpeciesCardBody, renderSpeciesChoices, speciesPalier2 } from "./species-step.mjs?v=329";
import { renderInheritanceStep, inheritanceValidate, renderFeatCardBody, renderBoostGlisse,
  renderFeatListScreen, featListPlan,
  renderFeatSpellsScreen, featSpellsDone } from "./inheritance-step.mjs?v=329";
import { renderAbilitiesStep, emptyAbilityAssign, abilitiesValidate, lotSansDes } from "./abilities-step.mjs?v=329";
/* ⭐ L'ORDRE SRD des six clefs — c'est lui qui donne son créneau à chaque
   caractéristique en `FREE` (voir `abilityFreeDirect`). Lu au moteur, jamais
   recopié : une seconde liste de six clefs finirait par diverger. */
import { ABILITY_KEYS } from "../../src/build/index.mjs?v=329";
import {
  renderDestinyStep, renderArcanaCardBody, destinyValidate, currentArcanaId, drawArcana
} from "./destiny-step.mjs?v=329";
import { renderEquipmentStep, equipmentValidate, currentCurrency, nextGearIndex, INHERITED_PURSE_GP } from "./equipment-step.mjs?v=329";
/* le panier du document — mêmes lecteurs que les écrans, jamais une copie */
import { currentCartLines, nextCartIndex } from "./equipement-pipeline.mjs?v=329";
import { CURRENCY_KEYS } from "../../src/build/index.mjs?v=329";
/* LOT 54, §1 — PAS `createDoc` : ce bloc refuse de se construire sans
   magasin, et le navigateur n'en a aucun (voir la tête de
   `src/doc/store.mjs` et `universe-step.mjs`). `createDocWriters` est
   PUR — ni magasin ni bus — importé directement de `writers.mjs`, jamais
   via `src/doc/index.mjs` (qui, lui, importe `store.mjs` et donc
   `node:crypto` : un import que le navigateur ne sait pas résoudre). */
import { createDocWriters } from "../../src/doc/writers.mjs?v=329";
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
import { injecte, render as renderFiche } from "../../src/tools/render-fiche.mjs?v=329";
/* `canonical.mjs` et pas `serialize.mjs` : le second importe `node:crypto`
   pour `digest` (même piège que `store.mjs` ci-dessous). Le premier est le
   corps de `toBytes`, sorti au lot 67 exactement pour cette page. */
import { canonicalText } from "../../src/doc/canonical.mjs?v=329";
import { ouvrirOnglet, telecharger } from "./fichier.mjs?v=329";
/* Lot 75 — la coquille est un chargement d'EXÉCUTION : elle doit porter la
   version du graphe comme les imports, sinon le cache peut servir la
   coquille d'avant avec un moteur neuf. Voir la tête de `version.mjs`. */
import { versionQuery } from "./version.mjs?v=329";

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
/* ⭐ L'ORDRE DE CRÉATION, ARRÊTÉ PAR ERIC LE 2026-08-18 — et c'est le MÊME que
   celui des chapitres du site. C'est toute l'idée : un seul ordre, parcouru
   deux fois — une fois qu'on le FAIT ici, une fois qu'on le LIT là-bas. Les
   chapitres cessent d'avoir leur ordre à eux.

   ⚠️ CE QUI A BOUGÉ, et le mouvement n'est pas cosmétique : **Abilities passe
   de la 2ᵉ à la 6ᵉ place**. On lançait les dés avant de savoir qui on est ;
   on choisit désormais espèce, héritage, destinée et classe AVANT de connaître
   ses scores. Species monte de 3 à 2, Inheritance de 5 à 3, Class de 6 à 5.

   ⛔ ET RIEN ICI N'EST LU PAR POSITION. Tout le pli travaille sur `id`
   (`STEPS[state.step].id === "skills"`, `findIndex(id === "review")`) ; seul
   l'enchaînement `state.step + 1` suit le tableau, et c'est exactement ce qui
   devait changer. Réordonner cette liste réordonne le parcours, rien d'autre.

   📌 LES DEUX BOUTS NE SONT PAS DES ÉTAPES (voir `mountFrame`) : le premier et
   le dernier sortent de la ceinture et deviennent des onglets.

   ⭐ ET ILS N'ONT QU'UN SEUL NOM CHACUN — corrigé le 2026-08-19, quand Eric a
   dit ce qu'ils CONTIENNENT :

     Menu  — retour au menu · réglages d'interface et de connexions · le site
             Fate's Hand · les réglages du MJ
     Sheet — l'état d'avancement ET la vérification des fichiers, en même
             temps · les fonctions d'export · le mode expert · l'accès à la
             fiche interactive

   « Settings » était donc faux : c'est un MENU qui contient des réglages, pas
   des réglages. Et « Character » désigne le CHAPITRE du site, pas cet écran-ci
   — l'écran montre l'état d'un dossier, le chapitre explique un personnage.
   Deux noms pour un écran est un défaut ; deux noms pour deux choses n'en est
   pas un. */
const STEPS = [
  { id: "universe",   label: "Menu" },       // ⟵ « Universe & Layers », puis « Settings »
  { id: "concept",    label: "Identity" },   // ⟵ « Biography » — Eric, 2026-08-18
  { id: "species",    label: "Species" },
  { id: "background", label: "Inheritance" }, // LOT 42, §3d — l'arrière-plan n'existe plus en Fate's Hand ; le libellé change seul
  { id: "destiny",    label: "Destiny" },
  { id: "class",      label: "Class" },
  { id: "abilities",  label: "Abilities" },
  { id: "skills",     label: "Skills" },
  { id: "equipment",  label: "Equipment" }, // LOT 49 — le paquet de la classe (une phrase, affichée telle quelle) + la bourse
  { id: "review",     label: "Sheet" }      // ⟵ « Review » — le CHAPITRE, lui, s'appelle Character
];
/* LOT 40 — trouvé PAR l'id, jamais par la position. `STEPS.length - 1`
   désigne le même index aujourd'hui (review est le dernier pas de la
   ceinture), mais le bouton final (§3c) doit mener à Review PARCE QUE c'est
   Review, pas parce qu'un index de tableau coïncide avec elle. */
const REVIEW_INDEX = STEPS.findIndex((step) => step.id === "review");

/** LES SIX ÉCRANS QUI LISENT `resolved` — la fiche dérivée. Ils sont nommés
 *  ici, une fois, parce qu'ils partagent une seule chose : ils n'ont rien à
 *  dessiner tant que le personnage n'est pas dérivable (voir `rebuild()`).
 *  ⚠️ Cette liste se lit dans les six branches ci-dessous : celles qui
 *  passent `resolved: state.resolved` à leur écran, et elles seules. */
const ECRANS_QUI_LISENT_LA_FICHE = new Set([
  "background", "abilities", "destiny", "skills", "equipment", "review"
]);

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
  /* Le refus de `derive` quand le personnage n'est PAS DÉRIVABLE — pas une
     panne, un état de création (voir `rebuild()`). `null` le reste du temps. */
  derivationImpossible: null,
  /* ⭐ CE QUE LA MÉMOIRE DU NAVIGATEUR A RÉPONDU — `{ok:true}` ou
     `{ok:false, raison}`. L'écran Menu le DIT au joueur : « gardé dans ce
     navigateur », ou pourquoi il ne l'est pas.
     ⛔ Un builder qui ne sauvegarde pas en silence est pire que celui d'hier,
     qui ne sauvegardait pas du tout — hier le joueur le savait. */
  memoire: { ok: true },
  /* ⚠️ ET CELUI-CI NE SE TAIT JAMAIS : un personnage ÉTAIT gardé, et il était
     inutilisable. Il survit à la première sauvegarde réussie — sinon le joueur
     repartirait de l'exemple sans jamais apprendre qu'il a perdu quelque
     chose, ce qui est le repli silencieux que la loi §0.5 interdit. */
  memoireIgnoree: null,
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
  /* ⛔ `equipmentCategory` ET `equipmentSearch` ONT DISPARU LE 2026-08-23 :
     la molette et la loupe qu'ils pilotaient ne sont plus à l'écran. Un état
     que personne ne lit est un état qui ment sur ce que l'écran sait faire. */
  /* ⛔ `rollingMethod` A DISPARU AU LOT 80 : `FH 3D6` et `4D6` ne sont plus
     une molette DANS la méthode « Roll dice », ce sont deux TUILES du
     sélecteur (croquis du 16/08). Un choix, plus deux. */
  abilityInfo: false,    // le panneau INFO (§5.4) — un interrupteur d'écran, jamais un champ
  /* LOT 82 — LE PANNEAU DE LORE, croquis A : *« lore sends to full page
     description »*. Un interrupteur d'écran de plus, de la même famille que
     `abilityInfo` et `inheritanceOpen` : il ne touche pas le document, il
     meurt avec l'onglet, et il vit HORS du DOM pour survivre au
     remplacement du contenu (SOCLE.md).
     ⭐ Il porte le RECORD (`{kind, id}`) et pas un booléen : deux écrans à
     fiche l'emploient, et douze fiches chacun. Un drapeau ne dirait pas
     laquelle on lit. */
  /* LE PARCOURS D'ÉTAPE (Eric, 2026-08-19) — `{ racine, path }` quand une dalle
     d'item est ouverte, sinon null. C'est le cran le PLUS INTÉRIEUR du retour :
     un item vit dans un guide, qui vit dans un palier, qui vit dans une étape. */
  parcoursItem: null,
  /* Les chemins que le dernier `Done` de guide a REFUSÉS, ou null. Il n'existe
     qu'APRÈS un refus : annoncer d'avance ce qui manque ferait de la liste un
     reproche. */
  parcoursRefus: null,
  lore: null,            // { kind, id } — le record dont on lit la prose, ou null
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
/* ══ QUAND LA DÉRIVATION EST IMPOSSIBLE — 2026-08-20 ═══════════════════════
   🔴 MESURÉ DANS LA PAGE, PAS DANS UN TEST : `I changed my mind` sur l'étape
   Class ne faisait RIEN. La cause, à l'octet — `parcoursCancel` efface le
   choix `class`, appelle `rebuild()`, et `derive` JETTE (*« un personnage sans
   classe n'est pas une dérivation incomplète, c'est une dérivation
   impossible »*). Le jet remonte dans l'écouteur de clic : `refresh()` n'est
   jamais atteint, l'écran reste figé sur la classe qu'on vient de quitter, et
   plus AUCUN geste ne repasse ensuite — le document est resté sans classe.
   ⚠️ Species n'en souffrait pas, et ce n'est pas un hasard : `derive` accepte
   un personnage sans espèce, jamais sans classe. Une seule étape sur huit
   pouvait tomber dans ce trou, et c'est celle-là.

   ⛔ ON NE DÉSARME PAS LE REFUS DE `derive` — il a raison, et la loi du dépôt
   est qu'un garde qui gêne se RÉÉCRIT à la nouvelle vérité. La nouvelle vérité
   est ici : **un personnage en cours de création n'est pas toujours
   dérivable**, et la coquille doit savoir le porter. C'est exactement l'état
   dans lequel un personnage NEUF arrivera le jour où on en ouvrira un (la page
   part aujourd'hui d'un exemple complet — c'est ce qui a caché le trou).

   ⭐ CE QU'ON GARDE QUAND MÊME : le CARNET. `verbs.decisions` le projette sans
   dériver, donc l'étape Class retrouve ses douze fiches — c'est-à-dire le
   moyen de RÉPARER l'état où l'on est. Ce qu'on perd est la fiche dérivée, et
   on le perd franchement : `resolved` et `report` passent à `null` plutôt que
   de laisser traîner ceux de la classe abandonnée. */
function rebuild() {
  const verbs = state.engine.build.verbs;
  const avant = state.violations.map((v) => v.key + (v.path || "")).join("|");
  let out;
  try {
    out = verbs.rebuild({ document: state.document });
  } catch (error) {
    /* ⚠️ SEULEMENT LES REFUS DU MOTEUR. Une TypeError de la coquille doit
       continuer de casser bruyamment : l'avaler ferait exactement le « faux
       magasin » que ce dépôt interdit. */
    if (!error || error.name !== "BuildError") throw error;
    state.derivationImpossible = error.message;
    state.decisions = verbs.decisions({ document: state.document }).decisions || [];
    state.resolved = null;
    state.report = null;
    /* ⛔ PAS DE `validate` ICI : il juge `document.resolved`, qui est la
       tranche de l'ancienne classe. Valider une fiche qui n'existe plus
       produirait des refus sur un personnage que personne ne joue. */
    state.violations = [];
    return;
  }
  state.derivationImpossible = null;
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
  state.popup = { titre: quoi, role: "gendarme", texte: `This did not work: ${cause}\n\nNothing was written, and your character is untouched.` };
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
      state.fieldErrors = { ...state.fieldErrors, name: motDuRefus(error, action.name, "name") };
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
      state.fieldErrors = { ...state.fieldErrors, [action.field]: motDuRefus(error, action.value, action.field) };
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
    /* 🔴 REVENIR À LA RACINE N'INTERROMPT RIEN — Eric, 2026-08-16, mot pour
       mot : *« à cette racine je n'interromps rien en revenant en arrière »*.
       ⛔ ET CE N'ÉTAIT PAS VRAI QUAND IL L'A DIT. Cette action remettait le
       lot à zéro À CHAQUE clic de tuile, y compris quand la tuile était CELLE
       QU'ON VENAIT DE QUITTER : `BACK` puis `FREE` effaçait les dés déjà
       posés, en silence, et le joueur repartait d'une palette vide sans
       comprendre ce qu'il avait perdu. Sa phrase décrivait l'intention ; le
       code faisait l'inverse.
       ⭐ LE REMÈDE EST DE NE RIEN FAIRE QUAND RIEN NE CHANGE : seul un
       CHANGEMENT de méthode jette le lot — et c'est légitime, un lot de dés
       n'a aucun sens dans une autre méthode. Rouvrir la même page retrouve
       son état intact. */
    const memeMethode = state.abilityMethod === action.value;
    if (!memeMethode) {
      state.abilityMethod = action.value;
      /* ⚠️ `abilities.mode` RESTE ÉCRIT AU DOCUMENT, comme au lot 45. Aucune
         règle ne le consomme (Review le classe dans « player choices no rule
         consumed »), mais c'est un champ du schéma que le joueur a rempli :
         cesser de l'écrire serait perdre une intention en silence. */
      state.document = state.engine.build.verbs
        .set({ document: state.document, path: "abilities.mode", value: action.value }).document;
      rebuild();
      /* ⭐ LES DEUX MÉTHODES SANS DÉS POSENT LEUR LOT D'EMBLÉE — `ARRAY`
         (six valeurs fixes) et `FREE` (seize valeurs, un vivier inépuisable).
         Elles passent par la MÊME machinerie d'affectation que les deux
         méthodes à dés : c'est tout l'intérêt de l'entonnoir unique.
         ⛔ C'est `abilities-step.mjs` qui sait lequel — jamais un `if` sur un
         id ici (`lotSansDes`). */
      state.abilityRoll = lotSansDes(action.value);
      state.abilityRevele = 0;
    }
    /* 🔴 CHOISIR UNE MÉTHODE OUVRE SA PAGE — Eric, 2026-08-16 : *« on arrive
       sur FREE quand on clique sur le bouton FREE, qui est une AUTRE page »*.
       C'est un PALIER, pas un état d'écran : `BACK` le redescend tout seul
       (`pressBack`), et `goToStep` le remet à 1 en arrivant sur l'étape, donc
       on retrouve toujours le choix des méthodes en revenant.
       ⛔ Et le palier s'avance ICI plutôt que par `pressDone` : le geste du
       joueur est la TUILE, pas le bouton de sortie. `pressDone` garde son
       enchaînement (I.4) ; il n'y a toujours qu'un propriétaire par porte. */
    state.palier = 2;
    openSurface();
    return;
  }
  /* ⭐ LE PANNEAU INFO (§5.4 du lot 80) — un interrupteur d'ÉCRAN, jamais un
     champ : il ne touche pas le document, et il meurt avec l'onglet. Il ne
     redessine pas la surface non plus (`refresh`, pas `openSurface`) :
     ouvrir un panneau n'est pas arriver sur un écran neuf, et renvoyer le
     joueur en haut lui ferait perdre l'endroit qu'il regardait. */
  if (action.kind === "abilityInfo") {
    state.abilityInfo = Boolean(action.value);
    refresh();
    return;
  }
  /* ⭐ LE PANNEAU DE LORE (lot 82) — et il appelle `openSurface`, PAS
     `refresh`, contrairement au panneau INFO juste au-dessus. Les deux
     gestes sont différents : INFO déplie une explication à côté de ce qu'on
     regardait, le lore REMPLACE la scène par une page de deux cents mots. On
     arrive donc sur une surface neuve, et on doit arriver EN HAUT — sinon la
     page s'ouvre au milieu d'un paragraphe, à la hauteur où le catalogue
     était resté. Le retour repart en haut lui aussi, pour la même raison. */
  if (action.kind === "lore") {
    state.lore = action.ref || null;
    openSurface();
    return;
  }
  /* ══ LE SEUL GESTE PROPRE À `FREE` : LA PALETTE POSE SUR UNE CARAC ═══════
     TRANCHÉ PAR ERIC, 2026-08-16 : sa page FREE a DEUX dalles — la FF1
     (explication + palette) et, dessous, celle qui contient la ZONE DE
     RÉCEPTION. Pas d'étape intermédiaire : on glisse de la palette aux six
     caractéristiques.

     ⭐ POURQUOI CE VERBE EXISTE, ET POURQUOI IL EST LE SEUL. `assignAbilityRoll`
     suppose qu'un dé EXISTE déjà dans le lot et qu'on lui donne une clef ; ici
     la valeur NAÎT du geste — elle n'est nulle part avant qu'on la lâche. Ce
     bloc fait donc les deux d'un coup : il inscrit la valeur dans le créneau
     de cette clef (hors document, il meurt avec le lot) ET la pose au document
     par le `set` ORDINAIRE, celui que les trois autres méthodes empruntent
     déjà. Aucun champ nouveau, aucune règle nouvelle — c'est la saisie
     manuelle avec la peau du glisser-déposer, comme le §4.4 l'annonçait.

     ⛔ ET RECOUVRIR REMPLACE, là où les trois autres ÉCHANGENT (§5.3,
     divergence VOULUE) : un échange n'a de sens qu'entre dés en nombre fini.
     Ici le vivier est inépuisable, il n'y a rien à rendre.
     📌 Le créneau d'une clef est son RANG (`str` → 0, `dex` → 1, …) : chaque
     caractéristique a le sien, donc deux ne peuvent jamais se disputer un
     index — et le piège du §4.4 (« deux caracs, la même valeur ») ne se pose
     pas, puisque ce sont deux créneaux distincts. */
  if (action.kind === "abilityFreeDirect") {
    const lot = state.abilityRoll;
    if (!lot) return;
    const creneau = ABILITY_KEYS.indexOf(action.key);
    if (creneau < 0) return;
    state.abilityRoll = {
      ...lot,
      rolls: lot.rolls.map((r) => (r.index === creneau ? { ...r, total: action.value } : r)),
      assign: { ...(lot.assign || {}), [action.key]: creneau }
    };
    state.document = state.engine.build.verbs
      .set({ document: state.document, path: `abilities.${action.key}`, value: action.value }).document;
    rebuild();
    refresh();
    return;
  }
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
  /* ⛔ L'ACTION `roll` A DISPARU AU LOT 80, ET AVEC ELLE LE DERNIER JETEUR
     CONCURRENT. Elle servait le bouton `Roll` des pastilles plates de `4d6`,
     seul organe que le plateau ne savait pas rendre. Le plateau sert
     désormais les DEUX mécaniques (`ROLLING_METHODS`, dice.mjs) et produit
     son lot lui-même : il ne reste qu'un jeteur, celui que le joueur presse.
     📌 C'est la deuxième fois que ce fichier perd un jeteur — le premier
     était le palier de `Validate` (lot 79). À chaque fois pour la même
     raison : deux propriétaires du même lot se contredisent au premier
     redessin. */
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
     écrans-là (voir `renderSortieEtape`, et le pied de `catalogue.mjs` pour
     les trois raisons).
     ⭐ LE CURSEUR EST POSÉ AVANT LA PORTE, et c'est le geste qui compte : le
     bouton pressé APPARTIENT à une fiche, et cette fiche-là connaît son
     index. Lire le curseur du spy à la place marcherait presque toujours —
     « presque » étant l'instant où le spy n'a pas relu (un volet masqué gèle
     `requestAnimationFrame`). Le doigt tranche, jamais l'observateur.
     ⛔ Aucun appel de verbe ici : `pressDone` possède l'enchaînement des
     paliers (I.4) et c'est LUI qui choisit — dupliquer sa logique donnerait
     deux propriétaires de la même porte, la faute que `rollBatch` a payée. */
  /* DONE — le dernier mot de la séquence Choose d'Eric (2026-08-18). Il
     traverse jusqu'à `pressDone()`, LE MÊME geste que le palier de
     `Validate` : le panneau ne sort pas par une seconde porte. */
  if (action.kind === "done") { pressDone(); return; }
  /* ══ LES QUATRE GESTES DU PARCOURS D'ÉTAPE (Eric, 2026-08-19) ═══════════
     Spec : vault `FH-WEB/FHPC/FHPCv2 parcours d'etape.md`. Ils sont écrits en
     vocabulaire de RACINE — « species », « class », « background » — et pas un
     seul nom d'étape n'est en dur : le jour où l'Inheritance les emploie, il
     n'y a rien à ajouter ici. */

  /* Ouvrir un item. Le retour et la signature sont dans `pressBack`/`pressDone`,
     là où l'emboîtement des crans est déjà écrit. */
  /* ══ LES TROIS GESTES DU TUTORIEL (Eric, 2026-08-19) ═══════════════════
     ⛔ AUCUN N'ÉCRIT DANS LE DOCUMENT : ce sont des préférences de lecteur,
     pas des faits du personnage (voir la tête de `tutoriel.mjs`). */
  if (action.kind === "tutoBascule") { setTutorielActif(Boolean(action.value)); refresh(); return; }
  if (action.kind === "tutoCompris") { setGeneralVu(true); refresh(); return; }
  if (action.kind === "tutoDesactiver") { setTutorielActif(false); refresh(); return; }
  /* ══ LE `?` OUVRE LE GUIDE DE L'ÉTAPE — §7, sorti du standby le 26/08 ═════
     Eric : *« le point d'entrée au guide `?` doit être fait par contre »*.
     Une aide OPTIONNELLE, en POPUP-parchemin (*« le guide est un popup, il ne
     vit jamais dans le flux »*), qu'on congédie d'un tap dehors.

     ⛔ IL NE BASCULE PLUS LA PRÉFÉRENCE DE TUTORIEL, et c'est un changement
     qu'il faut lire en entier. Ce geste faisait `setTutorielActif(true)` +
     `setGeneralVu(false)` — c'est-à-dire qu'il RALLUMAIT DE FORCE une
     préférence que le joueur venait peut-être d'éteindre, et qu'il rejouait le
     tutoriel d'accueil depuis le début. Mesuré à 360 : sur neuf écrans sur
     dix, ces deux écritures ne changeaient RIEN À L'ÉCRAN — seule Identity
     rend encore des dalles de tutoriel. Le `?` était donc un bouton qui, vu du
     joueur, ne faisait rien, et qui, vu du réglage, défaisait son choix.

     ✅ ET `Turn tutorials off` RESTE RÉVERSIBLE — la seconde moitié existe
     depuis le 19/08 : Menu › Tutorials, l'interrupteur de `universe-step.mjs`,
     nommé et trouvable. C'est lui le filet de sécurité, pas ce bouton-ci.
     Vérifié au rendu : l'interrupteur bascule On/Off et le tutoriel d'Identity
     revient avec lui.

     ⛔ ET IL N'OUVRE RIEN QUAND IL N'Y A RIEN — même garde que la pose du `?`
     dans `renderCard`, même lecteur (`guideDeLEtape`). Un `?` sans guide n'est
     pas censé exister ; s'il existait quand même, il ne mentirait pas deux
     fois. */
  if (action.kind === "tutoRouvrir") {
    const guide = guideDeLEtape();
    if (!guide) return;
    /* 🔴 VU AVANT MONTRÉ, ET DANS CET ORDRE. `refresh()` redessine le `?` :
       marquer après aurait laissé un parchemin plein au-dessus d'un guide
       ouvert, jusqu'au prochain redessin. L'aspect doit être vrai à l'instant
       où le joueur regarde. */
    setGuideVu(guide.etape);
    state.popup = { titre: guide.titre, role: "guide", texte: guide.texte };
    refresh();
    return;
  }

  if (action.kind === "parcoursItem") {
    state.parcoursRefus = null;
    /* 🔴 LE DON D'ORIGINE S'OUVRE EN ÉCRAN F, PAS EN DALLE — Eric,
       2026-08-20 : *« le choix des feats doit fonctionner comme les choix de
       species, même logique »*, *« il faut que ce soit du F1 pour les
       feats »*.
       ⭐ UN CATALOGUE NE TIENT PAS DANS UN ITEM. Il a un rail et des cartes de
       440 px : c'est un ÉCRAN, pas le contenu d'une dalle. Ouvrir cet item est
       donc un DÉPLACEMENT — on pose le catalogue et on laisse
       `catalogueCourant()` le rendre, exactement comme Species rend le sien.
       ⛔ Et on NE POSE PAS `parcoursItem` : les deux se disputeraient l'écran,
       et la coquille poserait une seconde paire de portes. */
    if (action.path === "background.originFeat[0]") {
      state.inheritanceOpen = "feat";
      state.palier = 1;
      openSurface();
      return;
    }
    state.parcoursItem = { racine: action.racine, path: action.path };
    openSurface();
    return;
  }

  /* Le `Done` du guide. ⛔ IL N'EST JAMAIS GRISÉ : s'il manque une signature,
     il REFUSE et NOMME — *« done lance un message et ne valide pas si tout
     n'est pas coché »*. Le message vit dans l'état, pas dans une alerte : une
     alerte se ferme et emporte l'information avec elle. */
  if (action.kind === "parcoursDone") {
    /* ⛔ LE REFUS NE COMPTE QUE CE QUI SE CHOISIT. Une ligne « gagné d'office »
       ne porte aucune signature — l'exiger bloquerait le `Done` pour toujours. */
    const refus = refusDuDone({
      decisions: state.decisions, document: state.document, racine: action.racine
    });
    /* 🔴 IL N'ÉCRIT PLUS RIEN DANS LE DOCUMENT — Eric, 2026-08-19 : *« il y a
       une double validation inutile »*. Il signait la racine ; le `Next` qui
       le remplaçait aussitôt demandait un second clic pour le même « oui ».
       Désormais c'est `Next` qui signe (voir plus bas), et ce bouton n'existe
       plus que dans l'état où il REFUSE. S'il n'a rien à refuser, il ne peut
       pas s'afficher : ce dernier `refresh` n'efface qu'un vieux message.
       ⭐ ET LA LOI DU MOTEUR TIENT : un seul écrivain pour une question. La
       signature de la racine avait deux prétendants pendant trois lignes ;
       elle n'en a plus qu'un. */
    state.parcoursRefus = refus ? refus.manquants : null;
    refresh();
    return;
  }

  /* `I changed my mind` — DEUX ORGANES, ET C'EST VOULU. Les signatures
     s'effacent par `revoke` (écrivain de document) ; les choix s'effacent par
     `clear` (verbe du bloc `build`, qui seul sait ce qu'un choix entraîne).
     Les fondre en un seul geste ferait écrire des règles à un écrivain qui
     n'en connaît aucune.
     ⚠️ ET LES DEUX BALAYENT LE MÊME PRÉFIXE : la racine et tout ce qui vit
     dessous. Une signature qui survivrait à son choix rallumerait un voyant
     sur un item vide. */
  if (action.kind === "parcoursCancel") {
    const racine = action.racine;
    const sous = (chemin) => chemin === racine ||
      chemin.startsWith(`${racine}.`) || chemin.startsWith(`${racine}[`);
    if (state.docWriters && state.document) {
      state.document = state.docWriters.revoke({ document: state.document, path: racine });
    }
    const verbs = state.engine && state.engine.build && state.engine.build.verbs;
    if (verbs && state.document) {
      const poses = (state.document.build && state.document.build.choices) || [];
      let document = state.document;
      /* La liste est FIGÉE avant la boucle : on efface pendant qu'on la lit. */
      for (const chemin of poses.map((c) => c && c.path).filter((c) => typeof c === "string" && sous(c))) {
        document = verbs.clear({ document, path: chemin, kind: "choice" }).document;
      }
      state.document = document;
      rebuild();
    }
    state.parcoursItem = null;
    state.parcoursRefus = null;
    state.palier = 1;
    openSurface();
    return;
  }

  /* `Next` — le bilan invite à continuer, et c'est le même pas que partout.
     🔴 ET C'EST LUI QUI SIGNE LA RACINE depuis le 19/08. Avancer EST la
     conclusion de l'étape : le `Done` qui la signait juste avant faisait
     répéter le même « oui » deux fois. La signature ne dit donc plus « tout
     est rempli » (ça, `etapeAchevee` le lit dans le carnet) mais « le joueur
     est reparti d'ici » — et c'est exactement ce qu'il faut savoir pour ne
     plus rien lui proposer à valider quand il revient. */
  if (action.kind === "parcoursNext") {
    if (state.docWriters && state.document && !estConfirme(state.document, action.racine)) {
      state.document = state.docWriters.confirm({ document: state.document, path: action.racine });
    }
    goToStep(state.step + 1);
    return;
  }

  /* ⭐ CHOISIR UNE LISTE DESCEND DANS SA BRANCHE — Eric, 2026-08-20 :
     *« Choose Arcane → BS1 »*, et sa correction du même jour : *« BSS le choix
     des sorts »*. Le geste est donc UN : on choisit la liste ET on entre dans
     ses sorts. Demander ensuite un `Done` pour descendre ferait deux clics pour
     une seule intention — la double validation que ce builder chasse partout.
     ⛔ L'ÉCRAN NE NAVIGUE PAS : il dit « cette branche est choisie », la
     coquille décide où ça mène (I.4, elle possède l'enchaînement des paliers). */
  if (action.kind === "brancheChoisie") {
    applyDecisionAction({ kind: "choose", path: action.path, ref: action.ref });
    if (currentGate(state.palier + 1).exists) { state.palier += 1; openSurface(); }
    return;
  }
  if (action.kind === "ficheChoose") {
    state.cursor = action.index;
    pressDone();
    return;
  }
  /* B9 — une ligne de Review mène à son écran. Voir qu'il manque quelque
     chose sans pouvoir y aller ferait de Review un constat, pas un
     récapitulatif. */
  /* ⛔ `equipmentCategory` et `equipmentSearch` ne sont plus dispatchées par
     personne depuis que la barre du haut de l'Équipement a dégagé (23/08). */
  if (action.kind === "goToStepId") {
    goToStep(STEPS.findIndex((step) => step.id === action.value));
    return;
  }
  if (action.kind === "popup") {
    /* §7 (26/08) — le RÔLE voyage avec l'état : guide (parchemin, défaut —
       il ne signale rien) · aiguilleur (bleu, il prévient) · gendarme
       (rouge, il dit l'erreur). La teinte vit en CSS, jamais ici. */
    state.popup = action.texte
      ? { texte: action.texte, titre: action.titre || null, role: action.role || "guide" }
      : null;
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
    /* ⭐ PIPELINE (24/08) — la POSITION d'une ligne : self | backpack | storage.
       Mesurée AVANT d'écrire : les verbes l'acceptent, zéro violation au
       rebuild. Facultative — les lignes d'avant ce champ se lisent
       « backpack » (rien n'est porté sans geste). */
    if (action.location) {
      document = verbs.set({ document, path: `gear[${index}].location`, value: action.location }).document;
    }
    state.document = document;
    rebuild();
    refresh();
    return;
  }
  /* PIPELINE (24/08) — DÉPLACER une ligne à l'intérieur du personnage :
     self ↔ backpack ↔ storage. `equipped` SUIT la position (porté = self),
     jamais l'inverse — une seule écriture de la vérité. */
  if (action.kind === "moveGearLine") {
    let document = state.document;
    document = verbs.set({ document, path: `gear[${action.index}].location`, value: action.location }).document;
    document = verbs.set({ document, path: `gear[${action.index}].equipped`, value: action.location === "self" }).document;
    state.document = document;
    rebuild();
    refresh();
    return;
  }
  /* PIPELINE (24/08) — PAYER : soustrait un coût de la bourse, les quatre
     clefs d'un coup. ⛔ REFUSE de produire un négatif — l'écran vérifie avant
     (`bourseCouvre`), ce garde-ci est la ceinture : si une clef manque, RIEN
     n'est écrit (jamais une bourse à moitié débitée). */
  if (action.kind === "payer") {
    const bourse = currentCurrency(state.document);
    const apres = {};
    for (const key of CURRENCY_KEYS) {
      apres[key] = (Number.isInteger(bourse[key]) ? bourse[key] : 0) - (action.cout[key] || 0);
      if (apres[key] < 0) { refresh(); return; }
    }
    let document = state.document;
    for (const key of CURRENCY_KEYS) {
      document = verbs.set({ document, path: `currency.${key}`, value: apres[key] }).document;
    }
    state.document = document;
    rebuild();
    refresh();
    return;
  }
  /* ══ LE PANIER AU DOCUMENT (24/08, « ok on fait le 2 ») — quatre gestes,
     même patron que gear : une suite de verbes, un rebuild, un refresh.
     Mesuré avant d'écrire : `cart[N]`/.quantity/.gratuit passent les verbes,
     zéro violation. `derive` ne lit pas `cart` — le panier n'est pas une
     possession, c'est une intention qui SURVIT avec le personnage. */
  if (action.kind === "cartAdd") {
    const lignes = currentCartLines(state.document);
    const deja = lignes.find((l) => l.ref && l.ref.id === action.ref.id);
    let document = state.document;
    if (deja) {
      document = verbs.set({ document, path: `cart[${deja.index}].quantity`, value: (deja.quantity || 1) + 1 }).document;
    } else {
      const index = nextCartIndex(document);
      document = verbs.choose({ document, path: `cart[${index}]`, ref: action.ref }).document;
      document = verbs.set({ document, path: `cart[${index}].quantity`, value: 1 }).document;
      document = verbs.set({ document, path: `cart[${index}].gratuit`, value: false }).document;
    }
    state.document = document;
    rebuild();
    refresh();
    return;
  }
  if (action.kind === "cartSetQuantity") {
    let document = state.document;
    if (action.quantity <= 0) {
      for (const suffix of ["", ".quantity", ".gratuit"]) {
        document = verbs.clear({ document, path: `cart[${action.index}]${suffix}`, kind: "choice" }).document;
      }
    } else {
      document = verbs.set({ document, path: `cart[${action.index}].quantity`, value: action.quantity }).document;
    }
    state.document = document;
    rebuild();
    refresh();
    return;
  }
  if (action.kind === "cartToggleFree") {
    const ligne = currentCartLines(state.document).find((l) => l.index === action.index);
    if (!ligne) { refresh(); return; }
    state.document = verbs.set({ document: state.document, path: `cart[${action.index}].gratuit`, value: !ligne.gratuit }).document;
    rebuild();
    refresh();
    return;
  }
  if (action.kind === "cartClear") {
    let document = state.document;
    for (const l of currentCartLines(document)) {
      for (const suffix of ["", ".quantity", ".gratuit"]) {
        document = verbs.clear({ document, path: `cart[${l.index}]${suffix}`, kind: "choice" }).document;
      }
    }
    state.document = document;
    rebuild();
    refresh();
    return;
  }
  /* LA DÉCISION DU DÉPART (26/08) — kit de classe OU 50 po. UNE écriture au
     document (`depart`, mesurée acceptée) ; « purse » enchaîne le geste des
     50 PO déjà ratifié (`addInheritedPurse`), jamais une seconde copie. */
  if (action.kind === "choisirDepart") {
    if (action.valeur !== "kit" && action.valeur !== "purse") { refresh(); return; }
    state.document = verbs.set({ document: state.document, path: "depart", value: action.valeur }).document;
    if (action.valeur === "purse") { applyDecisionAction({ kind: "addInheritedPurse" }); return; }
    rebuild();
    refresh();
    return;
  }
  /* PIPELINE (24/08) — LA BOURSE DE B3, une clef à la fois (les +/− du
     croquis). Plancher à zéro : une bourse n'a pas de dette. */
  if (action.kind === "setCurrency") {
    const valeur = Math.max(0, Math.trunc(action.value));
    if (!CURRENCY_KEYS.includes(action.key) || !Number.isFinite(valeur)) { refresh(); return; }
    state.document = verbs.set({ document: state.document, path: `currency.${action.key}`, value: valeur }).document;
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
    document: state.document, resolved: state.resolved, query: state.engine.layers.verbs.query
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
     carte et passe à l'étape suivante (voir `pressDone`). */
  /* Le don d'origine : UN palier (B4.4 — « une seule validation suffit »),
     donc `palier2` rend `null` et `Validate` ferme le panneau. */
  feat: {
    /* 🔴 `fiche: true` — C'EST ÇA, « DU F1 POUR LES FEATS ». Eric, 2026-08-20 :
       *« le choix des feats doit fonctionner comme les choix de species, même
       logique »*.
       📏 SANS LUI, MESURÉ À 360 px : la carte faisait **720 px** — la hauteur
       de sa rangée — au lieu de porter une dalle de 440. Et la cause n'était
       ni `--fiche-h` ni la hauteur de rangée (toutes deux correctes une fois
       ajoutées) : c'est ce DRAPEAU qui décide si la carte est enveloppée dans
       une `.fiche-dalle`, et cette dalle est la seule à porter la cote.
       ⚠️ TROIS ENDROITS POUR UNE MÊME COTE, et n'en corriger qu'un ne change
       rien : le conteneur porte `--fiche-h`, la carte porte la hauteur de sa
       rangée, la DALLE porte les 440. Je les ai réparés dans cet ordre en
       croyant chaque fois avoir fini. */
    path: "background.originFeat[0]", kind: "feat", label: "Origin feats", fiche: true,
    /* ⭐ CE CATALOGUE N'EST PAS UNE ÉTAPE, C'EST UN ITEM. Le finir rend au
       guide de l'Inheritance — où les bonus attendent encore leur signature —
       et signe le don au passage. Species et Class, elles, avancent d'une
       étape : c'est pour ça que la sortie se DÉCLARE ici. */
    fin: "close",
    /* 🔴 LES DEUX PORTES DE BS — Eric, 2026-08-20 : *« si je dis à BS "I changed
       my mind" je reviens à B pour rechoisir un feat ; si je dis à BS "Done",
       direction R pour valider la totalité »*.
       ⭐ Le retour de BS n'est donc PAS un recul : c'est un CHANGEMENT D'AVIS,
       et il porte le mot qui efface — parce qu'il efface vraiment. Les choix de
       l'ancien don (sa liste, ses sorts) n'ont plus d'objet dès qu'on repart en
       choisir un autre ; les garder ferait resurgir des sorts de Magicien sous
       un don qui n'en donne plus. */
    retourEfface: true,
    cardBody: renderFeatCardBody,
    /* ══ L'ARBRE DU DON, DANS LA NOMENCLATURE D'ERIC (2026-08-20, corrigée) ══
         R0  le menu racine de l'Inheritance — feat / bonus
          └ B    la liste des dons          (palier 1 de ce catalogue)
             └ BS   le choix de la LISTE de sorts   (palier 2)
                └ BSS  le choix des SORTS           (palier 3)
       ⛔ Ce vocabulaire est celui de l'ARBRE DES CHOIX, pas celui du canon
       (F/FF pour l'écran, carte/dalle/tuile pour l'objet). Une branche n'est
       pas un cadre. */
    /* BS — il EXISTE si le don choisi porte une branche. Il est PRÊT quand
       TOUT le don est rempli (la liste ET les sorts) : son `Done` est celui qui
       remonte à R0 et signe l'item, et signer un don à moitié posé serait dire
       « c'est fait » sur un magasin vide. */
    palier2: (decisions) => {
      const plan = featListPlan(decisions);
      if (!plan) return null;
      return { ready: plan.answered >= plan.expected && featSpellsDone(decisions), plan };
    },
    /* BSS — il n'existe QUE quand la liste est choisie : avant, il n'y aurait
       aucun sort à proposer. Il est PRÊT quand les créneaux sont remplis, et
       son `Done` REMONTE à BS, où le bilan vient de se remplir. */
    palier3: (decisions) => {
      const plan = featListPlan(decisions);
      if (!plan || plan.answered < plan.expected) return null;
      return { ready: featSpellsDone(decisions) };
    },
    /* ⭐ UNE SEULE FONCTION POUR LES DEUX CRANS, et c'est le palier qui décide —
       pas le contenu. BS demande la liste, BSS demande les sorts. */
    choices: (ctx, act) => (ctx.palier === 3
      ? renderFeatSpellsScreen({ decisions: ctx.decisions, query: ctx.query }, act)
      : renderFeatListScreen({ decisions: ctx.decisions, query: ctx.query, featId: choixDeDon() }, act))
  },
  destiny: {
    path: "fh.destiny.arcana", kind: "arcana", label: "Major Arcana",
    cardBody: renderArcanaCardBody, choices: () => el("div", "catalogue-choices"), palier2: () => null
  }
};
/* ══ B0 — LE 2ᵉ PALIER DU CATALOGUE DES DONS ═════════════════════════════
   📐 L'arborescence d'Eric (2026-08-20) : **R3** est le troisième item de la
   liste des dons, **B0** sa branche unique, **BS1/2/3** les branches
   secondaires. Ici : R3 vit au 1ᵉʳ palier (la fiche du catalogue), B0 au 2ᵉ.

   ⭐ ET IL PASSE PAR LA COUTURE EXISTANTE, PAS À CÔTÉ. Un catalogue déclare
   déjà son second palier par deux fonctions : `palier2(decisions)` dit S'IL
   EXISTE, `choices(ctx, act)` le DESSINE. Species et Class s'en servent depuis
   le lot 60.
   🔴 J'AI D'ABORD ÉCRIT UNE BRANCHE PARALLÈLE, ET LA PAGE L'A REFUSÉE : elle
   court-circuitait `catalogueCourant()`, donc `currentGate()` — qui interroge
   le palier SUIVANT pour savoir s'il existe — répondait « non », et `CHOOSE`
   sautait à l'étape Destiny au lieu d'ouvrir B0. Le mécanisme savait déjà
   poser la question ; il fallait lui donner la bonne réponse, pas la contourner.

   ⛔ ET AUCUN IDENTIFIANT DE DON N'ENTRE ICI : le second palier existe si le
   moteur publie le plan, c'est-à-dire si le don CHOISI déclare ses listes. */

/** Le don que le joueur a posé, ou `null`. Lu au document — la seule source
 *  d'un choix (le carnet, lui, dit ce qui RESTE à faire). */
function choixDeDon() {
  const choices = (state.document && state.document.build && state.document.build.choices) || [];
  const choix = choices.find((c) => c && c.path === "background.originFeat[0]" && c.ref && c.ref.kind === "feat");
  return choix ? choix.ref.id : null;
}

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
    /* PAR OÙ CE CATALOGUE SORT quand il n'a plus de palier : « step » (l'étape
       suivante) par défaut, « close » pour celui qui n'est qu'un ITEM d'une
       autre étape — le don d'origine. Déclaré, jamais deviné. */
    fin: cfg.fin || "step",
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
  /* 🔴 LE FOND NE PORTE AUCUN VOILE — Eric, 2026-08-26 : *« le fond n'a pas de
     voile · la dalle voile 35 % »*. `.decision-card` EST le fond de chaque
     écran : elle ne peint plus rien, elle ne garde que sa FORME (liseré,
     rayon, rembourrage). Ce sont les dalles posées dessus qui peignent, à 35 %,
     et une seule fois — c'est §4 appliqué à la lettre : *« jamais deux voiles
     empilés → pas de conteneur d'écran, des dalles autonomes »*.
     ⛔ ELLE NE PORTE PLUS `dalle-majeure`, et c'est le point : tant qu'elle la
     portait, tout voile posé dessus s'ajoutait à un fond opaque — le fond
     d'image n'atteignait jamais l'œil. */
  const card = el("section", "decision-card");
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
  /* ⛔ ET PAS PENDANT LE LORE (lot 82) : `data-bleed` efface la carte pour
     laisser flotter douze fiches. Une page de prose n'est pas douze dalles —
     elle a besoin de SA dalle, opaque, sinon deux cents mots se lisent
     directement sur le fond de nuit. */
  /* 🔴 ET PAS QUAND LE PARCOURS OCCUPE L'ÉCRAN (2026-08-19, mesuré). `bleed`
     efface les gouttières de la carte pour que les DOUZE FICHES prennent
     toute la scène. Mais dès le `Choose`, ce ne sont plus des fiches : c'est
     un guide, un item ou un bilan — de la PROSE, qui doit garder ses marges.
     Mesuré à 375 : la même dalle de guide faisait **375 px sur Species**, où
     elle touchait les deux bords, et **325 sur Inheritance**. Un composant à
     deux largeurs selon l'étape, c'est la maladie que les six dalles
     venaient d'être soignées — revenue par la porte du conteneur. */
  const parcoursOccupe = Boolean(catalogueCourant()) && catalogueCourant().parcours &&
    etatDeLEtape({ decisions: state.decisions, document: state.document, racine: catalogueCourant().path }) !== ETAT.catalogue;
  card.dataset.bleed = String((Boolean(catalogueCourant()) && state.palier === 1 && !state.lore && !parcoursOccupe) || step.id === "skills");
  /* ══ L'ÉCRAN QUI NE PEUT PAS SE DESSINER — et qui le DIT ═══════════════
     🔴 SIX ÉCRANS LISENT LA FICHE DÉRIVÉE (`state.resolved`) : Inheritance,
     Abilities, Destiny, Skills, Equipment, Review. Quand la dérivation est
     impossible (voir `rebuild()`), elle vaut `null`, et ces six-là n'ont rien
     à montrer.
     ⭐ LES DEUX AUTRES FAMILLES CONTINUENT DE VIVRE, ET C'EST TOUT L'INTÉRÊT :
     Identity et Universe ne lisent que le document ; les CATALOGUES ne lisent
     que le carnet — et le catalogue de Class est précisément l'endroit où l'on
     répare l'état où l'on est. Un garde qui les fermerait aussi enfermerait le
     joueur dehors.
     ⛔ D'OÙ LE `catalogueCourant()` DANS LA CONDITION : Destiny est dans les
     six, mais son mode « Choose yourself » EST un catalogue. Nommer l'étape
     sans regarder ce qu'elle affiche aurait fermé une porte ouverte.
     📌 ET LE MOT NOMME LE MANQUE, jamais une clef machine — la règle du refus
     qui nomme, §5 du canon. */
  if (state.derivationImpossible && !catalogueCourant() && ECRANS_QUI_LISENT_LA_FICHE.has(step.id)) {
    const manque = !(state.document && state.document.build.choices.some((c) => c && c.path === "class"));
    card.append(el("p", "placeholder", [document.createTextNode(manque
      ? "This screen reads your character sheet, and there is no sheet without a class. "
        + "Choose one on Class, and this screen comes back with it."
      : "This screen reads your character sheet, and it cannot be derived yet.")]));
    return card;
  }

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
    /* ══ IDENTITY — LE PREMIER ÉCRAN AU PARCOURS COMPLET (Eric, 2026-08-19) ══
       Tutoriel général (bleu) → tutoriel spécifique (vert) → line bleed → la
       fiche → `Done` → bilan.

       ⛔ ET LE BILAN REMPLACE TOUT — Eric, mot pour mot : *« la dalle bilan
       remplace tout l'existant »*. Ni tutoriel ni formulaire ne survivent
       derrière lui : l'étape est close, et un écran qui garderait ses champs
       ouverts dirait le contraire. */
    if (estConfirme(state.document, "concept")) {
      card.append(renderParcoursBilan(IDENTITY_PARCOURS, { query: null }));
    } else {
      /* 🔴 IDENTITY N'OUVRE PLUS SUR UN PANNEAU — Eric, 2026-08-26 : *« dégage
         le welcome aiguilleur de Identity, on y reviendra à la trilogie des
         guides mais après »*.

         ⚠️ J'AI RETIRÉ LES DEUX MONTAGES, PAS SEULEMENT LE « WELCOME », et il
         faut le dire parce que ce n'est pas mot pour mot ce qu'il a demandé.
         Le code lisait `if (général) … else if (spécifique) …` : retirer le
         seul général aurait fait monter le tutoriel D'IDENTITY à la même
         place, à la ligne suivante. L'écran se serait encore ouvert sur un
         panneau — c'est-à-dire exactement ce qu'Eric fait cesser. La consigne
         porte sur ce qui s'ouvre, pas sur un nom de variable.
         ⭐ Et *« on y reviendra à la trilogie des guides »* dit que le système
         entier est reporté, pas la moitié.

         ⛔ RIEN N'EST SUPPRIMÉ : `TUTO_GENERAL`, `TUTO_IDENTITY`,
         `renderTutorielGeneral` et `renderTutorielSpecifique` restent entiers,
         avec leurs tests. Ce qui est retiré, c'est **le montage sur cet
         écran** — trois lignes à remettre le jour où la trilogie revient.
         📌 ET IDENTITY ÉTAIT LE SEUL ÉCRAN À EN MONTER UN — vérifié après coup :
         `renderTutorielGeneral` et `renderTutorielSpecifique` n'avaient aucun
         autre appelant dans tout `ui/builder/`. *« Le reste aussi »* (Eric) est
         donc déjà satisfait par ces trois lignes : **aucune étape ne s'ouvre
         plus sur un panneau**. Ce qui reste debout est le `?`, qu'Eric a
         explicitement sorti du standby le 26/08.
         ⚠️ `tutorielActif()` reste lu plus bas (l'interrupteur du Menu) ;
         `generalVu()` n'est plus lu nulle part — c'est le drapeau « le Welcome
         a déjà été vu », et il n'a plus de Welcome à garder. ⛔ Ne pas le
         supprimer : il tient un état persistant que la trilogie relira. */
      card.append(renderConceptStep({
        document: state.document,
        writers: state.docWriters,
        fieldErrors: state.fieldErrors,
        /* Le livre de l'alignement lit sa section DANS la couche SRD — Eric,
           2026-08-26 : *« connecte le livre à la section alignement dans le
           SRD »*. La coquille est le seul endroit qui tient la pile montée.
           🔴 ⛔ LE CHEMIN EST `state.engine.layers.verbs.query`, PAS
           `state.query` — j'ai écrit le second d'abord, et il n'existe pas.
           ⚠️ ET CETTE FAUTE N'AURAIT RIEN CASSÉ DE VISIBLE : `undefined` serait
           passé au lecteur, qui rend `null`, et le livre aurait affiché « this
           rule text could not be loaded » — **le repli élégant se serait fait
           passer pour le comportement normal**. Un garde-fou qui absorbe une
           erreur de câblage est pire qu'une exception : il la rend crédible.
           📌 Le témoin qui l'a attrapée : `grep state.query` — zéro occurrence
           avant celle-ci. Vérifier qu'un champ EXISTE coûte une commande.
           ⚠️ `state.engine` est nul tant que le moteur n'est pas monté : la
           chaîne optionnelle rend `undefined`, et le livre le dira honnêtement. */
        query: state.engine && state.engine.layers.verbs.query
      }, applyDecisionAction));
    }
  } else if (step.id === "concept" && state.engineError) {
    card.append(el("p", "placeholder", [document.createTextNode(
      "Engine failed to load: " + state.engineError)]));
  } else if (step.id === "concept") {
    card.append(el("p", "placeholder", [document.createTextNode("Loading the engine…")]));
  } else if (step.id === "universe" && state.engine) {
    card.append(renderUniverseStep({
      /* L'écran REÇOIT l'état du tutoriel, il ne va pas le chercher : un écran
         qui lirait `localStorage` lui-même deviendrait impossible à tester. */
      tutoriel: tutorielActif(),
      document: state.document,
      query: state.engine.layers.verbs.query,
      fieldErrors: state.fieldErrors,
      pendingStack: state.pendingStack,
      /* Même loi que le tutoriel juste au-dessus : l'écran REÇOIT l'état de la
         mémoire, il ne va pas le chercher — un écran qui lirait `localStorage`
         lui-même deviendrait impossible à tester. */
      memoire: state.memoire,
      memoireIgnoree: state.memoireIgnoree
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
    /* ⚠️ LE 3ᵉ PALIER SE PEINT COMME LE 2ᵉ : la feuille ne connaît que deux
       régimes — la chaîne de fiches, et l'écran plein. BS est un écran plein,
       comme B0. Écrire un `data-palier="3"` que personne ne lit serait un
       attribut fantôme. */
    section.dataset.palier = String(state.palier >= 2 ? 2 : 1);
    /* ⭐ LE LORE PREND TOUTE LA SCÈNE (lot 82, croquis A). Il passe AVANT le
       palier : lire la prose d'une espèce est une parenthèse, elle ne doit
       rien changer à l'endroit où on en était du choix. On revient au même
       palier, sur le même curseur — le panneau n'écrit que `state.lore`. */
    /* ══ LE PARCOURS D'ÉTAPE (Eric, 2026-08-19) ═══════════════════════════
       Les catalogues qui le portent (`cfg.parcours`) ne se lisent PLUS au
       palier : leur écran se déduit du DOCUMENT.

       🔴 ET C'EST UNE CORRECTION, PAS UN GOÛT. `state.palier` retombe à 1 à
       chaque changement d'étape (voir son commentaire) — router dessus aurait
       ramené le joueur au catalogue dès qu'il revient par la ceinture, alors
       qu'Eric demande l'inverse : *« désormais qu'on aille en avant ou en
       arrière dans le belt, quand on revient à species on retombe dans le
       guide spécifique »*. L'état lu au document survit à la navigation ET au
       rechargement de la page.

       ⛔ LE LORE RESTE PRIORITAIRE : il est une parenthèse dans la lecture,
       et il vaut aussi bien depuis le catalogue que depuis le guide. */
    const parcours = cfg.parcours
      ? etatDeLEtape({ decisions: state.decisions, document: state.document, racine: cfg.path })
      : null;

    if (state.lore) {
      section.append(renderLorePanel({
        query: ctx.query, kind: state.lore.kind, id: state.lore.id, onAction: applyDecisionAction
      }));
    } else if (parcours && state.parcoursItem) {
      section.append(renderParcoursItem(cfg, ctx));
    } else if (parcours === ETAT.guide || parcours === ETAT.bilan) {
      /* ⭐ B0 EST SON PROPRE BILAN (Eric, 2026-08-19 : *« la fenêtre
         photographiée n'a plus de raison d'être »*). Le guide et le bilan ne
         sont plus deux écrans : c'est le MÊME, qui gagne sa conclusion et son
         `Next` une fois signé. Chaque ligne porte déjà son résumé — un second
         écran qui les redirait ferait lire deux fois la même chose pour
         avancer d'un cran. */
      section.append(renderParcoursGuide(cfg, ctx));
    } else if (state.palier === 2 || state.palier === 3) {
      /* ⭐ LES DEUX PALIERS PROFONDS PASSENT PAR LA MÊME PORTE, et c'est `cfg`
         qui sait quoi y mettre : la coquille ne connaît ni B0 ni BS. */
      section.append(cfg.choices(ctx, applyDecisionAction));
    } else {
      /* Le 3ᵉ argument est le destinataire du `CHOOSE` de chaque fiche (Ch6).
         Les catalogues sans pied (Destiny, don d'origine) ne s'en servent
         pas : `renderCatalogueCards` ne trouve aucun bouton à câbler. */
      /* ⭐ LE GUIDE GÉNÉRAL EN TÊTE (Eric, 2026-08-19) : *« tout en haut du
         menu latéral de species il doit y avoir une carte guide […] on
         atterrit dans le guide général parce qu'il est en haut de la
         hiérarchie […] mais il ne bloque pas le scroll, c'est un F2 »*.

         ⛔ IL NE PORTE PAS `data-snap`, ET C'EST DÉLIBÉRÉ. L'index d'un cran
         de rail et celui d'une fiche sont LE MÊME ENTIER (`catalogueOptions`
         alimente les deux, et `snapTo` compte les `[data-snap]` de la scène) :
         une carte de plus dans ce compte décalerait tout d'un cran et ferait
         choisir la mauvaise espèce. Elle se lit, elle se dépasse, elle ne
         s'aimante pas.
         ⏳ Son cran de rail est donc REMIS À PLUS TARD, pas oublié : l'ajouter
         demande de désolidariser les deux index, ce qui est un lot en soi. */
      const cards = renderCatalogueCards(ctx, cfg.cardBody, applyDecisionAction);
      /* ⭐ LE GUIDE ENTRE DANS LA COLONNE, il n'est plus posé À CÔTÉ d'elle.
         C'est un F1 (Eric, 2026-08-19) : il défile avec les douze fiches et
         porte leur hauteur. Or `--fiche-h` est déclarée sur
         `.catalogue-cards[data-kind=…]` — en frère de cette liste, le guide ne
         la voyait pas et retombait sur la hauteur de son texte : mesuré 275 px
         contre 440 pour une fiche.
         ⛔ ET IL RESTE HORS DU COMPTE DES AIMANTS : aucun `data-snap`. L'index
         d'un cran de rail et celui d'une fiche sont LE MÊME ENTIER — une carte
         de plus dans ce compte ferait choisir la mauvaise espèce. Il se lit,
         il se dépasse. C'est la seule chose qui le distingue d'une fiche. */
      if (cards && cfg.parcours && cfg.guideGeneral) {
        cards.prepend(renderGuideGeneral(cfg.guideGeneral));
      }
      if (cards) section.append(cards);
    }
    card.append(section);
  } else if ((step.id === "class" || step.id === "species") && state.engineError) {
    card.append(el("p", "placeholder", [document.createTextNode(
      "Engine failed to load: " + state.engineError)]));
  } else if (step.id === "class" || step.id === "species") {
    card.append(el("p", "placeholder", [document.createTextNode("Loading the engine…")]));
  } else if (step.id === "background" && state.engine && parcoursInheritance()) {
    /* ⭐ L'INHERITANCE PREND LE MÊME PARCOURS QUE SPECIES — Eric, 2026-08-19 :
       *« Inheritance c'est pareil que species après choose »*. Et elle n'a
       PAS de catalogue, parce qu'elle ne se choisit pas : le moteur résout le
       record unique de son genre (contrat §1a, « livrée, non choisie »), donc
       son plan arrive rempli et le parcours la pose AU GUIDE du premier coup.
       Aucun cas particulier — c'est la conséquence du même test. */
    const cfg = INHERITANCE_PARCOURS;
    const ctx = inheritanceCtx();
    const section = el("section", "catalogue-step");
    const ou = etatDeLEtape({ decisions: state.decisions, document: state.document, racine: cfg.path });
    if (state.parcoursItem) section.append(renderParcoursItem(cfg, ctx));
    else section.append(renderParcoursGuide(cfg, ctx));   /* guide ET bilan : voir plus haut */
    card.append(section);
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
      info: state.abilityInfo,
      /* ⭐ LE PALIER DÉCIDE DE LA PAGE (Eric, 2026-08-16) : 1 = la racine, le
         sélecteur seul ; 2 = la page de la méthode choisie. L'écran le LIT, il
         ne le possède pas — l'enchaînement appartient à la coquille (I.4). */
      palier: state.palier
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

  /* ⭐ LE « ? » — Eric, 2026-08-19 : *« petit rond discret en haut à droite »*.
     Il rouvre le tutoriel.

     🔴 IL EST LE FILET DE SÉCURITÉ DE `Turn tutorials off` : sans lui, ce
     bouton serait IRRÉVERSIBLE. C'est pour ça qu'il est posé par la COQUILLE,
     une fois, sur toutes les étapes — et pas par chaque écran, qui pourrait
     l'oublier.

     ⛔ MAIS PAS QUAND LE TUTORIEL EST DÉJÀ LÀ (Eric, le même jour) : *« le ?
     est inutile sur les dalles tutoriel »*. Un bouton qui propose d'ouvrir ce
     qu'on est en train de lire est du bruit.
     ⚠️ ON NE LE RENDS PAS, on ne le CACHE pas : `display: none` est interdit
     dans `shell.css` (garde 4), et pour une bonne raison — un nœud caché reste
     dans l'arbre, tabulable et annoncé. */
  /* 🔴 SUR LA DALLE, PAS SUR LA CARTE — Eric, 2026-08-19, en le voyant flotter
     dans le vide : *« dégage tous les ? qui ne sont pas à leur place »*.

     LA CAUSE, MESURÉE : il était posé au coin de `.decision-card`, qui sur un
     large écran fait 76ch CENTRÉS. Son coin haut-droit tombait donc au milieu
     du fond, à côté de la dalle et pas dessus. Un bouton posé sur rien.

     ⛔ IL SE POSE MAINTENANT DANS LA PREMIÈRE DALLE, celle qu'il concerne —
     c'est ce qu'Eric demandait depuis le début (*« le ? est SUR la dalle tout
     à droite au même niveau que le titre »*). Et toujours pas quand un
     tutoriel est déjà là : proposer d'ouvrir ce qu'on lit est du bruit. */
  /* 🔴 UN CATALOGUE MONTRE UNE FICHE À LA FOIS — Eric, 2026-08-20 : *« toujours
     rajouter le petit point d'interrogation en bas à droite »*.

     📏 LA CAUSE, MESURÉE DANS LA PAGE (les cinq dons d'origine) : le `?` était
     posé sur la PREMIÈRE dalle trouvée, c'est-à-dire la fiche n°1 — mesurée à
     `top: -1412` dès qu'on avait fait défiler le rail jusqu'à Magic Initiate.
     Il existait, il était introuvable. Sur les autres écrans, où les dalles
     s'empilent et défilent ensemble, le premier reste le bon.
     ⭐ LA RÈGLE EST DONC CELLE DE L'OBJET, PAS CELLE DU COMPTE : là où les
     pages ALTERNENT (un rail, une fiche visible à la fois), chacune porte la
     sienne — exactement comme chacune porte déjà son `LORE` et son `CHOOSE`.
     Ailleurs, rien ne change : une seule, sur la première dalle.
     ⛔ ET TOUJOURS PAS SUR UN TUTORIEL : proposer d'ouvrir ce qu'on lit est du
     bruit. */
  /* 🔴 BORNÉ AUX ÉCRANS QUI ONT UN GUIDE — §7 : *« un `?` qui n'ouvre rien
     apprend à ne plus le regarder »*. La table `GUIDES` décide, et elle décide
     aussi pour `tutoRouvrir` : un seul lecteur, donc pas de divergence
     possible entre le bouton posé et l'action qui répond. */
  const guide = guideDeLEtape();
  if (guide && !card.querySelector(".tuto-general, .tuto-specifique")) {
    const fiches = card.querySelectorAll(".fiche-dalle");
    const hotes = fiches.length > 0
      ? Array.from(fiches)
      /* ⭐ `dalle-simple` EST ENTRÉE DANS CETTE LISTE le 2026-08-26, et il le
         fallait : les dalles d'écran sont passées de `majeure` à `simple`
         quand le fond a cessé de peindre. Sans elle, ce chercheur serait
         devenu muet — il aurait rendu `null` et le `?` aurait disparu des
         écrans sans qu'aucun test ne le dise. Une absence n'est jamais une
         réponse. Les deux anciens habits restent listés : le bouton garde
         `majeure` (§4), et l'état actif garde `intermediaire`. */
      /* ⛔ `:not(button)` — UN `?` NE SE POSE PAS DANS UN BOUTON, et ce n'est
         pas une précaution de principe : mesuré à 360 sur DESTINY, la première
         dalle de l'écran est `button.card-face` (la carte qu'on retourne). Le
         `?` y était donc un `<button>` DANS un `<button>` — du HTML invalide,
         et surtout un clic qui remonte : demander l'aide RETOURNAIT LA CARTE.
         Avec l'exclusion, l'hôte devient `section.card-reveal`, juste dessous. */
      : [card.querySelector(":is([data-objet='dalle'], .dalle-simple, .dalle-majeure, .dalle-intermediaire):not(button)")
         /* 🔴 L'ÉCRAN LUI-MÊME, QUAND IL NE DESSINE AUCUNE DALLE — et ce n'est
            pas une hypothèse : l'ÉQUIPEMENT est dans ce cas depuis le virage
            B3 du 23/08 (*« dégage tout ce que je vois à l'écran »*). Mesuré à
            360 : `section.equipment-step` et rien d'autre, zéro dalle, donc
            zéro `?` — c'est-à-dire que le SEUL guide déjà écrit dans ce dépôt
            était injoignable, et l'a été trois jours sans qu'un test le dise.
            ⛔ Et la retombée s'arrête à une `section` : un `<p class=
            "placeholder">` (« Loading the engine… ») n'est pas un hôte, et un
            `?` posé sur un écran en charge serait à nouveau un bouton posé sur
            rien. Une absence n'est jamais une réponse — ici on la NOMME. */
         || card.querySelector("section")];
    /* L'aspect est décidé UNE FOIS pour l'étape et passé à chaque `?` : sur un
       catalogue, les fiches en portent une chacune (leçon des cinq dons du
       20/08), et deux `?` de la même étape ne peuvent pas se contredire. */
    const vu = guideVu(guide.etape);
    for (const hote of hotes) {
      if (hote) hote.append(renderPointInterrogation(applyDecisionAction, { vu }));
    }
  }
  effacerLesTitresEnDouble(card);
  return card;
}

/** ⛔ ON NE NOMME PAS DEUX FOIS — Eric, 2026-08-26 : *« si doublon de titre,
 *  effacer celui de la DALLE »*.
 *
 *  📏 LE DÉFAUT, MESURÉ PAR LE LOT A le même jour, sur l'écran des sorts
 *  préparés de Class : « Prepared spells » s'écrit **deux fois** — une fois en
 *  `h2.guide-titre` (le titre de l'écran) et une fois en `h3` dans la dalle du
 *  vivier. Le second coûtait une ligne de hauteur sur une page qui débordait
 *  déjà de 237 px.
 *
 *  ⭐ POURQUOI ICI ET PAS DANS `glisser.mjs` : l'organe du vivier ne PEUT PAS
 *  savoir qu'il double un titre — il reçoit un mot, il ne voit pas l'écran
 *  autour. Et le faire dire par les CINQ appelants, ce serait cinq endroits où
 *  l'oublier au premier écran neuf. ⭐ Ici, les deux titres se rencontrent pour
 *  la première fois : c'est le seul endroit où la question a une réponse.
 *
 *  ⛔ ET ON COMPARE LE TEXTE RENDU, PAS UNE INTENTION. Un vivier dont le titre
 *  DIFFÈRE de celui de l'écran garde le sien — « Skill budget » sous « Elf »
 *  nomme deux choses, ce n'est pas un doublon. Seul le mot identique s'efface.
 *
 *  📌 C'est §1 quinquies appliqué à la lettre : *« la règle se lit à l'envers,
 *  et c'est ce qui la rend juste : on ne nomme pas deux fois. Un titre posé
 *  au-dessus d'un objet qui dit déjà de quoi il s'agit coûte 40 px pour ne rien
 *  apprendre. »* */
function effacerLesTitresEnDouble(card) {
  const ecran = card.querySelector("h1, h2");
  if (!ecran) return;
  const mot = (ecran.textContent || "").trim().toLowerCase();
  if (!mot) return;
  for (const titre of card.querySelectorAll("h2, h3")) {
    if (titre === ecran) continue;
    if ((titre.textContent || "").trim().toLowerCase() === mot) titre.remove();
  }
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
  /* ⭐ LES DEUX BOUTS NE SONT PAS DES ÉTAPES — Eric, 2026-08-19.
     Le premier cran (les réglages) et le dernier (le personnage) sortent de
     la piste et deviennent deux **demi-pastilles happées par le bord**,
     collées en haut de l'écran. Ce n'est pas de l'ornement : une dalle de
     verre au milieu de huit autres dit « je suis une étape », et ces deux-là
     n'en sont pas. Le demi-disque le dit sans un mot — un rond entier posé au
     bord est un bouton, un rond coupé par le bord est un onglet tiré des
     coulisses.

     ⛔ ILS RESTENT DANS `items`, ET C'EST INDISPENSABLE. `paintBelt` écrit
     `data-status` par index sur les DIX ; les sortir du tableau les priverait
     de l'état courant. Seul leur PARENT change. */
  /* ⛔ LEUR MOT N'EST PAS CELUI DE L'ÉTAPE. « Universe & Layers » déborde sur
     deux lignes dans un disque de 58 px (mesuré à l'écran) — et surtout, une
     pastille verticale ne porte pas un titre, elle porte une étiquette. Ces
     deux mots-là sont d'Eric, relevés sur sa maquette du 2026-08-19. */
  const AUX = { 0: "Menu", [STEPS.length - 1]: "Sheet" };
  const items = STEPS.map((step, index) => {
    const item = button("", () => goToStep(index));
    if (AUX[index]) {
      item.className = "belt-onglet";
      item.dataset.bout = index === 0 ? "menu" : "fiche";
      /* Le mot court est ce qu'on VOIT ; le libellé complet reste ce que les
         lecteurs d'écran ANNONCENT — « Menu » seul ne dirait pas où l'on va. */
      item.setAttribute("aria-label", step.label);
      /* Le mot est vertical : il suit le bord au lieu de suivre la lecture.
         C'est ce geste — celui d'un onglet de classeur — qui distingue la
         pastille d'un bouton rond ordinaire. */
      item.append(el("span", "belt-onglet-mot", [document.createTextNode(AUX[index])]));
      belt.append(item);
      return item;
    }
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
     `Show plan` disparaît — Review EST le plan, lu au carnet — et la sortie
     d'étape descend dans le contenu de chaque écran (`renderSortieEtape`), là
     où le geste se termine. Mesuré : la hauteur figée passe de 106 px à 61.
     ⚠️ Le bouton qui descendait alors s'appelait `Validate` ; il a disparu
     à son tour le 16/08 (lot 80, §5.1), remplacé par la paire `BACK`/`DONE`.
     Ce que ce paragraphe mesure — 45 px repris sur dix écrans — n'a pas
     bougé : c'est la LIGNE FIXE qui est partie, pas ce qu'elle portait. */

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
/* ══ LES TROIS ADAPTATEURS DU PARCOURS ══════════════════════════════════════
   Ils relient un catalogue (`cfg`) aux écrans de `parcours-ecrans.mjs`.

   ⛔ AUCUN NOM D'ÉTAPE ICI. Tout ce qui est propre à une étape passe par des
   crochets FACULTATIFS sur son `cfg` — `guideTexte`, `itemLabel`, `itemCorps`,
   `bilanLignes`. Species les fournira ; l'Inheritance fournira les siens ; ce
   fichier n'apprend jamais leurs noms.

   ⏳ LES REPLIS SONT DES REPLIS, PAS DES CHOIX. Sans crochet, on rend le
   mot du chemin et le panneau de choix existant : ça fonctionne, ce n'est pas
   ce qu'Eric a dessiné, et c'est écrit ici pour que personne ne le prenne pour
   la version finale. */

/** Le mot d'un item quand son écran n'en propose pas : la queue du chemin,
 *  rendue lisible. `species.skillBudget` → « Skill budget ». */
function motDuChemin(chemin) {
  const queue = String(chemin).split(".").pop().replace(/\[\d+\]$/, "");
  const espace = queue.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return espace.charAt(0).toUpperCase() + espace.slice(1);
}

function itemsDuParcours(cfg) {
  const items = itemsDeLEtape({ decisions: state.decisions, document: state.document, racine: cfg.path });
  /* ⭐ LES LIGNES QUI NE SE CHOISISSENT PAS mais qui DÉPENDENT d'un item —
     Eric, 2026-08-19 : *« granted automatically est une autre ligne, grisée
     tant qu'on n'a pas choisi le lignage ; ensuite le voyant devient vert »*.
     Elles n'ouvrent aucun écran : elles rendent compte. Leur voyant lit la
     signature de CE DONT elles dépendent, jamais la leur — elles n'en ont pas. */
  for (const ligne of cfg.lignesEnPlus || []) {
    items.push({
      path: ligne.path,
      sansChoix: true,
      repondu: true,
      confirme: ligne.depend ? estConfirme(state.document, ligne.depend) : true,
      verrou: null
    });
  }
  return items;
}

function renderParcoursGuide(cfg, ctx) {
  const items = itemsDuParcours(cfg);
  const refus = Array.isArray(state.parcoursRefus) && state.parcoursRefus.length > 0
    ? `Not yet: ${state.parcoursRefus.map((c) => (cfg.itemLabel ? cfg.itemLabel(c, ctx) : motDuChemin(c))).join(", ")}.`
    : null;
  return renderGuideSpecifique({
    racine: cfg.path,
    titre: titreDuParcours(cfg, ctx),
    texte: cfg.guideTexte ? cfg.guideTexte(ctx) : DEFAUT_GUIDE,
    items,
    labelOf: (item) => (cfg.itemLabel ? cfg.itemLabel(item.path, ctx) : motDuChemin(item.path)),
    /* Le bilan de chaque ligne, et l'état de l'étape : ce sont eux qui font de
       B0 son propre bilan (Eric, 2026-08-19). */
    resumeDe: cfg.resumeItem ? (item) => cfg.resumeItem(item, ctx) : null,
    /* ⚠️ DEUX ÉTATS, PAS UN. `acheve` = plus rien à faire ; `conclu` = le
       joueur est déjà reparti par `Next`. Le pied lit les deux : `Done`,
       puis `Next`, puis plus rien. Les fondre en un seul booléen redonnerait
       le `Next` à quelqu'un qui revient simplement relire. */
    acheve: etapeAchevee({ decisions: state.decisions, document: state.document, racine: cfg.path }),
    conclu: estConfirme(state.document, cfg.path),
    refus,
    onAction: applyDecisionAction
  });
}

function renderParcoursItem(cfg, ctx) {
  const ouvert = state.parcoursItem;
  const items = itemsDuParcours(cfg);
  const item = items.find((entry) => entry.path === ouvert.path) || { path: ouvert.path };
  return renderItemDalle({
    racine: cfg.path,
    item,
    titre: cfg.itemLabel ? cfg.itemLabel(item.path, ctx) : motDuChemin(item.path),
    corps: cfg.itemCorps ? cfg.itemCorps(item, ctx, applyDecisionAction)
      : cfg.choices(ctx, applyDecisionAction),
    onAction: applyDecisionAction
  });
}

function renderParcoursBilan(cfg, ctx) {
  const lignes = cfg.bilanLignes
    ? cfg.bilanLignes(ctx)
    : itemsDuParcours(cfg).map((item) => [
      cfg.itemLabel ? cfg.itemLabel(item.path, ctx) : motDuChemin(item.path),
      item.confirme ? "done" : "not recorded"
    ]);
  return renderBilan({
    racine: cfg.path,
    titre: titreDuParcours(cfg, ctx),
    lignes,
    onAction: applyDecisionAction
  });
}

/** Le titre d'un écran de parcours : le nom du record RETENU, ou le libellé de
 *  l'étape.
 *  ⚠️ TOUTES LES ÉTAPES N'ONT PAS DE RECORD. Identity se REMPLIT, elle ne se
 *  choisit pas : ni `kind`, ni `query`. Un premier jet appelait `recordName`
 *  sans condition et jetait « query is not a function » — l'écran restait
 *  figé sur son contenu précédent pendant que le voyant du belt, lui, passait
 *  au vert. Mesuré dans la page. */
function titreDuParcours(cfg, ctx) {
  if (!cfg.kind || !ctx || typeof ctx.query !== "function") return cfg.label;
  return recordName(ctx.query, cfg.kind, resolvedRefId(cfg)) || cfg.label;
}

/** L'id du record RETENU pour ce catalogue — lu au carnet, jamais deviné. */
function resolvedRefId(cfg) {
  const plan = (state.decisions || []).find((entry) => entry && entry.path === cfg.path);
  return plan && Array.isArray(plan.selected) ? plan.selected[0] : null;
}

/* 🔴 IL PROMETTAIT UNE ÉTAPE QUI N'EXISTE PLUS. Il finissait par *« — then
   confirm the step »* : c'était la description exacte de la double validation
   qu'Eric a fait sauter le 19/08. Un mode d'emploi qui annonce un geste qu'on
   ne peut plus faire est pire qu'un mode d'emploi absent — le joueur cherche
   le bouton. */
const DEFAUT_GUIDE = "Everything this choice asks of you is listed below. " +
  "Open each one and mark it Done — the step is settled once the last one is.";

/** Le contexte de l'Inheritance — la même paire que sa branche d'origine.
 *  ⚠️ `document` ET `resolved` en plus : Inheritance lit les boosts déjà posés
 *  dans `document.build.choices` (aucun plan ne les republie) et le score final
 *  dans `resolved.abilities`. */
function inheritanceCtx() {
  return {
    decisions: state.decisions, document: state.document, resolved: state.resolved,
    query: state.engine.layers.verbs.query, open: state.inheritanceOpen,
    path: "background", kind: "background", label: "Inheritance"
  };
}

/** L'Inheritance a-t-elle son parcours ? ⏳ Le drapeau vit ici et pas sur un
 *  `cfg` de catalogue, parce qu'elle n'en est pas un. */
function parcoursInheritance() { return INHERITANCE_PARCOURS.parcours; }

/** LA RACINE DU PARCOURS DE L'ÉTAPE COURANTE, ou `null` si elle n'en a pas.
 *  ⚠️ DEUX SOURCES, ET C'EST VOULU : les catalogues déclarent la leur
 *  (`cfg.parcours`), l'Inheritance vit à part (elle ne se choisit pas, donc
 *  elle n'a pas de catalogue). Une seule fonction pour les deux évite qu'un
 *  organe en connaisse une et pas l'autre — c'est déjà l'argument du belt. */
function parcoursRacineCourante() {
  const cfg = catalogueCourant();
  if (cfg && cfg.parcours) return cfg.path;
  if (STEPS[state.step].id === "background" && parcoursInheritance()) return INHERITANCE_PARCOURS.path;
  return null;
}

/** LE PARCOURS D'UN CHAPITRE, s'il en a un — sinon `null`.
 *  ⚠️ `CATALOGUES` NE SUFFIT PAS : l'Inheritance n'y est pas (elle ne se
 *  choisit pas, donc elle n'a pas de catalogue) et son parcours vit à part.
 *  Le belt a besoin des deux, et une seule source pour les deux évite qu'un
 *  chapitre s'allume ici et pas là. */
function parcoursDuChapitre(id) {
  if (id === "background") return parcoursInheritance() ? INHERITANCE_PARCOURS : null;
  const cfg = CATALOGUES[id];
  return cfg && cfg.parcours ? cfg : null;
}

const INHERITANCE_PARCOURS = {
  path: "background", kind: "background", label: "Inheritance", parcours: true,
  choices: (ctx, act) => renderInheritanceStep(ctx, act),
  /* 🔴 UN ITEM EST UNE CHOSE — Eric, 2026-08-20, après Species et Class.
     📏 CE QUE LE REPLI DONNAIT, MESURÉ DANS LA PAGE : les DEUX items ouvraient
     le MÊME écran, le menu des deux tuiles. Ni les bonus ni le catalogue des
     dons n'étaient atteignables depuis le parcours — le tuilage attendait un
     `inheritanceOpen` que l'item ne pose jamais. C'était le dernier « repli
     assumé » des trois chapitres. */
  itemCorps: (item, ctx, act) => (item.path === "background.boost"
    ? renderBoostGlisse(ctx, act)
    /* ⭐ LES DEUX LANGUES — 2026-08-20. Même organe que les sorts et les
       maîtrises d'arme : des jetons, des récepteurs, un compte. Le genre change
       (`training`), rien d'autre. ⛔ Elles viennent de l'HÉRITAGE, pas de
       l'espèce — déménagement du 18/08, et la formulation « dans l'espèce » a
       resurgi deux fois depuis sans jamais redevenir vraie. */
    : item.path === "background.languages"
      ? renderLanguesGlisse(ctx, act)
    /* ⏳ LE DON D'ORIGINE VEUT UN ÉCRAN F, PAS UNE DALLE — Eric : *« il faut
       que ce soit du F1 pour les feats »*. Un catalogue a un rail et des
       cartes de 440 ; il ne tient pas dans le corps d'un item. Son ouverture
       est donc un DÉPLACEMENT (voir `parcoursItem`), pas un rendu. */
    : null),
  itemLabel: (chemin) => (chemin === "background.boost" ? "Ability boosts"
    : chemin === "background.languages" ? "Languages"
    : chemin === "background.originFeat[0]" ? "Origin feat" : chemin)
};

/** Les deux langues offertes par l'Héritage, au glisser.
 *  ⛔ AUCUN NOM FABRIQUÉ : le libellé d'un jeton est le `name` du record de
 *  training, et une langue porte le nom de son PEUPLE — `Elf`, jamais
 *  « elvish ». C'est la couche qui le dit, pas cet écran. */
function renderLanguesGlisse(ctx, act) {
  const plan = planAt(ctx.decisions || [], "background.languages");
  if (!plan) return null;
  const nom = (id) => {
    const view = ctx.query({ kind: "training", id });
    return view && view.record ? view.record.name : id;
  };
  return renderChoixGlisses({
    plan, slots: planSlots(ctx.decisions || [], "background.languages"),
    titre: "Languages", mot: "Language",
    refKind: "training", labelOf: nom, onAction: act,
    consigne: `${plan.answered} of ${plan.expected} chosen — your Inheritance grants two, at no cost.`
  });
}

/* ⏳ LES TEXTES DU TUTORIEL SONT DES BROUILLONS — les miens, pas ceux d'Eric,
   et écrits en anglais comme tout le builder alors que sa spec est en
   français. Ils vivent ICI, à un seul endroit, et se corrigent ici. */
const TUTO_GENERAL = {
  titre: "Welcome",
  chapo: "This is where your character gets made — one decision at a time, in the order the decisions matter.",
  points: [
    "Eight steps. Each one settles a single part of the sheet, and nothing else.",
    "A step's number turns green once it is settled. That is your cue to move on.",
    "Sheet, at the far right, shows everything you have so far — at any moment."
  ],
  chute: "You can reopen this whenever you like: the small ? in the corner of a panel brings it back."
};

/* ══ LES GUIDES — l'aide OPTIONNELLE du `?` (NORMES §7, popup parchemin) ════
   🔴 UN GUIDE PAR ÉTAPE, DANS UNE SEULE TABLE. C'est ce que §7 sort
   expressément du standby — Eric, 26/08 : *« le point d'entrée au guide `?`
   doit être fait par contre »*, et le §7 précise : *« le popup-parchemin porté
   aux étapes qui ne l'ont pas encore »*.

   📏 CE QUI EXISTAIT AVANT CETTE TABLE, MESURÉ AU NAVIGATEUR À 360 : le `?`
   ouvrait un vrai guide sur **ZÉRO écran sur dix**. Le code n'en câblait qu'un
   (l'Équipement), et l'Équipement — seul écran sans dalle depuis le virage B3
   du 23/08 — ne portait **aucun `?`**. La seule aide existante était donc
   injoignable, et les neuf autres `?` ne faisaient rien du tout : ils
   rallumaient deux préférences de tutoriel qu'aucun de ces écrans ne rend.
   ⭐ ⛔ « Un `?` qui n'ouvre rien apprend à ne plus le regarder » (§7) — c'est
   exactement l'état qu'on avait, sur neuf écrans.

   ⛔ LA TABLE EST LA CLEF DU BORNAGE : une étape absente d'ici n'a pas de
   guide, donc elle n'a PAS de `?` (voir `renderCard`). C'est la seule façon
   d'empêcher un `?` orphelin de renaître — le bornage ne se surveille pas, il
   se rend impossible.

   ⏳ LES TEXTES SONT DES BROUILLONS — les miens, pas ceux d'Eric, comme
   `TUTO_GENERAL` juste au-dessus. Ils vivent ICI, à un seul endroit, et se
   corrigent ici. Ils sont écrits sur ce que les écrans FONT, relevé au
   navigateur, pas sur ce que je croyais qu'ils faisaient.

   ⚠️ UN GUIDE EST OPTIONNEL, DONC IL NE RÉCLAME RIEN (§7) : pas d'impératif
   qui commande, pas de mise en garde. Ce qui EXIGE une réponse est un
   aiguilleur, ce qui DIT L'ERREUR est un gendarme — deux autres organes, tous
   deux en standby. ⛔ Ne pas glisser l'une de ces deux voix dans cette table. */
const GUIDES = {
  universe: {
    titre: "Menu",
    texte:
      "The menu holds what frames the whole character, not the character itself.\n" +
      "Rules picks the layer stack: SRD alone, or SRD plus Fate's Hand.\n" +
      "Tutorials can be switched off here, and switched back on in the same place.\n" +
      "The character is kept in this browser; export it from the sheet to keep a copy."
  },
  concept: {
    titre: "Identity",
    texte:
      "Identity settles who the character is. None of it touches the rules.\n" +
      "Only the name is really asked of you — gender and alignment can wait.\n" +
      "Nothing here is final: you can come back to this step at any time."
  },
  species: {
    titre: "Species",
    texte:
      "The rail on the left lists the species; the panel shows one at a time.\n" +
      "What the species grants on its own is displayed as it is — nothing to settle there.\n" +
      "What it asks of you is listed as openable lines: open each one and mark it Done.\n" +
      "I changed my mind releases the species and gives the rail back."
  },
  background: {
    titre: "Inheritance",
    texte:
      "Inheritance is what the character carries from where they come from.\n" +
      "Three lines ask something of you: ability boosts, languages, and an origin feat.\n" +
      "The origin feat opens its own catalogue, one feat card at a time.\n" +
      "Done tells you what is still missing rather than going grey on you."
  },
  destiny: {
    titre: "Destiny",
    texte:
      "A card is drawn for you. It carries an impact, a meaning, a power and a vibration.\n" +
      "Draw again is unlimited — nothing is spent by looking further.\n" +
      "Choose yourself picks a card instead of drawing one."
  },
  class: {
    titre: "Class",
    texte:
      "The rail on the left lists the classes; the panel shows one at a time.\n" +
      "What the class grants at level 1 is displayed as it is — nothing to settle there.\n" +
      "What it asks of you is listed as openable lines: open each one and mark it Done.\n" +
      "I changed my mind releases the class and gives the rail back."
  },
  abilities: {
    titre: "Abilities",
    texte:
      "Pick one generation method before anything else — the rest of the step follows from it.\n" +
      "INFO opens what separates the methods, side by side.\n" +
      "The six scores only become the character's once the step is settled."
  },
  skills: {
    titre: "Skills",
    texte:
      "Skills are bought from a pool, and the counter above the list says what is left.\n" +
      "Three tiers, in this order: Novice, then Adept, then Expert.\n" +
      "A skill already granted by species or class is shown as placed — it costs nothing.\n" +
      "Nothing is locked: a point taken back returns to the pool."
  },
  equipment: {
    titre: "Gear",
    texte:
      "The dressing shows what your character wears and carries.\n" +
      "Equipment opens the catalogue: turn the two wheels, tap an item for its card, " +
      "drag it onto a target to act at once.\n" +
      "The cart gathers purchases; BUY pays once for everything."
  },
  review: {
    titre: "Sheet",
    texte:
      "The sheet gathers everything settled so far, step by step.\n" +
      "A line that still misses something says so, and leads back to its step.\n" +
      "Expert view opens the full sheet; Export JSON and Export HTML take a copy out of this browser."
  }
};

/** Le guide de l'étape COURANTE, ou `null` si elle n'en a pas.
 *  🔴 C'EST LE SEUL LECTEUR DE `GUIDES`, et les deux organes du `?` — celui
 *  qui l'OUVRE (`tutoRouvrir`) et celui qui le POSE (`renderCard`) — passent
 *  tous les deux par lui. Deux lectures séparées auraient pu diverger : un
 *  écran aurait porté un `?` que l'action refusait d'ouvrir, ou l'inverse, et
 *  rien n'aurait crié. */
function guideDeLEtape() {
  const etape = STEPS[state.step] ? STEPS[state.step].id : null;
  const guide = etape ? GUIDES[etape] : null;
  return guide ? { etape, titre: guide.titre, texte: guide.texte } : null;
}

const TUTO_IDENTITY = {
  titre: "Identity",
  chapo: "Start with who they are. None of this touches the rules — it is the person the rest of the sheet will belong to.",
  points: [
    "A name, a gender, an alignment. Only the name is really asked of you; the other two can wait.",
    "A Rules or Lore button opens the matching chapter, and drops you back exactly where you left off.",
    "Narrative creation is optional: it brings in an assistant that builds the character alongside you."
  ]
};

/** Les étapes dont le `Done` VAUT signature — voir `pressDone`. */
const SIGNE_SUR_DONE = new Set(["concept"]);

const IDENTITY_PARCOURS = {
  path: "concept", kind: null, label: "Identity",
  bilanLignes: () => {
    const doc = state.document || {};
    return [
      ["Name", doc.name || "—"],
      ["Gender", doc.gender || "—"],
      ["Alignment", doc.alignment || "—"]
    ];
  }
};

function currentGate(palier = state.palier) {
  /* ⭐ UNE DALLE D'ITEM PASSE AVANT TOUT LE RESTE (2026-08-19), et sa porte est
     TOUJOURS prête : *« il faut faire done pour valider un item »* — un `DONE`
     grisé n'aurait rien à valider et ne dirait pas pourquoi. Le refus, lui,
     vit au guide, où il peut NOMMER ce qui manque.
     ⛔ `next: "item"` n'est ni un palier ni une étape : c'est le quatrième
     mouvement, celui qui referme le cran le plus intérieur. */
  if (state.parcoursItem) return { exists: true, ready: true, action: null, next: "item" };
  const cfg = catalogueCourant();
  if (cfg) {
    const trois = typeof cfg.palier3 === "function" ? cfg.palier3(state.decisions) : null;
    return catalogueValidate({ ...catalogueCtx(cfg), palier }, cfg.palier2(state.decisions), trois);
  }
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

/* ⭐ `pressValidate` S'APPELLE `pressDone` DEPUIS LE LOT 80, et ce n'est pas
   cosmétique : le bouton qu'il servait n'existe plus. Un nom qui promet un
   `Validate` à l'écran ferait chercher longtemps.
   📌 Ce qui GARDE son nom, ce sont les PORTES (`currentGate`,
   `abilitiesValidate`, `skillsValidate`…). Elles n'ont jamais nommé le
   bouton : elles nomment le fait de VALIDER un palier, qui est toujours ce
   qu'elles font. Les renommer aurait été une churn de sept fichiers pour
   renommer un concept qui n'a pas changé. */
/** FERMER LE PANNEAU D'UN CATALOGUE QUI EST UN ITEM — et le SIGNER.
 *
 *  ⭐ `Choose` sur une fiche de don vaut le `Done` de l'item, et c'est la
 *  « même logique que species » qu'Eric demande : là-bas aussi, choisir la
 *  fiche EST le geste qui acte. Sans cette signature, le voyant du guide reste
 *  éteint sur un don pourtant posé.
 *  🔴 ET C'EST CETTE SIGNATURE QUI ALLUME LE RESTE — Eric, 2026-08-20 : *« quand
 *  la pastille bonus et la pastille feat est verte, [je veux] un petit prompt
 *  vert et un Next à la place du Done »*. Le pied à trois états existe déjà et
 *  il est générique ; il ne lui manquait QUE ce `confirm`. Un seul défaut, deux
 *  symptômes — la pastille éteinte et le `Done` qui s'éternise.
 *  ⚠️ La signature passe par le MÊME écrivain que partout (`confirm`), et elle
 *  est idempotente : rouvrir le catalogue pour changer d'avis ne la double pas.
 *  📌 Extraite en fonction le 2026-08-20 : deux chemins y mènent désormais — le
 *  palier terminal et l'absence de palier. Recopier le corps aurait fait deux
 *  fermetures dont une seule signerait. */
function fermerLePanneau() {
  const ferme = state.inheritanceOpen;
  state.inheritanceOpen = null;
  state.palier = 1;
  if (ferme === "feat" && state.docWriters && state.document) {
    const chemin = "background.originFeat[0]";
    if (!estConfirme(state.document, chemin)) {
      state.document = state.docWriters.confirm({ document: state.document, path: chemin });
    }
  }
  openSurface();
}

function pressDone() {
  const gate = currentGate();
  if (!gate.ready) return;
  /* L'ACTION D'ABORD, LE PALIER ENSUITE : `applyDecisionAction` appelle
     `rebuild()` puis `refresh()`, donc le carnet est à jour AVANT que le
     palier suivant ne le lise. */
  if (gate.action) applyDecisionAction(gate.action);
  /* B4.4, étape 2 — « toutes les fenêtres intermédiaires disparaissent ».
     Fermer n'est ni un palier ni une étape : c'est le troisième mouvement de
     `Validate`, et il n'existe que sur cet écran. */
  /* L'ITEM SE SIGNE ICI, ET SEULEMENT ICI. `pressBack` le referme sans rien
     écrire ; `DONE` écrit la signature PUIS referme. Les deux gestes mènent au
     même écran et ne laissent pas le même document — c'est toute la règle. */
  if (gate.next === "item") {
    const ouvert = state.parcoursItem;
    state.parcoursItem = null;
    if (ouvert && state.docWriters && state.document) {
      try {
        state.document = state.docWriters.confirm({ document: state.document, path: ouvert.path });
      } catch (error) {
        /* ⛔ UN REFUS D'ÉCRITURE NE SE MANGE PAS. Il remonte dans le carnet des
           champs, comme ceux de `rename`, au lieu de laisser le joueur croire
           qu'il a validé. */
        state.fieldErrors = { ...state.fieldErrors, parcours: motDuRefus(error, null, "parcours") };
      }
    }
    openSurface();
    return;
  }
  /* ⭐ CERTAINES ÉTAPES SE SIGNENT EN AVANÇANT (Eric, 2026-08-19) : *« Done →
     clic Identity dans le belt, le rond 1 se remplit de vert »*. Elles n'ont ni
     catalogue ni items — elles se REMPLISSENT — donc leur `Done` est à la fois
     la signature et le pas suivant.
     ⏳ La liste est explicite, et c'est voulu : une étape y entre quand son
     écran a été dessiné, jamais par défaut. Un voyant vert sur un écran qui
     n'a pas encore de bilan mentirait. */
  if (SIGNE_SUR_DONE.has(STEPS[state.step].id) && state.docWriters && state.document) {
    const racine = STEPS[state.step].id;
    if (!estConfirme(state.document, racine)) {
      state.document = state.docWriters.confirm({ document: state.document, path: racine });
      /* ON NE PASSE PAS À L'ÉTAPE SUIVANTE DU MÊME GESTE : le bilan doit
         s'afficher, sinon le joueur ne voit jamais ce qu'il vient de valider. */
      openSurface();
      return;
    }
  }
  if (gate.next === "close") { fermerLePanneau(); return; }
  /* ⭐ REMONTER D'UN CRAN — Eric, 2026-08-20. Le `Done` du fond ne sort pas du
     panneau : il rend au cran du dessus, dont le bilan vient de se remplir.
     ⛔ Et il ne signe RIEN au passage : la signature de l'item appartient à
     `fermerLePanneau`, c'est-à-dire au dernier cran. Signer ici ferait deux
     écrivains pour une même question (la loi du moteur). */
  if (gate.next === "remonter") {
    state.palier = Math.max(1, state.palier - 1);
    openSurface();
    return;
  }
  if (gate.next === "palier") {
    /* ⭐ LA PORTE EST RÉ-INTERROGÉE APRÈS LE `choose`, et il le faut : le
       plan du 2ᵉ palier décrit le record CHOISI, pas celui qui était sous le
       curseur. Une espèce qui n'accorde rien (Loroka) n'a donc qu'UN palier,
       et on ne peut le savoir qu'ici — pousser vers un menu vide serait un
       geste pour rien (I.4 : « un écran peut compter un, deux ou trois »). */
    /* ⚠️ ET QUAND IL N'Y A PLUS DE PALIER, ON SORT PAR OÙ LE CATALOGUE L'A
       DÉCLARÉ — pas toujours vers l'étape suivante. Un don sans branche (Alert)
       n'ouvre aucun 2ᵉ palier ; le finir doit rendre au guide de l'Inheritance
       comme le fait un don qui en ouvre trois, sinon le même geste aurait deux
       fins selon le don choisi. Mesuré : `Choose` sur Alert sautait à Destiny. */
    if (currentGate(state.palier + 1).exists === false) {
      const cfg = catalogueCourant();
      if (cfg && cfg.fin === "close") { fermerLePanneau(); return; }
      goToStep(state.step + 1);
      return;
    }
    state.palier += 1;
    openSurface();
    return;
  }
  goToStep(state.step + 1);
}

/** LE PAS EN ARRIÈRE — d'abord un PALIER, une ÉTAPE sinon.
 *
 *  🔴 L'ORDRE N'EST PAS ARBITRAIRE, IL EST CE QUI RÉCONCILIE I.5 ET LE LOT 79.
 *  Reculer d'une étape depuis le 2ᵉ palier d'un catalogue sauterait le
 *  sous-écran qu'on vient de traverser — et c'est exactement le retour que le
 *  lot 79 réclamait (*« les sous-écrans d'un palier n'ont aucune ceinture,
 *  donc aucun retour »*). Reculer d'un palier quand il n'y en a pas serait,
 *  lui, un bouton mort. Un seul bouton, deux portées, jamais deux chemins
 *  concurrents pour le même pas.
 *
 *  ⛔ AUCUNE ACTION N'EST DÉFAITE EN RECULANT, et c'est délibéré : ce qui est
 *  posé au document reste posé. Revenir n'est pas annuler — le joueur
 *  retrouve ses choix et les change s'il veut. Un `BACK` qui effacerait
 *  serait un piège, et rien dans le croquis ne le demande. */
function pressBack() {
  /* ⭐ LE LORE SE REFERME EN PREMIER (lot 82). Il est une parenthèse dans la
     lecture d'un catalogue : en sortir doit rendre le catalogue, jamais faire
     reculer d'un palier ou d'une étape. C'est le même geste que le bouton de
     retour du panneau, offert au `BACK` de la coquille — deux chemins vers la
     même porte, et aucun des deux ne saute par-dessus l'autre. */
  /* ⭐ L'ITEM SE REFERME AVANT TOUT (2026-08-19). Il est le cran le plus
     intérieur du parcours, et le refermer ne valide RIEN — c'est la règle
     d'Eric : *« si je fais back sur un item, ça ne valide pas l'item »*. */
  if (state.parcoursItem) { state.parcoursItem = null; openSurface(); return; }
  if (state.lore) { state.lore = null; openSurface(); return; }
  /* 🔴 UN RETOUR QUI EFFACE, PARCE QU'IL PORTE LE MOT QUI EFFACE — Eric,
     2026-08-20 : *« si je dis à BS "I changed my mind" je reviens à B pour
     rechoisir un feat »*. Repartir choisir un autre don rend caducs SES choix à
     lui : sa liste de sorts et les sorts pris dedans. Les garder ferait
     resurgir des sorts de Magicien sous un don qui n'en donne plus.
     ⭐ MÊME PAIRE D'ORGANES QUE `I changed my mind` DU GUIDE (canon §5) : les
     signatures par `revoke`, les choix par `verbs.clear`. Aucun des deux ne
     connaît les règles de l'autre.
     ⛔ ET LA RACINE ELLE-MÊME SURVIT : on efface ce qui vit SOUS le don, pas le
     don. Il reste posé, donc le catalogue s'ouvre sur lui et « rechoisir » veut
     dire remplacer, jamais repartir d'un écran vide. */
  const cfgRetour = catalogueCourant();
  if (cfgRetour && cfgRetour.retourEfface && state.palier === 2) {
    oublierSousLaRacine(cfgRetour.path);
    state.palier = 1;
    openSurface();
    return;
  }
  if (state.palier > 1) { state.palier -= 1; openSurface(); return; }
  goToStep(state.step - 1);
}

/** Efface tout ce qui vit SOUS une racine — signatures et choix — sans toucher
 *  la racine. ⚠️ La liste des chemins est FIGÉE avant la boucle : on efface
 *  pendant qu'on la lit. */
function oublierSousLaRacine(racine) {
  const sous = (chemin) => chemin.startsWith(`${racine}.`) || chemin.startsWith(`${racine}[`);
  if (state.docWriters && state.document) {
    for (const chemin of ((state.document.build && state.document.build.confirmed) || []).slice()) {
      if (sous(chemin)) state.document = state.docWriters.revoke({ document: state.document, path: chemin });
    }
  }
  const verbs = state.engine && state.engine.build && state.engine.build.verbs;
  if (!verbs || !state.document) return;
  let document = state.document;
  const poses = ((document.build && document.build.choices) || [])
    .map((c) => c && c.path).filter((c) => typeof c === "string" && sous(c));
  for (const chemin of poses) document = verbs.clear({ document, path: chemin, kind: "choice" }).document;
  state.document = document;
  rebuild();
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
  /* ⭐ ET SANS PANNEAU DE LORE OUVERT (lot 82). Il appartient à l'écran où on
     l'a ouvert ; le laisser pendre ferait arriver sur Class avec la prose
     d'une espèce à l'écran — un état qu'aucun geste n'aurait demandé. Même
     famille que le palier juste au-dessus : ce qui est propre à un écran
     meurt quand on le quitte. */
  state.lore = null;
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
    /* ⚠️ DEUX FAITS DIFFÉRENTS, DEUX ATTRIBUTS — et ils étaient confondus.
       `data-status` dit OÙ ON EST dans la traversée (passé, courant, à venir) :
       c'est de la navigation. `data-fait` dit si le chapitre est FINI : c'est
       de l'avancement. Le vert vivait sur `status="done"`, c'est-à-dire sur
       « tu es passé devant » — un chapitre traversé sans rien y poser
       s'allumait quand même. Eric, 2026-08-19 : *« lorsqu'un chapitre de
       création est complet une lumière verte s'allume dans le numéro »*.

       ⭐ ET LE JUGE N'EST PAS ÉCRIT ICI : c'est `etapeFaite`, celui de Review,
       qui assemble le carnet et le document. Deux lumières jugées séparément
       finiraient par se contredire à l'écran, et c'est Review qu'on croirait. */
    item.dataset.status = index < state.step ? "done" : index === state.step ? "current" : "upcoming";
    /* 🔴 2026-08-19, SECONDE CORRECTION DU MÊME VOYANT — et elle vient d'Eric :
       *« c'est le done dans la carte spécifique qui allume le bouton species »*.
       Ce matin la lumière lisait « tous les plans sont répondus » ; elle lit
       maintenant LA SIGNATURE DU JOUEUR. Un chapitre entièrement rempli mais
       jamais confirmé reste ÉTEINT, et c'est voulu : le `Done` du guide est
       le geste qui l'allume.

       ⚠️ LES DEUX RÉPONSES COEXISTENT, ET C'EST LE POINT. `etapeFaite` (Review)
       dit ce que le carnet SAIT ; `estConfirme` dit ce que le joueur a VOULU.
       Un récapitulatif qui montre « done » sur une étape dont la lumière est
       éteinte n'est pas une contradiction : c'est exactement l'écart que le
       guide demande au joueur de refermer.

       ⏳ Les étapes qui n'ont pas encore leur parcours (Identity, Destiny,
       Abilities, Skills, Equipment) ne portent aucune signature : leur voyant
       reste éteint tant que leur guide n'existe pas. Signalé plutôt que
       masqué par un repli sur `etapeFaite`, qui rallumerait tout et ferait
       croire que le parcours est posé partout. */
    const racine = STEPS[index] && STEPS[index].id;
    /* 🔴 2026-08-19, TROISIÈME CORRECTION DU MÊME VOYANT — conséquence de la
       double validation supprimée. La lumière lisait la SIGNATURE DE LA
       RACINE, posée par le `Done` du guide ; ce `Done` ne signe plus, c'est
       `Next` qui le fait. Laissée telle quelle, elle serait restée éteinte sur
       un chapitre entièrement fini tant que le joueur n'en serait pas parti.
       ⭐ ELLE LIT DONC CE QU'ERIC A DEMANDÉ, MOT POUR MOT : *« lorsqu'un
       chapitre de création est COMPLET une lumière verte s'allume »*. Complet,
       c'est tous les items signés — pas « et en plus il est reparti ».
       ⚠️ LA SIGNATURE RESTE DANS LE OU, et il le faut : les étapes sans
       parcours (Identity) n'ont aucun item à compter, leur `Done` est tout ce
       qu'elles ont. Les deux réponses ne se contredisent pas — elles couvrent
       deux familles de chapitres. */
    const chapitre = parcoursDuChapitre(racine);
    item.dataset.fait = String(estConfirme(state.document, racine) || (
      Boolean(chapitre) && etapeAchevee({
        decisions: state.decisions, document: state.document, racine: chapitre.path
      })
    ));
    item.setAttribute("aria-current", index === state.step ? "step" : "false");
  });
  /* B0.3 — aucun chevron à gauche à la première étape, aucun à droite à la
     dernière, les deux au milieu. `hidden` plutôt qu'un `display:none` en
     feuille de style : le garde 4 des jetons l'interdit dans `shell.css`,
     et un bouton retiré du flux ne doit pas laisser sa place vide. */
  /* ⛔ ET LE RECENTRAGE NE VISE QUE CE QUI EST DANS LA PISTE. Les deux bouts
     en sont sortis (voir `mountFrame`) : demander à la piste de faire défiler
     jusqu'à un nœud qu'elle ne contient pas la ferait sauter au hasard. */
  const current = frame.items[state.step];
  if (current && frame.track.contains(current)) keepInView(frame.track, current, "x");
}

/* ══ LA SORTIE D'ÉTAPE — 🔴 `Validate` A DISPARU PARTOUT (lot 80, §5.1) ═══
   Eric, 2026-08-16, mot pour mot : *« 1 validate dégage PARTOUT »*. Ce n'est
   pas un réglage d'écran : le croquis des caractéristiques dessine `BACK` et
   `DONE` au pied du collecteur, et le mandat dit ce qu'ils sont — **le
   PATRON de la sortie d'étape**, pas la sortie d'UN écran.

   ⭐ C'EST DONC ICI QUE LA BASCULE SE JOUE, ET NULLE PART AILLEURS. Cette
   fonction était le seul producteur du bouton `Validate` ; elle est le seul
   producteur de la paire. Les dix écrans en héritent dans le même geste — il
   n'y a aucune migration écran par écran à faire, et c'est précisément
   pourquoi le bouton avait été construit ici plutôt que là-bas.
   ⏳ Ce que ce lot NE fait pas : donner à chaque écran SON mot (le croquis C
   dit `Choose your cantrips`, le croquis A `Finish`). `DONE` est le mot
   commun ; le renommer par écran est un lot à part.

   ══ ⚠️ CE QUE `BACK` RÉVEILLE, ET IL FALLAIT LE RELIRE AVANT D'ÉCRIRE ═════
   L'invariant I.5 disait *« `Back` n'existe plus — la molette le remplace »*,
   et le lot 79 l'avait PRÉCISÉ (§4.1 bis) : interdit comme navigation
   d'ÉTAPE, autorisé entre PALIERS, parce que la ceinture porte le retour
   entre les dix étapes mais qu'un sous-écran de palier n'a aucune ceinture.

   🔴 CE `BACK`-CI FAIT LES DEUX, ET C'EST CE QUI RÉCONCILIE LES DEUX LOIS :
   il recule d'un PALIER quand il y en a un, d'une ÉTAPE sinon. Le joueur n'a
   donc jamais deux chemins de retour concurrents pour le même pas — c'était
   tout l'argument de I.5 —, et le sous-écran de palier gagne le sien.
   ⛔ Ce qui reste interdit, et que le garde 17 tient maintenant en toutes
   lettres : qu'un ÉCRAN pose son propre `BACK`. Un seul producteur, ici.

   📌 LA PAIRE SE RECONSTRUIT AVEC LE CONTENU, donc aucune fonction de
   peinture : elle naît et meurt dans le `swapContent` de `refresh()`, comme
   le reste de la scène. C'est ce qui la dispense d'être un nœud persistant. */
/** La page courante ne fait-elle que distribuer des branches ? Abilities à son
 *  palier 1 : quatre méthodes et un panneau INFO, aucun geste à valider. */
function surUneRacineQuiBranche() {
  /* `< 2`, pas `!== 2` — même correction que le pied et le rail le 2026-08-20.
     Abilities n'a que deux paliers aujourd'hui, donc les deux écritures disent
     la même chose ; l'une reste vraie si un cran s'ajoute, l'autre non. */
  return STEPS[state.step].id === "abilities" && state.palier < 2;
}

/** Traduit un refus du noyau en une phrase de JOUEUR — ou en une phrase honnête
 *  quand on ne sait pas laquelle.
 *
 *  🔴 CE QUI ARRIVAIT AVANT, ET QU'ERIC A VU LE 2026-08-26 : le message du
 *  noyau partait TEL QUEL à l'écran. En effaçant son nom pour le retaper, le
 *  joueur lisait, en rouge, sur cinq lignes :
 *
 *    « fhpc/doc: rename : le document ne valide pas contre `fh-char/1` —
 *      1 refus : — « document.name » : 0 caractère(s), au moins 1 attendu(s). »
 *
 *  ⛔ C'est du français de DÉVELOPPEUR dans un écran que le joueur regarde —
 *  exactement ce qu'Eric avait déjà fait retirer le 23/08 de l'écran R
 *  d'Équipement. Et ça coûtait cinq lignes, qui faisaient sauter le budget de
 *  hauteur au moment précis où le joueur tape.
 *
 *  ⭐ ET ON LIT LA CAUSE, PAS LE TEXTE DU MESSAGE. Renifler les mots du noyau
 *  (« au moins 1 attendu ») marcherait aujourd'hui et casserait à la première
 *  reformulation, sans que rien ne le dise. La VALEUR, elle, dit tout : vide,
 *  ou trop longue. C'est la même donnée que le noyau a jugée.
 *
 *  ⚠️ ⛔ ET LE REPLI NE RECOPIE JAMAIS LE MESSAGE BRUT — c'est précisément par
 *  un repli « au pire on affiche l'erreur » que la fuite s'était installée. Un
 *  refus qu'on n'a pas prévu se dit en une phrase honnête, et le détail part
 *  dans la console, pour qui débogue. */
function motDuRefus(error, valeur, champ) {
  const texte = typeof valeur === "string" ? valeur : "";
  if (champ === "name") {
    if (texte.trim().length === 0) return "A character needs a name — even a placeholder.";
    if (texte.length > 200) return "That name is too long.";
  }
  /* ⚠️ ON NE SAIT PAS : ON LE DIT. Le détail part dans la console, pour qui
     débogue — c'est sa place, et c'est la seule. */
  if (typeof console !== "undefined" && console.warn) {
    console.warn(`refus sur « ${champ} » :`, error && error.message);
  }
  return "That change could not be recorded.";
}

function renderSortieEtape() {
  /* 🔴 UNE ÉTAPE VALIDÉE NE PRODUIT PLUS DE `Done` — Eric, 2026-08-26, capture
     à l'appui : *« y'a un Done dans le vide après validation de Identity »*.

     📏 REPRODUIT ET MESURÉ (375 × 553) : la carte-bilan portait
     `I changed my mind` · `Next` · `?`, et **88 px plus bas, sur le fond nu,
     un `Done`** que plus rien ne reliait à l'écran.

     ⛔ ET CE N'ÉTAIT PAS QU'UN DÉFAUT DE PLACEMENT — c'est ce qui rend ce
     correctif différent de celui de Destiny, où il suffisait de déclarer un
     hôte. Ici `Done` et `Next` étaient à l'écran EN MÊME TEMPS, ce que la
     norme écrite le matin même interdit : *« ils ne coexistent jamais — c'est
     le même moment vu avant et après »* (§6, les trois verbes d'Eric).
     ⭐ L'étape est validée : **il n'y a plus rien à valider**. Le déplacer dans
     la carte aurait donc rangé un bouton qui n'a plus d'office ; on le retire.

     ⚠️ ET LE BILAN N'EST PAS DÉMUNI POUR AUTANT : ses deux portes sont
     produites par `parcours-ecrans.mjs`, dans sa propre rangée — `I changed my
     mind` pour défaire, `Next` pour avancer. C'est exactement la ligne
     « validée » de la table de la norme. */
  if (estConfirme(state.document, STEPS[state.step].id)) return null;
  /* B9 — Review est la DESTINATION : aucun pas suivant, donc pas de porte.
     Un bouton mort au bas de la dernière page ne dirait rien à personne. */
  if (STEPS[state.step].id === "review") return null;
  /* ⛔ L'ÉQUIPEMENT NON PLUS — Eric, 2026-08-23 : *« dégage le Done en bas de
     page »*, précisé aussitôt : *« qui est dans le background »*. C'était bien
     la paire de la coquille, posée sous la dalle, à même le fond.
     ⭐ ET C'EST EXACTEMENT L'EXCEPTION CH6 JUSTE EN DESSOUS, AVEC LE MÊME
     ARGUMENT : l'écran R porte son propre `NEXT`, dessiné sur le croquis, dans
     la rangée `GEAR CART CRAFT NEXT`. Garder les deux, c'est deux commandes
     pour un geste — celle de la coquille en plus, hors de la dalle, sur le
     fond, là où rien d'autre ne vit.
     📌 La constante du croquis n'est pas touchée : le BELT reste visible, et
     c'est lui qui fait reculer. */
  if (STEPS[state.step].id === "equipment") return null;
  /* ⭐ CH6 — LES DEUX ÉCRANS À FICHE VALIDENT CHEZ EUX. Le pied de la fiche
     porte `CHOOSE`, qui ouvre EXACTEMENT la porte de ce bouton-ci ; les
     garder tous les deux serait deux commandes pour un geste, à dix pixels
     l'une de l'autre. Les croquis A et C ne dessinent que `LORE` / `CHOOSE`.
     ⛔ SEULEMENT AU PALIER 1 : le 2ᵉ palier n'a plus de fiche (c'est le menu
     des choix, B2.3), donc plus de `CHOOSE` — il garde ce pied, et il en a
     besoin. */
  const fiche = catalogueCourant();
  /* ⭐ SAUF DANS UNE DALLE D'ITEM (2026-08-19). Les écrans à fiche n'ont pas de
     pied au palier 1 — leur `CHOOSE` est sur la fiche — mais une dalle d'item
     n'est pas une fiche : c'est le cran le plus intérieur du parcours, et c'est
     la paire de la coquille qui l'en sort. Sans cette exception, l'item
     s'ouvrait sans aucune porte (mesuré dans la page). */
  /* ⚠️ `!== 2` EST DEVENU `< 2` LE 2026-08-20, DEUXIÈME ENDROIT DU MÊME
     DÉFAUT (l'autre est le rail, `paintAside`). La condition voulait dire
     « tant qu'on est sur la chaîne de fiches » et NOMMAIT un palier : le 3ᵉ
     repassait donc à travers, et BS s'ouvrait sans aucune porte — mesuré dans
     la page, exactement comme l'item s'était ouvert sans porte le 19/08.
     📌 Une borne écrite en `!==` sur un compteur qui peut grandir est une
     borne qui rouille : elle est juste tant que personne n'ajoute un cran. */
  if (fiche && fiche.fiche && state.palier < 2 && !state.parcoursItem) return null;
  /* 🔴 UN GUIDE DE PARCOURS PORTE SON PROPRE PIED — et il a fallu qu'Eric
     demande le `Next` pour que le doublon se voie. Mesuré à l'écran : la dalle
     de l'Inheritance affichait « I changed my mind · Next » DANS la dalle, et
     un `Done` FLOTTAIT dessous, sur le fond de la scène. Deux validations pour
     un geste — exactement ce qu'Eric a fait sauter le 19/08.
     ⭐ ÉCRIT SUR LE FAIT, comme le reste : « l'écran courant est-il un guide de
     parcours ? ». Une dalle d'ITEM garde la sienne — c'est le cran le plus
     intérieur, et c'est la paire de la coquille qui l'en sort. */
  /* 🔴 ET LE MÊME DOUBLON VIVAIT ENCORE CHEZ SPECIES ET CLASS — mesuré dans la
     page le 2026-08-20, Fighter, juste après `Choose` : la dalle portait
     « I changed my mind · Next », et « Back · Done » FLOTTAIT dessous.
     ⚠️ CE N'EST PAS COSMÉTIQUE, ET C'EST CE QU'ERIC A VU (*« il devrait y avoir
     une phase bilan dans les classes aussi, avec un next »*) : le `Done`
     flottant est celui du PALIER, il avance d'une étape SANS signer la racine.
     Le joueur qui suit le pied du bas quitte donc Class par la mauvaise porte,
     et le bilan — la conclusion verte et son `Next` — ne lui est jamais montré.
     Mesuré : après ce `Done`, retour à Class par la ceinture, le guide propose
     TOUJOURS `Next` — preuve que rien n'avait été signé.
     ⛔ LA PROTECTION D'AU-DESSUS NE POUVAIT PAS COUVRIR ÇA : elle est bornée à
     `state.palier < 2`, c'est-à-dire à la chaîne de fiches, et le guide s'ouvre
     précisément AU PALIER 2. Le commentaire d'hier affirmait que le drapeau
     `fiche` couvrait Species et Class ; il ne les couvrait qu'au palier 1,
     c'est-à-dire là où le guide n'est pas encore à l'écran.

     ⚠️ ET SEULEMENT QUAND LE PANNEAU OUVERT EST CELUI DE CETTE RACINE — la
     borne d'hier disait `!fiche`, ce qui était trop large dans un sens et trop
     étroit dans l'autre. Un panneau de catalogue ouvert PAR-DESSUS un guide (le
     don d'origine, BS, BSS) laisse bien l'étape en état « guide », et ces
     écrans-là doivent garder leur paire : le guide dessous n'est pas celui
     qu'on regarde. Ce qui les distingue n'est pas « y a-t-il un panneau ? »
     mais « ce panneau appartient-il à la racine du parcours ? » — le catalogue
     du don porte `background.originFeat[0]`, la racine est `background` ; celui
     de Class porte `class`, et c'est la racine elle-même. */
  if (!state.parcoursItem && !state.lore) {
    const racine = parcoursRacineCourante();
    const panneauEtranger = Boolean(fiche) && fiche.path !== racine;
    if (racine && !panneauEtranger) {
      const ou = etatDeLEtape({ decisions: state.decisions, document: state.document, racine });
      if (ou === ETAT.guide || ou === ETAT.bilan) return null;
    }
  }
  /* ⭐ UNE PAGE QUI NE FAIT QUE BRANCHER N'A PAS DE SORTIE — Eric, 2026-08-16 :
     *« la page racine n'a pas besoin de BACK ou DONE, car elle est à la racine
     et donne des branches »*.
     🔴 ET C'EST LA MÊME LOI QUE CH6 JUSTE AU-DESSUS, pas une seconde : un
     écran dont la page courante n'offre qu'un AIGUILLAGE n'a rien à valider —
     ses tuiles SONT le geste, comme `CHOOSE` est le geste d'une fiche. Poser
     un `DONE` éteint à côté de quatre boutons qui, eux, mènent quelque part,
     c'est offrir une porte morte à côté de quatre portes vivantes.
     ⛔ Et `BACK` n'y manque pas non plus : entre ÉTAPES, la ceinture porte le
     retour — c'est l'argument d'origine de I.5, et il n'a jamais cessé d'être
     vrai. `BACK` ne gagne sa place que là où il n'y a PAS de ceinture, c'est-
     à-dire dans les pages de palier (lot 79, §4.1 bis). La racine en a une.
     ⏳ Écrit sur un id parce que c'est le seul écran qui branche aujourd'hui,
     et que la coquille nomme déjà ses étapes ainsi (`currentGate`). Le jour où
     un deuxième branche, ce test devient un drapeau déclaré par l'écran —
     comme `fiche: true` l'a été pour les catalogues. */
  if (surUneRacineQuiBranche()) return null;
  const gate = currentGate();

  /* ══ `BACK` N'EXISTE QUE LÀ OÙ IL Y A UN PALIER À QUITTER ════════════════
     Eric, 2026-08-17, deux écrans de suite : *« Universe & Layers — back
     dégage »*, puis *« Concept — back dégage »*.

     ⭐ CE N'EST PAS UN RÉGLAGE PAR ÉCRAN, C'EST L'INVARIANT I.5 RENDU ENTIER.
     Il disait *« `Back` n'existe plus — la molette le remplace »*, et le
     lot 79 l'avait précisé : interdit comme navigation d'ÉTAPE, autorisé
     entre PALIERS, parce que la ceinture porte le retour entre les dix étapes
     mais qu'un sous-écran de palier n'a aucune ceinture. Le lot 80 avait
     élargi ce `BACK`-ci aux DEUX rôles ; les deux demandes d'Eric le ramènent
     à son rôle unique.
     ⛔ ÉCRIT SUR LE FAIT, JAMAIS SUR UN ID : « y a-t-il un palier derrière ? ».
     Species, Class et les pages de méthode d'Abilities gardent donc leur
     retour sans qu'on les nomme, et un futur écran à paliers l'aura d'office.
     ⚠️ CE QU'ON PERD, ET IL FAUT LE DIRE : à l'étape 3 palier 1, revenir à
     l'étape 2 passe désormais UNIQUEMENT par la ceinture. C'était déjà le
     chemin prévu par I.5 ; il n'a simplement plus de doublon. */
  /* ⭐ ET DANS UNE DALLE D'ITEM AUSSI (2026-08-19) : elle est un cran de plus à
     l'intérieur, donc « y a-t-il quelque chose derrière ? » y répond oui. La
     condition reste écrite sur le FAIT, jamais sur un id d'étape. */
  /* 🔴 « CANCEL » DANS UNE DALLE D'ITEM — Eric, 2026-08-19 : *« remplacer back
     par cancel »*. Et le mot est plus juste que le mien : quitter un item
     n'est pas RECULER d'un cran, c'est ABANDONNER ce qu'on y faisait — rien
     n'y sera signé. Ailleurs, `BACK` reste `BACK` : il recule vraiment.
     ⛔ UN SEUL PRODUCTEUR malgré les deux mots : c'est toujours la coquille
     qui pose ce bouton, et `pressBack` qui l'exécute (garde 17). */
  /* 🔴 LE MOT DIT LE GESTE, ET LES TROIS GESTES SONT DIFFÉRENTS — Eric,
     2026-08-20, en corrigeant ma fusion de la veille au soir :
     *« back n'efface pas ; pour effacer, c'est cancel ou i changed my mind »*.

     ⛔ J'AVAIS UNIFIÉ LES TROIS MOTS EN UN. C'était une faute, et elle est
     exactement celle que le canon reproche au texte de conclusion : **un
     libellé nomme ce que son bouton FAIT**. Donner « I changed my mind » à un
     bouton qui ne fait que reculer d'un palier, c'était promettre un effacement
     qui n'arrive pas — la même faute que le « Reopen it » qui nommait une porte
     inexistante, dans l'autre sens.

     LES TROIS, ET CE QU'ILS FONT :
     · `Back`  — RECULE d'un palier. N'efface RIEN : revenir de BS vers B0 garde
                 la liste posée, et c'est ce qu'on veut.
     · `Cancel` — ABANDONNE une dalle d'item : rien n'y sera signé (Eric,
                 2026-08-19 : *« quitter un item n'est pas reculer d'un cran »*).
     · `I changed my mind` — au pied du GUIDE, et lui seul : il RÉVOQUE et
                 EFFACE, par deux organes (`revoke` + `verbs.clear`, canon §5).

     ⭐ CE QUE JE GARDE DE LA PASSE D'HIER : la casse. `Done` et non `DONE` —
     c'est le mot d'Eric, et il s'accorde avec le pied du guide.
     ⛔ UN SEUL PRODUCTEUR, INCHANGÉ : la coquille pose ce bouton, `pressBack`
     l'exécute (garde 17). Ce sont les mots qui varient, jamais le propriétaire. */
  /* LE MOT SUIT LE GESTE (la règle d'Eric du jour) : `Cancel` abandonne un
     item, `I changed my mind` efface une branche, `Back` ne fait que reculer. */
  const cfgRetour = catalogueCourant();
  const effaceAuRetour = Boolean(cfgRetour && cfgRetour.retourEfface && state.palier === 2);
  const motDuRetour = state.parcoursItem ? "Cancel" : effaceAuRetour ? "I changed my mind" : "Back";
  const back = (state.palier > 1 || state.parcoursItem) ? button(motDuRetour, () => pressBack()) : null;
  if (back) back.className = "sortie-bouton sortie-back";

  const done = button("Done", () => pressDone());
  done.className = "sortie-bouton sortie-done";
  /* B0.11 lu à travers I.4 — il s'allume aux conditions DU PALIER COURANT.
     Éteint, il reste LISIBLE : un bouton qu'on ne peut pas presser doit dire
     pourquoi par son apparence, jamais disparaître. */
  done.dataset.lit = String(gate.ready);
  done.disabled = !gate.ready;

  return el("div", "sortie", [back, done].filter(Boolean));
}

/* ══ OÙ LA SORTIE SE POSE — déclaré par l'écran, produit par la coquille ══
   Eric, 2026-08-17 : *« Back et Done vont en dessous du texte “Drag a die onto
   an ability” »* — c'est-à-dire DANS la dalle du collecteur, sous sa consigne,
   et non sur une bande à part posée sur le fond de la scène.

   🔴 CE N'EST PAS UN ASSOUPLISSEMENT DU GARDE 17, C'EST SA MOITIÉ RESTANTE.
   Le garde interdit à un écran de PRODUIRE un retour ; il n'a jamais rien dit
   de l'endroit où le pied de la coquille se pose. Ici l'écran n'écrit ni
   `BACK` ni `DONE` ni le moindre `pressBack` : il pose un attribut vide et la
   coquille décide, comme toujours, s'il y a une sortie et ce qu'elle contient.
   ⭐ Même partage que `data-scroller="grille"` (lot 79) : **le marqueur est une
   déclaration, pas une inférence**. Un écran qui n'en pose pas garde le pied
   au bas de la scène, à l'octet — c'est le cas des neuf autres. */
/* ⛔ LE CHAPEAU DE CHAPITRE EST MORT — Eric, 2026-08-19, en le voyant :
   *« bande noire sert à rien, elle dégage »*.

   ⭐ ET IL AVAIT RAISON DEUX FOIS. Ce chapeau est né LE MATIN, avant que le
   tutoriel spécifique n'existe. Les deux disaient la même chose au même
   endroit — « voici ce qui est attendu de vous » — l'un en une phrase grise
   et pleine largeur, l'autre avec un titre, un chapô et des points. Deux voix
   pour un message, et la moins bonne passait devant.

   La règle d'Eric du matin (« il y a toujours un F2 avec line bleed pour
   introduire ce qui est attendu du joueur ») N'EST PAS abandonnée : c'est le
   TUTORIEL SPÉCIFIQUE qui la porte, et il la porte mieux. */

function poserLaSortie(contenu, sortie) {
  const noeuds = [contenu, sortie].filter(Boolean);
  if (!contenu || !sortie || typeof contenu.querySelector !== "function") return noeuds;
  const hote = contenu.querySelector("[data-sortie-ici]");
  if (!hote) return noeuds;
  /* 🔴 LE LIVRE DÉCLARÉ PAR L'ÉCRAN ENTRE EN TÊTE DE LA RANGÉE — Eric,
     2026-08-26 : *« Rules dégage sous forme d'un livre dans la rangée de
     boutons »*, et la paire ratifiée le même jour : *« le livre et le `?` sont
     cadrés à gauche et à droite de la rangée »*.
     ⭐ POURQUOI CE DÉTOUR AU LIEU D'UN `append` DANS L'ÉCRAN : la rangée est
     produite ICI et nulle part ailleurs (garde 17). Un écran qui la
     fabriquerait pour y glisser son livre reprendrait la main sur `Back` et
     `Done` — c'est précisément ce que le garde interdit. Il pose donc un
     NŒUD et la coquille le place, comme elle place tout le reste.
     ⚠️ `prepend`, pas `append` : la gauche est la place du livre, la droite
     celle du `?`. Et si aucun écran n'en déclare, il ne se passe rien. */
  const livre = hote.querySelector(":scope > .livre-de-sortie");
  if (livre) sortie.prepend(livre);
  /* 🔴 ET LE `?` ENTRE PAR LA DROITE — Eric, 2026-08-26 : *« on veut avoir une
     chance de tenir dans une hauteur de SE »*, et sa norme de la PAIRE :
     *« le livre et le `?` cadrés à gauche et à droite de la rangée »*.

     ⛔ ET ÇA NE RÉCUPÈRE AUCUNE HAUTEUR — je l'avais écrit ici, c'était FAUX,
     et la correction vaut d'être gardée. J'avais lu le `?` à « 44 px » dans un
     rectangle et j'en avais déduit qu'il occupait une ligne. Il porte
     `position: absolute; right: 8; bottom: 8` : **il ne coûtait rien au flux**.
     ⭐ CE QUI M'A DÉTROMPÉ EST UNE ADDITION, pas une intuition : 58 + 16 + 137
     + 16 + 249 + 64 + 16 de rembourrage = **556**, et la carte mesure 555. Le
     compte fermait DÉJÀ sans les 44 px — donc ils n'y avaient jamais été.
     📌 **Un rectangle de 44 px de haut ne dit pas qu'un élément occupe 44 px de
     flux.** `getBoundingClientRect` mesure ce qui est PEINT, pas ce qui POUSSE.
     Pour savoir ce qu'un bloc coûte, on additionne, ou on lit sa position.

     ⭐ CE QUE CE DÉPLACEMENT APPORTE QUAND MÊME, ET C'EST SUFFISANT : le `?`
     cesse d'être une pastille flottante posée sur un coin de dalle pour entrer
     dans la rangée que la norme lui assigne — la PAIRE, livre à gauche, `?` à
     droite, mesurée ici à 24 · 150 · 307 px.

     ⚠️ POURQUOI ICI ET PAS LÀ OÙ LE `?` EST FABRIQUÉ : il est posé pendant
     `renderStepContent`, c'est-à-dire **avant que la rangée n'existe** — c'est
     `poserLaSortie` qui la reçoit. Un `append` au moment de sa fabrication ne
     pouvait donc viser qu'un nœud absent. On le DÉPLACE une fois la rangée
     posée, exactement comme le livre trois lignes plus haut.
     ⭐ `append` pour le `?`, `prepend` pour le livre : c'est toute la paire, et
     elle tient en deux lignes symétriques. Un écran sans rangée hébergée ne
     change pas d'un pixel — le `?` y reste où il était. */
  const interro = hote.querySelector(":scope > .tuto-point");
  if (interro) sortie.append(interro);
  hote.append(sortie);
  return [contenu];
}

/** LE SLOT HORIZONTAL (B0.19) — garni par l'écran qui en a un, vidé pour
 *  les autres. Aujourd'hui : Compétences seul. Le slot PERSISTE, ce qu'un
 *  écran y met peut changer — même loi que le rail. */
function paintTopbar() {
  /* ⛔ L'ÉQUIPEMENT N'A PLUS DE BARRE DU HAUT — Eric, 2026-08-23, en montrant
     l'écran : *« dégage tout ce que je vois à l'écran, tu recâbleras après »*.
     La bourse, le `?` et la loupe s'en vont avec la molette de catégories : le
     croquis de R ne les dessine pas, et l'écran ne porte plus que sa carte.
     ⏳ « Tu recâbleras après » — la bourse revient par `B1`/`B2`, la recherche
     par son propre écran. Ce qui part ici est le CÂBLAGE, pas le besoin.
     ⭐ Le slot, lui, PERSISTE (B0.19) : c'est sa loi, un écran le garnit ou le
     laisse vide. Compétences le garnit encore. */
  /* ⛔ COMPÉTENCES NE GARNIT PLUS LE SLOT DU HAUT — Eric, 2026-08-26 : *« la
     barre blanche doit TOTALEMENT disparaître »*. Sa molette de catégories et
     sa ligne de pool vivent désormais sur la DALLE FIXE de l'écran
     (`skills-step.mjs`, bande 1), où elles ont quelque chose sous elles.
     ⭐ Le slot, lui, PERSISTE et reste vide — c'est sa loi (B0.19), la même qui
     a servi à l'Équipement le 23/08. ⛔ Ne pas le supprimer : un écran futur
     peut le garnir, et le retirer demanderait de le réinventer. */
  const barre = null;
  frame.topbar.hidden = !barre;
  swapContent(frame.topbar, barre ? [barre] : []);
}

/** Le popup (III.4) — montré ou caché selon `state.popup`, jamais selon un
 *  nœud qui traînerait dans le contenu. */
function paintPopup() {
  if (!state.popup) { frame.popupLayer.hide(); return; }
  /* la pastille §7 : le rôle se peint sur l'HÔTE, la CSS fait le reste. */
  frame.popup.dataset.role = state.popup.role || "guide";
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
  /* ⭐ Et le PANNEAU DE LORE non plus (lot 82) : on lit une page, on ne
     parcourt plus un catalogue. Même raison exactement que le 2ᵉ palier. */
  /* ⭐ ET LE PARCOURS FERME LE RAIL DÈS LE `Choose` (Eric, 2026-08-19) :
     *« quand on a choisi Choose pour une species ON PASSE EN MODE FF »*, et on
     y reste. Le rail ne revient qu'au catalogue — c'est-à-dire quand plus
     aucune espèce n'est retenue, après un `I changed my mind`. */
  const enParcours = cfg && cfg.parcours &&
    etatDeLEtape({ decisions: state.decisions, document: state.document, racine: cfg.path }) !== ETAT.catalogue;
  /* ⚠️ `!== 2` EST DEVENU `< 2` LE 2026-08-20, et c'est le 3ᵉ palier qui l'a
     exigé : BS gardait son rail alors que B0, juste avant lui, l'avait perdu.
     La condition ne parlait pas de « au-delà du catalogue », elle nommait UN
     palier — donc le suivant repassait à travers. Mesuré dans la page. */
  const show = Boolean(rail) && state.palier < 2 && !state.lore && !enParcours; // le menu des choix (B2.3) n'a pas de rail : il n'y a plus douze fiches à suivre
  frame.aside.hidden = !show;
  frame.area.dataset.aside = show ? "on" : "off";
  /* ⭐ L'ÉCRAN DIT SA LETTRE, ET LUI SEUL (Eric, 2026-08-19) — c'est la moitié
     du modèle qui a tout réparé : une DALLE ne peut pas savoir s'il y a un
     rail, seul l'écran le sait. Le chapeau de chapitre s'est déclaré « FF3 »
     sur huit chapitres alors qu'il était un F sur quatre d'entre eux, parce
     que le modèle lui demandait une chose qu'il ignorait.
     F = le menu latéral est là · FF = il ne l'est pas. */
  frame.area.dataset.ecran = show ? "F" : "FF";
  swapContent(frame.aside, show ? [rail] : []);
}

/* ══ LES DEUX SEULS VERBES DE REDESSIN (SOCLE.md) ═══════════════════════ */

/** UNE MISE À JOUR — le défilement SURVIT. C'est ce qu'appelle chaque
 *  clic de choix. */
/* ══ LA MÉMOIRE SUIT LE DOCUMENT — quel que soit le geste qui l'a changé ═══
   🔴 POURQUOI ICI, ET PAS DANS `rebuild()`. `rebuild` est le passage obligé
   des CHOIX, pas des changements de document : `rename`, `describe`, `confirm`
   et `revoke` écrivent le document puis appellent `refresh()` sans repasser par
   lui. Une sauvegarde posée dans `rebuild` aurait donc perdu le NOM du
   personnage — le premier champ que le joueur remplit.
   ⭐ `refresh()` est le seul point que TOUS les gestes traversent. On n'y écrit
   pas « à chaque repeinte » pour autant : on compare le texte canonique à
   celui qu'on a déjà gardé. Tourner le téléphone repeint et n'écrit rien.
   ⛔ ET C'EST LE MÊME TEXTE QUE L'EXPORT, par la même fonction : deux
   sérialisations donneraient deux personnages identiques que rien ne
   reconnaîtrait comme tels. */
let dernierTexteGarde = null;
function memoriser() {
  if (!state.document) return;
  const texte = canonicalText(state.document);
  if (texte === dernierTexteGarde) return;
  dernierTexteGarde = texte;
  const issue = ecrirePersonnage(texte);
  state.memoire = issue.ok ? { ok: true } : { ok: false, raison: issue.raison };
}

function refresh() {
  /* ⚠️ AVANT DE PEINDRE, pas après : le Menu affiche `state.memoire`, et
     l'écrire après le rendu montrerait l'état du tour précédent. */
  memoriser();
  paintBelt();
  paintAside();
  paintTopbar();
  paintPopup();
  swapContent(frame.stage, poserLaSortie(renderStepContent(), renderSortieEtape()));
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
    const [engine, exemple, schema] = await Promise.all([bootEngine(), loadExampleDocument(), loadDocSchema()]);
    state.engine = engine;
    /* ══ ON REPREND LE PERSONNAGE DU NAVIGATEUR, S'IL Y EN A UN ═════════════
       ⭐ ET IL N'A PAS BESOIN D'ÊTRE « MIGRÉ » QUAND LES RÈGLES BOUGENT. Le
       document ne garde pas une fiche calculée : il garde les CHOIX et les
       SIGNATURES, et `rebuild()` re-dérive tout depuis la pile montée. Un
       personnage gardé avant la bascule des compétences FH est donc REJOUÉ sur
       les couches du jour, et ce qui ne passe plus est verrouillé et NOMMÉ par
       l'organe qui existe déjà (« These skills are no longer valid for this
       class »). Rien de neuf à écrire pour ça.
       ⚠️ ET S'IL N'EST PLUS DÉRIVABLE DU TOUT, `rebuild()` le dit déjà
       (`derivationImpossible`) au lieu de faire tomber la page.
       ⛔ UN REFUS DE LECTURE NE SE TAIT PAS : on repart de l'exemple ET on
       garde la raison, que le Menu affiche. Retomber sur l'exemple en silence
       ferait croire au joueur que son personnage n'a jamais existé. */
    const garde = lirePersonnage();
    if (garde.etat === "refus") state.memoireIgnoree = garde.raison;
    state.document = garde.etat === "lu" ? garde.document : exemple;
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
