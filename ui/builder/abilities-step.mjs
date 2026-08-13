/* ══ L'ÉTAPE ABILITIES — lot 45, corrigée lot 50, corrigée lot 51 ═══════
   ⛔ ZÉRO plan `decisions[]` pour ce chemin (mesuré, commande §0) —
   contrairement à Compétences/Class/Species, cet écran ne descend PAS le
   carnet : il lit `document.build.choices` directement (le SEUL endroit où
   vivent les six valeurs et la méthode choisie) et `resolved.abilities`
   (le SEUL endroit où lire le score FINAL, boosts compris, tel que le
   moteur le rend — jamais recalculé ici, même loi que le compteur de
   `skills-step.mjs`).

   ⭐ LOT 50 — LE DÉFAUT QU'ERIC A RENCONTRÉ : on ne pouvait pas distribuer
   ses six dés sur ses six caractéristiques. Trois rangées restaient
   bloquées sur les valeurs du personnage d'exemple (§0 de la commande,
   mesuré sur la page déployée : `13`, `12`, `10` n'étaient dans le lot
   d'AUCUN dé, et pourtant elles « mangeaient » un dé chacune).

   LA PRÉMISSE QUI A CÉDÉ (lot 45, pas une négligence) : « un nombre suffit
   à identifier un dé ». `optionsForRow` retirait du lot PAR LA VALEUR —
   or une valeur qui ressemble à un dé (le `14` que DEX portait déjà, hors
   de tout tirage) lui volait sa place, et une valeur qui ne ressemble à
   rien (`13`, `12`, `10`) ne consommait jamais rien et revenait à vie
   (`renderAssignRow`, `options.unshift(current)`).

   LA FORME REPRISE — `~/tools/fh-skills/fh-skill-builder.html:731`, le
   builder v1 : `assign: {STR:null, DEX:null, …}` — UNE CARACTÉRISTIQUE
   POINTE VERS L'INDEX D'UN DÉ, JAMAIS VERS SA VALEUR. Deux dés à 14 sont
   alors deux index distincts (jamais confondus), et une rangée non
   distribuée porte `null` — un état que l'écran d'avant ne savait pas
   exprimer, faute de mieux qu'une comparaison de nombres.

   ⚖️ DÉCISION D'ARCHITECTE (2026-08-13, §2a) — cette carte `clef → index`
   vit HORS DOCUMENT, au même endroit que le lot lui-même : `rollBatch`
   (`state.abilityRoll` dans `shell.mjs`) porte maintenant un champ
   `assign`. Elle meurt avec le lot — un `reroll` la remet entière à `null`
   (§2b, voir `emptyAbilityAssign` plus bas) — et LE DOCUMENT NE GAGNE
   AUCUN CHAMP : `set()` continue de poser le SCORE, exactement comme avant
   (test « le document ne gagne aucun champ », `tests/abilities-step.test.mjs`).

   ⭐ LE MODE EST UNE LISTE (commande §3a-bis) : `ABILITY_METHODS` porte
   aujourd'hui deux entrées (`roll`, `manual`), et CHAQUE ENTRÉE PORTE SON
   PROPRE `render`. `renderAbilitiesStep` ne branche JAMAIS sur un id de
   méthode — il ne compare QUE `method.id === mode.id` pour savoir laquelle
   est ACTIVE (un état, pas un comportement) et appelle `method.render(...)`
   sans jamais regarder lequel c'est. Une troisième méthode (Standard Array,
   Point Buy, 4d6-garder-3…) est donc UNE ENTRÉE DE PLUS dans ce tableau,
   jamais un `if`/`else if` de plus dans `renderAbilitiesStep` — corrigé sur
   revue d'architecte (voir INVENTAIRE-LOT-45.md, « le branchement était
   dans la boucle, pas dans le tableau ») et PROUVÉ par un test qui ajoute
   une troisième méthode à `ABILITY_METHODS` (une fausse, avec son `render`)
   SANS TOUCHER UNE LIGNE DE CE FICHIER (`tests/abilities-step.test.mjs`).

   ⚠️ LE HASARD VIT ICI, ET C'EST VOULU (commande §3a.4) : la loi « le
   moteur prononce, l'écran affiche » parle des RÈGLES OPPOSABLES
   (validate()), pas de la GÉNÉRATION d'un nombre que le joueur pose
   lui-même avec `set()` — exactement ce que ce fichier fait. Le lot de dix
   dés lui-même ne survit dans AUCUN champ (Eric, 2026-08-13) : `rollBatch`
   vit dans `shell.mjs` (`state.abilityRoll`), jamais dans le document.

   ⛔ LE PLAFOND DE 18 N'EST PAS ICI (commande §3c) : `abilities.str = 20`
   passe aujourd'hui avec ZÉRO refus (mesuré). Ce fichier se contente de
   DÉCLARER l'alerte — une phrase, jamais un blocage, jamais une ligne qui
   empêcherait `onAction` de partir. Tranché par Eric le 2026-08-13,
   POSTÉRIEUR à la commande : l'écran prévient, le moteur laisse.

   ⭐ LOT 51 — LE DÉFAUT SUIVANT, TROUVÉ EN REGARDANT LA PAGE DÉPLOYÉE JUSTE
   APRÈS LA FUSION DU LOT 50 : une fois les six dés distribués, ZÉRO option
   restait cliquable sur les six rangées (§0 de sa commande, mesuré :
   « str: 1 option, 0 cliquable », ×6). La cause, lue dans l'ancienne forme
   d'`optionsForRow` (par CLEF, ci-dessus le fantôme dans l'historique) :
   elle rendait « les dés non assignés, plus le sien » — et « non assignés »
   devient VIDE une fois les six posées, qui est l'état NORMAL en fin
   d'étape, pas un cas limite. Le lot 50 n'a pas mal travaillé : son test de
   réassignation avait TOUJOURS un dé libre sous la main (voir
   INVENTAIRE-LOT-51.md).

   ⚖️ DÉCISION D'ARCHITECTE (§1a/§1b) — `optionsForRow` rend maintenant
   TOUJOURS LES SIX dés du lot gardé, quel que soit l'état de la
   distribution ; cliquer un dé déjà tenu par une AUTRE rangée les ÉCHANGE
   (jamais « libère puis repose » — une rangée ne peut jamais rester vide,
   `rebuild()` jette si l'une des six manque, §0 encore). Cette fonction et
   `renderAssignRow` ne font QUE lister/nommer le geste ; le SWAP lui-même
   (deux `set` sur le document, deux entrées de `assign` qui permutent —
   §1d : le document ne gagne toujours aucun champ) vit dans `shell.mjs`,
   `applyDecisionAction`, action `assignAbilityRoll` — voir son en-tête. */

import { renderPicker } from "./carnet.mjs";
import { ABILITY_KEYS } from "../../src/build/index.mjs";
import { rollAbilitySet } from "./dice.mjs";

export { rollAbilitySet };

/** La carte d'assignation VIDE — les six clefs à `null`, rien distribué.
 *  Exportée pour que `shell.mjs` la pose sur `state.abilityRoll.assign` à
 *  CHAQUE nouveau lot (`roll` ET `reroll` — commande §2b : « un nouveau lot
 *  remet toute la carte à null »), sans dupliquer `ABILITY_KEYS` là-bas. Ce
 *  fichier importe déjà `ABILITY_KEYS` (ligne ci-dessus) ; `shell.mjs` n'a
 *  pas à le réimporter pour ce seul usage. */
export function emptyAbilityAssign() {
  const assign = {};
  for (const key of ABILITY_KEYS) assign[key] = null;
  return assign;
}

/** La liste des méthodes — voir l'en-tête. `render(ctx)` fabrique le CORPS
 *  de la méthode (au-delà du sélecteur commun) et REND UN TABLEAU DE
 *  NŒUDS — `renderAbilitiesStep` les ajoute avec `block.append(...)`, sans
 *  jamais savoir ce qu'ils contiennent. `summary` est la phrase d'état
 *  quand la méthode N'EST PAS active (§2 du chantier : « rien ne se
 *  cache »). Les deux fonctions `renderRollMethod`/`renderManualMethod`
 *  sont définies plus bas (hissées par la déclaration `function` — l'ordre
 *  du fichier n'a pas d'importance pour ce tableau). */
export const ABILITY_METHODS = [
  { id: "roll", label: "Roll (3d6 × 10, keep 6)", summary: "Not selected — switch to it to draw ten dice.", render: renderRollMethod },
  { id: "manual", label: "Manual entry", summary: "Not selected — switch to it to type six scores directly.", render: renderManualMethod }
];

const ABILITY_MODE_PATH = "abilities.mode";
const ABILITY_CAP = 18; // déclaré, jamais opposé — voir l'en-tête et INVENTAIRE-LOT-45.md
/* La plage de la saisie manuelle : un choix COSMÉTIQUE de widget (jusqu'où
   les boutons vont), PAS une règle. Elle dépasse volontairement le plafond
   de 18 pour que l'alerte ait une chance de se déclencher sans qu'aucun
   bouton ne soit retiré — retirer les valeurs > 18 SERAIT le blocage que
   commande §3c interdit. */
const MANUAL_ENTRY_RANGE = Array.from({ length: 20 }, (_, i) => i + 1); // 1..20

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/** La dernière valeur posée sur `abilities.<key>` — lue dans
 *  `document.build.choices`, jamais dans `resolved` (qui inclut les boosts
 *  d'une future Inheritance, hors périmètre de cet écran). `undefined` si
 *  rien n'a encore été posé. */
export function currentAbilityValue(document, key) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const entry = choices.find((c) => c.path === `abilities.${key}`);
  return entry ? entry.value : undefined;
}

/** La méthode actuellement posée sur `abilities.mode`, ou `null` si rien
 *  n'est posé, ou si la valeur posée ne désigne AUCUNE des méthodes que ce
 *  lot construit (cas mesuré : le personnage d'exemple porte déjà
 *  `"standard"`, une méthode SRD que ce lot n'implémente pas — §3a-bis).
 *  Un mode inconnu n'est pas une faute : il retombe simplement sur la
 *  première méthode connue, avec sa propre note « rien ne se cache ». */
export function currentAbilityMode(document) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const entry = choices.find((c) => c.path === ABILITY_MODE_PATH);
  if (!entry) return { raw: undefined, id: ABILITY_METHODS[0].id, known: true };
  const known = ABILITY_METHODS.some((m) => m.id === entry.value);
  return { raw: entry.value, id: known ? entry.value : ABILITY_METHODS[0].id, known };
}

/** Les DÉS GARDÉS — lot 51, §1a de la commande d'architecte. Rend TOUJOURS
 *  les SIX index du lot retenu, quel que soit l'état de la distribution —
 *  jamais « les libres plus le sien » (la forme du lot 50, ci-dessous en
 *  commentaire historique). Cette dernière tombait à UNE SEULE option par
 *  rangée dès que les six étaient posées (défaut mesuré §0 de LA COMMANDE
 *  DE CE LOT, sur la page déployée juste après la fusion du lot 50) : zéro
 *  geste restait possible pour changer d'avis, alors que « toutes
 *  distribuées » est l'état NORMAL en fin d'étape, pas un cas limite.
 *
 *  ⭐ « Toujours les six » est la SEULE forme où le geste reste possible
 *  dans n'importe quel état (0 à 6 rangées servies) : filtrer emporterait
 *  fatalement l'option qui permet d'ÉCHANGER (§1b — cliquer un dé déjà tenu
 *  par une autre rangée échange les deux). C'est `selected` (dans
 *  `renderAssignRow`) qui distingue « ce dé est déjà le mien » (actif,
 *  cliquer ne fait rien) de « ce dé est ailleurs ou libre » (cliquer pose
 *  ou échange) — `optionsForRow` ne fait plus ce tri, il ne fait plus QUE
 *  lister. Ne regarde toujours pas `document`/`currentAbilityValue` : la
 *  liste des dés ne dépend que du lot lui-même, jamais des valeurs déjà
 *  posées au personnage (c'était la cause du défaut du lot 50). */
export function optionsForRow(rollBatch) {
  const kept = rollBatch && Array.isArray(rollBatch.rolls) ? rollBatch.rolls.filter((roll) => roll.kept) : [];
  return kept.map((roll) => roll.index);
}

function abilityLabel(key) { return key.toUpperCase(); }

function renderModeSwitch(activeId, unknownRaw, onAction) {
  const wrap = el("div", "ability-mode-switch");
  wrap.append(renderPicker({
    options: ABILITY_METHODS.map((m) => m.id),
    selected: [activeId],
    labelOf: (id) => ABILITY_METHODS.find((m) => m.id === id).label,
    onSelect: (id) => onAction({ kind: "set", path: ABILITY_MODE_PATH, value: id })
  }));
  if (unknownRaw !== undefined) {
    /* LOT 55, §2.1 — la phrase d'avant (« isn't built by this screen yet »)
       est du langage de CHANTIER affiché au joueur : il n'a rien à faire de
       ce qui est construit ou non, seulement de ce qu'il regarde et de ce
       qu'il peut faire. Cette phrase-ci dit les deux : la méthode que le
       personnage porte (`unknownRaw`), et laquelle est montrée à la place —
       sans dire pourquoi, côté chantier, ce n'est pas la sienne. */
    wrap.append(el("p", "ability-mode-note", [text(
      `“${unknownRaw}” isn't offered on this screen — showing ${ABILITY_METHODS[0].label} instead.`
    )]));
  }
  return wrap;
}

/* ⚖️ LOT 50, §2d — le plafond de 18 ne parle QU'AU NIVEAU 1 (Eric,
   2026-08-13, postérieur à la commande d'origine) : au-delà, le SRD reprend
   la main (plafond 20). `renderCapWarning` lisait déjà `resolved` pour le
   score ; il lit maintenant AUSSI `resolved.identity.level` — même chemin
   que `skills-step.mjs` (`resolved.identity.level`), jamais un `level`
   recalculé ici. */
function renderCapWarning(resolved, key) {
  if (!resolved || !resolved.abilities || !resolved.abilities[key]) return null;
  if (!resolved.identity || resolved.identity.level !== 1) return null;
  const score = resolved.abilities[key].score;
  if (typeof score !== "number" || score <= ABILITY_CAP) return null;
  /* ⛔ Alerte seulement — RIEN n'empêche `onAction` de partir plus haut.
     Le moteur laisse ; §4 ADDENDUMS, tranché le 2026-08-13, cité en tête. */
  return el("span", "ability-cap-warning", [text(`> ${ABILITY_CAP} at creation`)]);
}

/* ══ LA COLONNE « FINAL » — corrigée sur mesure d'architecte, 2026-08-13 ═
   Le défaut mesuré à l'écran : la ligne montrait le CHOIX BRUT (13) à
   côté d'un modificateur qui n'était PAS le sien (+2, celui du score
   FINAL 14, boosts d'Inheritance compris) — deux registres différents,
   aucun mot pour le dire, et le score final lui-même n'apparaissait nulle
   part. Ce n'était pas un bug de calcul (chaque colonne avait raison dans
   son registre) : un défaut d'affichage.

   ⛔ DEUX LOIS TENUES ICI, LES DEUX FERMES (demande de l'architecte) :
   1. le champ éditable (le picker, dans `renderAbilityRow`) reste le CHOIX
      BRUT — jamais inversé, c'est lui que `set()` écrit ;
   2. `score`/`mod` sont LUS dans `resolved.abilities[key]`, À L'OCTET —
      jamais recalculés ici (même loi que les 20 tests du lot 40 : « un
      total menteur s'affiche menteur »). Cette fonction ne fait AUCUNE
      arithmétique — pas même la comparaison qui décide `data-boosted` ne
      touche à aucun des deux nombres, elle les compare tels quels. */
/* Exportée au lot 46 — Inheritance pose des bonus de caracs (`background.
   boost.<clef>`) et doit montrer LEUR EFFET « de la même façon » que cette
   colonne (commande du lot 46, §0) : même octet de `resolved.abilities`,
   même format, jamais une seconde fonction qui pourrait diverger. */
export function renderFinalColumn(resolved, key, rawValue) {
  if (!resolved || !resolved.abilities || !resolved.abilities[key]) return null;
  const { score, mod } = resolved.abilities[key];
  if (typeof score !== "number") return null;
  const modText = typeof mod === "number" ? (mod >= 0 ? `+${mod}` : String(mod)) : "—";
  const cell = el("span", "ability-row-final");
  /* Piste retenue parmi les trois de l'architecte : le brut reste éditable
     (picker inchangé), et LE FINAL se lit dans une cellule à part, TITRÉE
     (« Final »), toujours affichée — boosté ou non, pour que l'absence de
     boost soit aussi lisible que sa présence, jamais une case qui
     apparaît/disparaît. `data-boosted` ne fait qu'ANNONCER l'écart déjà lu
     dans les deux valeurs, pour que l'œil s'y arrête sans qu'il ait à
     comparer les deux nombres lui-même. */
  cell.dataset.boosted = String(rawValue !== undefined && score !== rawValue);
  cell.append(el("span", "ability-row-final-label", [text("Final")]));
  cell.append(el("span", "ability-row-final-value", [text(`${score} (${modText})`)]));
  return cell;
}

/** UNE LIGNE — le corps commun à `roll` et `manual` : label, note optionnelle
 *  (lot 50 : « cette valeur ne vient pas du lot »), picker, colonne
 *  « Final », alerte de plafond. Le picker lui-même (`pickerProps`) est
 *  ENTIÈREMENT fabriqué par l'appelant — c'est LÀ que les deux méthodes
 *  divergent depuis le lot 50 (`roll` pose `assignAbilityRoll` sur un
 *  INDEX de dé, `manual` pose `set` sur une VALEUR), jamais dans ce corps
 *  partagé. Dupliquer le SQUELETTE de la ligne (label/note/picker/final/
 *  alerte) pour les deux méthodes serait, lui, exactement la divergence que
 *  ce fichier existe pour éviter (loi du chantier, citée par `carnet.mjs`). */
function renderAbilityRow(key, { document, resolved, pickerProps, note }) {
  const row = el("div", "ability-row");
  row.dataset.row = key;
  row.append(el("span", "ability-row-label", [text(abilityLabel(key))]));
  if (note) row.append(note);
  row.append(renderPicker(pickerProps));
  /* ⛔ PAS de `onClear` (ni ici, ni dans les `pickerProps` des deux
     méthodes) — mesuré en servant le builder (INVENTAIRE-LOT-45.md) :
     `rebuild()` JETTE si l'une des six manque, et `applyDecisionAction`
     (shell.mjs) appelle `rebuild()` sans filet après chaque `clear`. Une
     rangée non distribuée garde donc TOUJOURS une valeur affichée (celle du
     document) — jamais un tiret qui ferait planter l'écran au clic. */
  const current = currentAbilityValue(document, key);
  const final = renderFinalColumn(resolved, key, current);
  if (final) row.append(final);
  const warning = renderCapWarning(resolved, key);
  if (warning) row.append(warning);
  return row;
}

/** UNE LIGNE DE TIRAGE — `rollBatch.assign[key]` (un INDEX de dé, ou
 *  `null`) est la SEULE source qui dit « cette ligne a reçu un dé » —
 *  jamais une comparaison avec `currentAbilityValue` (c'était le défaut du
 *  lot 50 : voir l'en-tête, et la forme reprise de
 *  `~/tools/fh-skills/fh-skill-builder.html:731`).
 *
 *  - DISTRIBUÉE (`assign[key]` est un index) : le picker montre CE dé
 *    actif ; `optionsForRow` l'inclut toujours dans ses propres options
 *    (cliquer dessus ne fait rien — `renderPicker` n'appelle `onSelect` que
 *    sur une option INACTIVE, donc pas de second geste à apprendre pour
 *    changer d'avis : cliquer un AUTRE dé RÉASSIGNE, voir le test dédié).
 *  - NON DISTRIBUÉE : la note dit la valeur COURANTE du document (souvent
 *    une valeur du personnage d'exemple, jamais un dé de CE lot) et
 *    précise qu'elle ne vient pas du tirage (commande §2c : « rien ne se
 *    cache »).
 *
 *  ⭐ LOT 51 — LE CŒUR DE CE LOT : `optionsForRow` rend maintenant TOUJOURS
 *  les SIX dés (voir sa propre doc), y compris ceux DÉJÀ tenus par une
 *  AUTRE rangée — c'est PRÉCISÉMENT le défaut de ce lot (§0 de sa commande :
 *  une fois les six posées, il ne restait plus AUCUNE option cliquable
 *  nulle part). `labelOf`, ci-dessous, dit QUI tient chaque dé qui n'est
 *  pas le sien (§1c, « rien ne se cache, jamais en compressant un
 *  libellé ») ; `onSelect` pose toujours la MÊME action qu'avant
 *  (`assignAbilityRoll`, la forme du lot 50, inchangée) — c'est
 *  `shell.mjs` qui, en la recevant, ÉCHANGE les deux rangées si le dé
 *  cliqué appartenait à une autre (§1b, décision d'architecte : voir son
 *  en-tête `applyDecisionAction`). Ce fichier ne fait QUE dire ce qui va se
 *  passer et NOMMER le geste — jamais le document, jamais le swap
 *  lui-même : cette ligne reste un pur rendu, comme le reste du fichier. */
function renderAssignRow(key, ctx) {
  const { document, resolved, rollBatch, onAction } = ctx;
  const current = currentAbilityValue(document, key);
  const assign = (rollBatch && rollBatch.assign) || {};
  const assignedIndex = assign[key];
  const fromRoll = assignedIndex !== null && assignedIndex !== undefined;
  const dieByIndex = new Map(
    (rollBatch && Array.isArray(rollBatch.rolls) ? rollBatch.rolls : []).map((roll) => [roll.index, roll])
  );
  /* QUI TIENT CE DÉ, hors de CETTE rangée — lot 51, §1c. `null` veut dire
     soit personne (dé libre), soit CETTE rangée elle-même (jamais annoncée
     comme « prise » à soi-même — c'est `selected`/`data-active` qui porte
     déjà cette information, sur le bouton lui-même). */
  function holderOf(index) {
    for (const [otherKey, otherIndex] of Object.entries(assign)) {
      if (otherKey !== key && otherIndex === index) return otherKey;
    }
    return null;
  }
  const note = el("span", "ability-row-source", [text(
    fromRoll
      ? "from this roll"
      : current !== undefined ? `${current} — not from this roll` : "not assigned yet"
  )]);
  const row = renderAbilityRow(key, {
    document, resolved, note,
    pickerProps: {
      options: optionsForRow(rollBatch),
      selected: fromRoll ? [assignedIndex] : [],
      /* §1c — un dé tenu ailleurs se LIT différemment (« 16 (DEX) »), pas
         seulement en couleur ou en position : la compression est interdite
         (§2 du chantier, garde 4 de shell.css contre `display:none`), donc
         le mot qui dit « c'est pris, et par qui » doit être DANS le texte
         du bouton, pas caché derrière un survol ou un attribut invisible. */
      labelOf: (index) => {
        const die = dieByIndex.get(index);
        if (!die) return String(index);
        const holder = holderOf(index);
        return holder ? `${die.total} (${abilityLabel(holder)})` : String(die.total);
      },
      onSelect: (index) => {
        const die = dieByIndex.get(index);
        if (!die) return; // garde : une option ne peut désigner qu'un dé réellement gardé
        /* Deux verbes, un seul clic (voir shell.mjs, §2a) : `assignAbilityRoll`
           n'est PAS `set` — il porte l'INDEX (pour la carte hors document)
           ET la VALEUR (pour le document, qui ne connaît que des scores).
           Même action qu'au lot 50, POSE ou ÉCHANGE selon l'état de `assign`
           — `shell.mjs` seul décide lequel (lot 51, §1b). */
        onAction({ kind: "assignAbilityRoll", key, rollIndex: index, value: die.total });
      }
    }
  });
  row.dataset.assigned = String(fromRoll);
  return row;
}

function renderManualRow(key, ctx) {
  const { document, resolved, onAction } = ctx;
  const current = currentAbilityValue(document, key);
  return renderAbilityRow(key, {
    document, resolved,
    pickerProps: {
      options: MANUAL_ENTRY_RANGE,
      selected: current !== undefined ? [current] : [],
      labelOf: (v) => String(v),
      onSelect: (value) => onAction({ kind: "set", path: `abilities.${key}`, value })
    }
  });
}

/** LE TIRAGE — dix jets rendus, six distingués (commande §4, test 1), et la
 *  bannière de relance quand `rerollCount > 0` (§3a.1 : le joueur doit
 *  comprendre pourquoi le lot a changé sous ses yeux). */
function renderRollBatch(rollBatch, onAction) {
  const wrap = el("div", "ability-roll-batch");
  const bar = el("div", "ability-roll-bar", [
    (() => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ability-roll-btn";
      btn.textContent = rollBatch ? "Reroll" : "Roll";
      btn.addEventListener("click", () => onAction({ kind: "roll" }));
      return btn;
    })()
  ]);
  wrap.append(bar);
  if (!rollBatch) {
    wrap.append(el("p", "ability-roll-empty", [text("No dice rolled yet.")]));
    return wrap;
  }
  if (rollBatch.rerollCount > 0) {
    wrap.append(el("p", "ability-roll-note", [text(
      `Rerolled the whole set ${rollBatch.rerollCount} time${rollBatch.rerollCount > 1 ? "s" : ""} — ` +
      "none of the ten reached 15 before this one."
    )]));
  }
  /* `data-assigned` — lot 50, pur affichage : quel dé une caractéristique
     tient déjà (§4, « regarde-le »). Ne participe à AUCUNE règle : la seule
     source de vérité pour « ce dé est pris » reste `rollBatch.assign`, lu
     ici en lecture seule pour annoter le jeton, jamais recalculé. */
  const usedIndexes = new Set(Object.values(rollBatch.assign || {}).filter((i) => i !== null && i !== undefined));
  const dice = el("div", "ability-dice");
  for (const roll of rollBatch.rolls) {
    const chip = el("div", "ability-die", [
      el("span", "ability-die-detail", [text(roll.dice.join("+"))]),
      el("span", "ability-die-total", [text(String(roll.total))])
    ]);
    chip.dataset.kept = String(roll.kept);
    chip.dataset.assigned = String(usedIndexes.has(roll.index));
    dice.append(chip);
  }
  wrap.append(dice);
  return wrap;
}

/** LE `render` DE LA MÉTHODE `roll`, dans `ABILITY_METHODS` — le lot de dix
 *  dés puis les six lignes d'assignation. Rend un TABLEAU de nœuds (pas un
 *  seul) : la boucle de `renderAbilitiesStep` ne fait que les ajouter,
 *  elle ne sait pas combien il y en a ni ce qu'ils contiennent. */
function renderRollMethod({ document, resolved, rollBatch, onAction }) {
  const rows = el("div", "ability-rows");
  for (const key of ABILITY_KEYS) {
    rows.append(renderAssignRow(key, { document, resolved, rollBatch, onAction }));
  }
  return [renderRollBatch(rollBatch, onAction), rows];
}

/** LE `render` DE LA MÉTHODE `manual` — six lignes de saisie, même forme de
 *  retour (un tableau) que `renderRollMethod`, MÊME QUAND IL N'Y A QU'UN
 *  SEUL NŒUD : c'est ce qui rend les deux entrées interchangeables aux yeux
 *  de la boucle. */
function renderManualMethod({ document, resolved, onAction }) {
  const rows = el("div", "ability-rows");
  for (const key of ABILITY_KEYS) {
    rows.append(renderManualRow(key, { document, resolved, onAction }));
  }
  return [rows];
}

/**
 * @param {object} ctx
 * @param {object} ctx.document   le document brut du dernier `rebuild()` — seule source des valeurs déjà posées
 * @param {object} ctx.resolved   la fiche dérivée du dernier `rebuild()` — score final, mod, plafond
 * @param {object} [ctx.rollBatch] le dernier lot tiré ({rolls, rerollCount, assign}), ou `null` — vit hors
 *   document (shell.mjs, `state.abilityRoll`) ; `assign` (lot 50) est la carte `clef → index de dé`, HORS
 *   document elle aussi (§2a de la commande) — voir l'en-tête du fichier.
 * @param {(action: {kind:"set"|"clear"|"roll"|"assignAbilityRoll", path?:string, value?:*, key?:string, rollIndex?:number}) => void} onAction
 *   `assignAbilityRoll` (lot 50) est LE geste du tirage : `key` la caractéristique, `rollIndex` l'index du dé
 *   dans `rollBatch.rolls` (pour la carte hors document), `value` son total (pour `set({path:"abilities.<key>"})`,
 *   la seule chose qui atteint le document — voir `shell.mjs`, `applyDecisionAction`).
 */
export function renderAbilitiesStep(ctx, onAction) {
  const document = ctx.document || null;
  const resolved = ctx.resolved || null;
  const rollBatch = ctx.rollBatch || null;
  const act = onAction || ctx.onAction || (() => {});
  const section = el("section", "abilities-step");

  const mode = currentAbilityMode(document);
  section.append(renderModeSwitch(mode.id, mode.known ? undefined : mode.raw, act));

  /* ⭐ AUCUN BRANCHEMENT SUR L'ID ICI (revue d'architecte, voir l'en-tête et
     INVENTAIRE-LOT-45.md) — `method.id === mode.id` compare un ÉTAT
     (active/inactive, légitime), `method.render(...)` délègue TOUT le
     comportement à l'entrée elle-même. Ajouter une méthode n'ajoute jamais
     de branche ici : la boucle est déjà prête pour la troisième. */
  for (const method of ABILITY_METHODS) {
    const active = method.id === mode.id;
    const block = el("div", "ability-method-block");
    block.dataset.status = active ? "active" : "inactive";
    block.dataset.method = method.id;
    if (!active) {
      block.append(el("p", "ability-mode-summary", [text(method.summary)]));
      section.append(block);
      continue;
    }
    block.append(...method.render({ document, resolved, rollBatch, onAction: act }));
    section.append(block);
  }

  return section;
}
