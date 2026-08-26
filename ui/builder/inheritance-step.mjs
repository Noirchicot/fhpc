/* ══ L'ÉTAPE INHERITANCE — lot 46 ═════════════════════════════════════
   Même loi que Class/Species/Compétences : le moteur prononce, l'écran
   affiche. ZÉRO règle de jeu ici — le lot 43 a déjà tout construit côté
   moteur (`background.boost`, `background.boost.<clef>`,
   `background.originFeat[0]`) ; ce fichier ne fait que DESCENDRE
   `decisions[]` et `resolved`, jamais recalculer un total ni juger un
   plafond.

   ── LE PLAN `background` À UNE SEULE OPTION (commande §0, tranché par Eric
   le 2026-08-13) ────────────────────────────────────────────────────────
   En Fate's Hand il n'y a plus de choix d'arrière-plan : la couche FH ne
   porte qu'UN SEUL record du genre (`fh:background:en:inheritance`), et
   `projectDecisions` (lot 43) publie déjà les DEUX plans sous lui
   (`background.boost`, `background.originFeat[0]`) SANS qu'un `choose` ait
   jamais été posé sur `background` lui-même — c'est le repli à une option,
   le cœur du lot 43. Un sélecteur à une entrée est une fausse question :
   ⛔ CET ÉCRAN N'EN CONSTRUIT AUCUN. Il pose le nom du record comme un
   TITRE (« ne le cache pas non plus » — commande §0) et s'arrête là ; il
   n'émet AUCUN `choose({path:"background", …})` — voir INVENTAIRE-LOT-46.md
   pour la mesure qui explique pourquoi (un écart entre `decisions.mjs`, qui
   a son propre repli, et `derive.mjs`, qui n'en a pas pour
   `identity.background` : une question moteur, hors du mandat de ce lot).

   Le cas SRD PUR (4 arrière-plans encore vivants sous une pile sans couche
   FH, condition de sortie n°6 du lot 43) N'EST PAS un cadre à une option :
   c'est une VRAIE liste, et ce fichier réutilise `renderRecordChoice`
   (`carnet.mjs`, partagé par Class/Species) plutôt que d'inventer un second
   geste de choix de record. */

import {
  planAt, planSlots, renderRecordChoice, renderPicker, decisionRefusalWord, markPressed
} from "./carnet.mjs?v=328";
import { renderFinalColumn, currentAbilityValue } from "./abilities-step.mjs?v=328";
import { renderChoixGlisses } from "./glisser.mjs?v=328";
import { renderFicheBody } from "./catalogue.mjs?v=328";
import { spellLabel, spellInfo } from "./class-step.mjs?v=328";

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

function featLabel(query, id) {
  const view = query({ kind: "feat", id });
  return view && view.record ? view.record.name : id;
}

/* ══ LE CADRE — le nom du record d'Inheritance, en mention, jamais un
   bouton (voir l'en-tête). */
function renderFrame(query, plan) {
  const view = query({ kind: "background", id: plan.options[0] });
  const name = view && view.record ? view.record.name : plan.options[0];
  return el("p", "inheritance-frame", [text(name)]);
}

/* ══ LES BONUS DE CARACTÉRISTIQUES ═══════════════════════════════════════
   `background.boost` : options = les six clefs (ou les trois d'un
   arrière-plan SRD qui les nomme encore, condition de sortie n°6), publiées
   par le plan — jamais `ABILITY_KEYS` importé ici. `background.boost.<clef>`
   n'existe QUE pour une clef déjà cliquée (même mécanique structurelle que
   `species.skillBudget.<slug>`, voir `species-step.mjs` en tête : un slug
   jamais cliqué ne porte aucune entrée dans `decisions[]`).

   ⚠️ `BOOST_POINT_OPTIONS` — `[1, 2]` — N'EST PAS DU CONTENU (aucun record
   ne le porte, ni `background.boost` ni `background.boost.<clef>` ne
   publient de tiers numériques : leurs deux SEULS champs sont `options`
   = les clefs elles-mêmes, mesuré en lisant `decisions.mjs`,
   `backgroundBoostPlan`). C'est un fait STRUCTUREL du mécanisme (+1 ou +2
   par carac, `BOOST_CAP = 2`) exactement au sens où `species-step.mjs`
   justifie `BUDGET_TIERS` — même loi, mêmes mots. */
const BOOST_POINT_OPTIONS = [1, 2];

/** Le nombre de points déjà posés sur `background.boost.<clef>`, lu dans
 *  `document.build.choices` — AUCUN plan ne le publie (le sous-plan
 *  `background.boost.<clef>` ne porte que la clef elle-même dans son
 *  `selected`, jamais la valeur numérique posée, mesuré). Même geste que
 *  `currentAbilityValue`/`currentArcanaId` (lots 45) pour une valeur brute
 *  que rien d'autre ne republie. */
function currentBoostValue(document, key) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const entry = choices.find((c) => c.path === `background.boost.${key}`);
  return entry ? entry.value : undefined;
}

function renderBoostRow(key, { decisions, document, resolved, onAction }) {
  const path = `background.boost.${key}`;
  const step = planAt(decisions, path);
  const current = currentBoostValue(document, key);
  const row = el("div", "skills-row");
  row.dataset.row = key;
  row.append(el("span", "record-row-label", [text(key.toUpperCase())]));
  row.append(renderPicker({
    options: BOOST_POINT_OPTIONS,
    selected: current !== undefined ? [current] : [],
    labelOf: (value) => `+${value}`,
    onSelect: (value) => onAction({ kind: "set", path, value }),
    onClear: () => onAction({ kind: "clear", path }),
    lock: step ? step.lock : null
  }));
  /* ⭐ « leur effet doit se voir de la même façon » (commande §2a.3) : LA
     MÊME fonction que celle qu'`abilities-step.mjs` a gagnée au lot 45,
     importée telle quelle — jamais une seconde copie qui pourrait diverger.
     `rawValue` reste le score BRUT (avant tout boost d'Inheritance), lu par
     la même `currentAbilityValue` que la ligne Abilities utilise déjà. */
  const final = renderFinalColumn(resolved, key, currentAbilityValue(document, key));
  if (final) row.append(final);
  return row;
}

function renderBoostBlock(ctx, plan) {
  const { decisions, document, resolved, onAction } = ctx;
  const wrap = el("section", "skills-budget-block");
  wrap.dataset.status = plan.status;
  wrap.append(el("h3", null, [text("Ability boosts")]));
  wrap.append(el("p", "skills-budget-note", [text(`${plan.answered} of ${plan.expected} points spent`)]));
  /* Les deux refus neufs du lot 43 (`background.boost-cap-exceeded`,
     `background.boost-total-mismatch`) tombent ICI, sur le plan de groupe —
     ⛔ ni recalculés ni prévenus, seulement lus au `lock` et recomposés en
     mots par `decisionRefusalWord` (carnet.mjs), même geste que les QCM de
     Class/Species. */
  if (plan.lock) wrap.append(el("p", "skills-refusal", [text(decisionRefusalWord(plan.lock))]));
  const rows = el("div", "skills-rows");
  for (const key of plan.options) rows.append(renderBoostRow(key, { decisions, document, resolved, onAction }));
  wrap.append(rows);
  return wrap;
}

/* ══ LE DON D'ORIGINE ═════════════════════════════════════════════════════
   `background.originFeat[0]` pose un RECORD (`choose`, un `ref` — jamais un
   `set`, mesuré en lisant `backgroundFeatPlan` : il lit `choice.ref`, pas
   `choice.value`). `renderRecordChoice`/`renderPicker` ne conviennent donc
   pas TELS QUELS (ils suffiraient pour le nom, mais la commande §2a.1 exige
   aussi la DESCRIPTION de chacune des cinq options, que `renderPicker` — une
   rangée de petits boutons nommés — n'a pas la place de porter). C'est une
   forme différente, propre à cet écran, pas une recopie de carnet.mjs. */
function renderOriginFeat(ctx, plan) {
  const { query, onAction } = ctx;
  const wrap = el("section", "inheritance-feat-block");
  wrap.append(el("h3", null, [text("Origin feat")]));
  wrap.append(el("p", "skills-budget-note", [text(`${plan.answered} of ${plan.expected} chosen`)]));
  if (plan.lock) wrap.append(el("p", "skills-refusal", [text(decisionRefusalWord(plan.lock))]));

  const list = el("div", "inheritance-feat-list");
  for (const id of plan.options) {
    const view = query({ kind: "feat", id });
    const description = view && view.record && view.record.data && typeof view.record.data.description === "string"
      ? view.record.data.description
      : "";
    const active = plan.selected.includes(id);

    const card = document.createElement("button");
    card.type = "button";
    card.className = "inheritance-feat-card";
    markPressed(card, active);
    /* LOT 53, TROISIÈME INSTANCE — payée par l'architecte à la revue, parce
       qu'elle était hors du périmètre du lot (elle ne vient pas de
       `renderPicker`, c'est une carte fabriquée à la main ici). Même défaut,
       même patron : l'identifiant va dans `data-value`, sa vraie place, et
       la carte n'a plus d'`aria-label` — son contenu textuelle porte déjà le
       NOM du don (`inheritance-feat-name`), qui est ce qu'un lecteur d'écran
       doit annoncer. Avant : la carte s'annonçait `fh:feat:en:auspicious`. */
    card.dataset.value = id;
    card.append(el("span", "inheritance-feat-name", [text(featLabel(query, id))]));
    /* La prose SRD est parfois multi-paragraphes (`\n\n`) — un simple
       découpage en `<p>`, ZÉRO mise en forme de plus (pas de résumé, pas de
       troncature : « chacune avec … sa description », commande §2a.1, mot
       pour mot). */
    for (const paragraph of description.split("\n\n").filter((p) => p.length > 0)) {
      card.append(el("p", "inheritance-feat-desc", [text(paragraph)]));
    }
    /* Un choix REMPLACE (même loi que `renderRecordChoice` : « choisir une
       autre classe REMPLACE, on ne "déchoisit" pas une classe » —
       class-step.mjs, tête de fichier) — aucun tiret ici non plus. */
    card.addEventListener("click", () => {
      if (!active) onAction({ kind: "choose", path: plan.path, ref: { kind: "feat", id } });
    });
    list.append(card);
  }
  wrap.append(list);
  return wrap;
}

/**
 * @param {object} ctx
 * @param {Array}  ctx.decisions  le carnet du dernier `rebuild()`
 * @param {object} [ctx.document] le document brut du dernier `rebuild()` — seule source des points de boost déjà posés
 * @param {object} [ctx.resolved] la fiche dérivée — le score final des caracs, à l'octet
 * @param {Function} ctx.query    `layers.verbs.query`
 * @param {(action: {kind:"choose"|"set"|"clear", path:string, ref?:object, value?:*}) => void} onAction
 */
/* ══════════════════════════════════════════════════════════════════════
   L'ÉCRAN DE B4 — lot 64
   ══════════════════════════════════════════════════════════════════════
   B4.1 : **deux dalles au premier abord, CENTRÉES** — `Ability boost` et
   `Origin feat` — chacune avec un **petit cercle de validation** qui est un
   INDICATEUR D'ÉTAT, pas un bouton. ✅ **L'ORDRE EST LIBRE** (Eric) : le
   parcours de B4.4 en est UN parmi deux, pas une contrainte.

   B4.2 : ouvrir `Ability boost` fait **DISPARAÎTRE** `Origin feat`.

   ⭐ B4.5 — « on peut pousser Validate pour avancer, OU JUSTE FAIRE DÉFILER
   LA MOLETTE ». C'est la première fois qu'Eric le dit explicitement, et ça
   vaut PARTOUT : `Validate` est un raccourci, jamais un passage obligé. Rien
   n'est donc à coder ici pour ça — la molette des étapes marche déjà. */

export const INHERITANCE_PANELS = [
  { id: "boost", label: "Ability boost", plan: "background.boost" },
  { id: "feat", label: "Origin feat", plan: "background.originFeat[0]" }
];

/** Un panneau est COCHÉ quand son plan est répondu — le carnet le dit, on ne
 *  le recompte pas. */
export function inheritancePanelDone(decisions, panelId) {
  const panel = INHERITANCE_PANELS.find((p) => p.id === panelId);
  const plan = planAt(decisions, panel.plan);
  return Boolean(plan) && plan.answered >= plan.expected;
}

/** B4.1 — LES DEUX DALLES, avec leur cercle. Le cercle N'EST PAS un bouton :
 *  c'est la dalle entière qu'on pousse (une cible de 44 px de haut, pas un
 *  point de 12). */
function renderPanels(ctx, act) {
  const wrap = el("div", "inheritance-panels");
  for (const panel of INHERITANCE_PANELS) {
    const fait = inheritancePanelDone(ctx.decisions, panel.id);
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "inheritance-panel dalle-simple";
    tile.dataset.panel = panel.id;
    tile.dataset.done = String(fait);
    /* ⛔ Le cercle est décoratif à l'oreille : son sens est déjà porté par
       `aria-pressed` (l'ouverture) et par le mot d'état ci-dessous. */
    const rond = el("span", "inheritance-check");
    rond.setAttribute("aria-hidden", "true");
    tile.append(rond, el("span", "inheritance-panel-label", [text(panel.label)]));
    tile.append(el("span", "inheritance-panel-state", [text(fait ? "done" : "to do")]));
    markPressed(tile, false);
    tile.addEventListener("click", () => act({ kind: "inheritanceOpen", value: panel.id }));
    wrap.append(tile);
  }
  return wrap;
}

/* ══ B4.2 — LES SIX COLONNES, CÔTE À CÔTE ═══════════════════════════════
   « Six petites dalles CÔTE À CÔTE, une par caractéristique, chacune avec
   une MOLETTE VERTICALE » portant exactement trois choix : `0` / `+1` / `+2`.

   🔴 L'ORDRE EST CELUI DU SRD (tranché par Eric — sa dictée disait
   `FOR·DEX·CON·SAG·INT·CHA`, il a corrigé) : STR · DEX · CON · INT · WIS ·
   CHA. ⛔ Le plan, lui, publie ses options en ordre ALPHABÉTIQUE
   (`cha, con, dex, int, str, wis` — mesuré) : on le réordonne pour
   l'affichage, sans jamais rien y ajouter ni retirer.

   📏 B4.3, mesuré par l'architecte : six colonnes tiennent à 360 px, mais
   « tout juste et sans marge » — et le coupable nommé était le padding de
   32 px, « qui mange 18 % de la largeur ». Il est tombé à 16 px au lot 59,
   et cet écran est en plein cadre : la place existe. */
export const SRD_ABILITY_ORDER = ["str", "dex", "con", "int", "wis", "cha"];

function renderBoostColumns(ctx, plan, act) {
  /* ⛔ NE PAS DÉSTRUCTURER `document` DE `ctx` ICI : le document du
     PERSONNAGE masquerait le `document` GLOBAL, et `createElement`
     disparaîtrait. Mesuré en écrivant ce lot — le fichier s'en sortait
     jusqu'ici parce que seul `el()` créait des nœuds, et `el()` ferme sur le
     global. Dès qu'on crée un bouton à la main, le piège mord. */
  const { decisions, resolved } = ctx;
  const perso = ctx.document;
  const wrap = el("div", "inheritance-boosts");
  const ordre = SRD_ABILITY_ORDER.filter((k) => plan.options.includes(k));
  for (const key of ordre) {
    const path = `background.boost.${key}`;
    const step = planAt(decisions, path);
    const current = currentBoostValue(perso, key);
    const col = el("section", "inheritance-boost dalle-intermediaire");
    col.dataset.row = key;
    col.append(el("span", "inheritance-boost-key", [text(key.toUpperCase())]));
    const molette = el("div", "inheritance-wheel");
    /* Trois choix, et TROIS SEULEMENT (B4.2). `0` n'est pas une valeur du
       moteur : c'est l'ABSENCE de boost, donc un `clear` — même geste que le
       rond éteint de Compétences (B7.4). */
    for (const valeur of [0, 1, 2]) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "inheritance-notch";
      btn.dataset.value = String(valeur);
      markPressed(btn, valeur === 0 ? current === undefined : current === valeur);
      btn.textContent = valeur === 0 ? "0" : `+${valeur}`;
      btn.setAttribute("aria-label", `${key.toUpperCase()} ${valeur === 0 ? "no boost" : `+${valeur}`}`);
      btn.addEventListener("click", () => act(valeur === 0
        ? { kind: "clear", path }
        : { kind: "set", path, value: valeur }));
      molette.append(btn);
    }
    col.append(molette);
    if (step && step.lock) col.append(el("p", "skills-refusal", [text(decisionRefusalWord(step.lock))]));
    const final = renderFinalColumn(resolved, key, currentAbilityValue(perso, key));
    if (final) col.append(final);
    wrap.append(col);
  }
  return wrap;
}

/**
 * @param {object} ctx
 * @param {Array}  ctx.decisions  le carnet du dernier `rebuild()`
 * @param {object} ctx.document   le document brut
 * @param {object} ctx.resolved   la fiche dérivée
 * @param {Function} ctx.query    `layers.verbs.query`
 * @param {string} [ctx.open]     le panneau ouvert : "boost" | "feat" | null
 */
export function renderInheritanceStep(ctx, onAction) {
  const decisions = ctx.decisions || [];
  const act = onAction || ctx.onAction || (() => {});
  const section = el("section", "inheritance-step");

  /* ⚠️ DEUX FORMES, SELON CE QUE LE PLAN PUBLIE (lot 46, conservé tel quel) :
     un seul arrière-plan (pile FH) → une simple MENTION ; plusieurs (SRD pur,
     quatre) → une VRAIE liste, même geste que Class/Species. Les avoir
     confondues aurait fait disparaître un choix réel sur un personnage SRD. */
  const backgroundPlan = planAt(decisions, "background");
  if (backgroundPlan && backgroundPlan.options.length > 1) {
    const choix = renderRecordChoice({
      decisions, path: "background", kind: "background", title: "Background", query: ctx.query, onAction: act
    });
    if (choix) section.append(choix.node);
  } else if (backgroundPlan) {
    section.append(renderFrame(ctx.query, backgroundPlan));
  }

  /* ⛔ B4.2 — QUAND UN PANNEAU EST OUVERT, L'AUTRE DISPARAÎT. Pas grisé,
     pas replié : absent. C'est ce qui rend la scène lisible sur 360 px. */
  if (ctx.open === "boost") {
    const plan = planAt(decisions, "background.boost");
    if (!plan) return section;
    section.append(el("section", "inheritance-explain dalle-intermediaire", [
      el("h3", null, [text("Ability boost")]),
      el("p", null, [text(`Spread ${plan.expected} point${plan.expected > 1 ? "s" : ""} across your abilities.`)])
    ]));
    if (plan.lock) section.append(el("p", "skills-refusal", [text(decisionRefusalWord(plan.lock))]));
    section.append(renderBoostColumns(ctx, plan, act));
    return section;
  }
  if (ctx.open === "feat") return section; // le catalogue le rend (B4.4, « comme Class et Species »)

  section.append(renderPanels(ctx, act));
  return section;
}

/* ══ LES BONUS DE CARACTÉRISTIQUE, AU GLISSER — Eric, 2026-08-20 ═════════
   *« Les bonus carac en mode drag and drop. »*

   ⭐ C'EST LA BOURSE DE COMPÉTENCES DE SPECIES, MOT POUR MOT — même organe,
   même contrat, aucune forme neuve. Un budget se dépense en VALEURS (`+1` peut
   aller sur deux caractéristiques), d'où `reutilisable: true` : sans lui, poser
   le premier éteint le jeton et l'écran se bloque — le défaut qu'Eric avait
   trouvé sur l'Elfe.

   📌 CE QUE LE MOTEUR PUBLIE, et qu'on ne réinvente pas ici : le groupe
   `background.boost` porte les clefs autorisées et le total attendu (3) ; le
   plafond par carac (2) et les deux refus (`boost-cap-exceeded`,
   `boost-total-mismatch`) sont PRONONCÉS PAR LE CARNET. L'écran ne juge rien —
   il rend `slot.lock`, comme partout.
   ⛔ Les valeurs des jetons viennent donc du plan, pas d'une liste écrite ici :
   `1` et `2` sont ce que le moteur accepte, et un `0` n'existe pas (l'absence
   de bonus est un `clear`, pas une valeur). */
const BOOST_VALEURS = [1, 2];

export function renderBoostGlisse(ctx, act) {
  const decisions = ctx.decisions || [];
  const plan = planAt(decisions, "background.boost");
  if (!plan) return null;
  const perso = ctx.document;
  const ordre = SRD_ABILITY_ORDER.filter((k) => plan.options.includes(k));
  const slots = ordre.map((key, index) => {
    const etape = planAt(decisions, `background.boost.${key}`);
    return {
      path: `background.boost.${key}`, index,
      options: BOOST_VALEURS,
      /* ⚠️ LA VALEUR POSÉE SE LIT DANS LE DOCUMENT, pas dans le plan : le
         sous-plan d'un bonus ne publie pas de `selected` (il n'y a rien à
         choisir dans une liste, il y a un nombre à poser). `currentBoostValue`
         est la lecture que cet écran faisait déjà avec ses molettes. */
      selected: currentBoostValue(perso, key),
      lock: etape ? etape.lock : null,
      /* Le récepteur porte le NOM de sa caractéristique — c'est ce qu'on vise. */
      mot: key.toUpperCase()
    };
  });
  return renderChoixGlisses({
    plan, slots, titre: "Ability boosts", mot: "Ability",
    labelOf: (id) => `+${id}`,
    consigne: `${plan.answered} of ${plan.expected} points spent — drag +1 or +2 onto an ability.`,
    reutilisable: true,
    onAction: act
  });
}

/** LE CORPS D'UNE FICHE DE DON, pour le catalogue partagé (B4.4 : « comme
 *  Class et Species »). Le don porte sa DESCRIPTION, que la commande du lot
 *  46 exigeait déjà — c'est ce que la fiche plein écran offre enfin. */
export function renderFeatCardBody(query, id) {
  const view = query({ kind: "feat", id });
  const data = (view && view.record && view.record.data) || {};
  /* 🔴 LE BLURB PASSE AVANT LA DESCRIPTION — Eric, 2026-08-20 : *« il faut
     améliorer Magic Initiate »*, et sa fiche perdait 300 px.
     📏 MESURÉ À 360, LES CINQ DONS : la boîte de prose offre 343 px ; Magic
     Initiate en rendait 643. Les quatre autres tiennent — Alert, le plus
     long, remplit la boîte pile. La borne rognait donc UN don, en silence,
     ce que ce dépôt interdit.
     ⭐ ET LA RÉPONSE EST CELLE DE SPECIES ET DE CLASS, pas une invention :
     leurs douze fiches lisent déjà `data.blurb` (le court, sur la carte) et
     laissent le texte long à la couche. Un don n'avait simplement jamais reçu
     le champ. Il arrive par `fh-feats-en`, en AJOUT — le texte SRD n'est pas
     réécrit, il reste entier dans sa couche, sous sa licence.
     ⛔ ET PAS DE TRONCATURE ICI. Couper la description à N caractères aurait
     été la même perte, décidée par un écran au lieu d'une couche. */
  const desc = typeof data.blurb === "string" && data.blurb.length > 0
    ? data.blurb
    : (typeof data.description === "string" ? data.description : null);
  /* Le bonus de pool que certains dons accordent (`skill_points.bonus`) —
     lu au record, jamais recalculé. */
  const bonus = data.skill_points && data.skill_points.bonus;
  /* 🔴 LE DON PASSE PAR LA FICHE DE SPECIES, ET C'EST TOUTE LA DEMANDE —
     Eric, 2026-08-20 : *« le choix des feats doit fonctionner comme les choix
     de species, même logique. »*
     📏 CE QUI MANQUAIT, MESURÉ DANS LA PAGE : la fiche du don n'avait AUCUN
     bouton — ni `Lore` ni `Choose`. On pouvait la lire et pas la prendre. Le
     pied est fabriqué par `renderFicheBody` et par lui seul ; un corps qui
     rend ses propres paragraphes ne l'obtient jamais, et `renderCatalogueCards`
     ne trouve alors rien à câbler (il le dit lui-même dans son commentaire).
     ⭐ EMPRUNTER L'ORGANE PLUTÔT QUE RECOPIER SON PIED : c'est ce qui garantit
     que le don reste identique à l'espèce le jour où la fiche change.
     ⚠️ UN DON N'A PAS DE STATISTIQUES : il porte un nom et une description. Il
     passe donc par le `blurb` — la moitié basse, pleine largeur — et laisse
     `stats` vide. La fiche s'en accommode ; c'est ce qu'elle fait déjà pour
     une espèce sans trait. */
  const lignes = [];
  if (desc) lignes.push(desc);
  if (Number.isInteger(bonus)) lignes.push(`+${bonus} skill points`);
  return renderFicheBody({ blurb: lignes.join("\n\n"), dressing: "prose" });
}

/* ══ B0 — LA BRANCHE UNIQUE DU DON ════════════════════════════════════════
   📐 L'ARBORESCENCE D'ERIC, 2026-08-20, dans ses mots : *« R3 = troisième item
   à la racine dans la liste des feats · B0 = branche unique · BS1/BS2/BS3 =
   branches secondaires »*. Ce vocabulaire est celui de l'ARBRE DES CHOIX ; il
   ne remplace pas celui du canon (F/FF pour l'écran, carte/dalle/tuile pour
   l'objet), il en dit autre chose — une branche n'est pas un cadre.

   ⛔ **AUCUN BLURB ICI** — Eric, mot pour mot : *« mets pas de blurb sur B0,
   juste les choix, le bilan et les boutons »*. La prose du don a déjà été lue
   sur sa fiche ; la redire ferait lire deux fois pour avancer d'un cran, ce que
   le canon reproche déjà au bilan d'étape.

   ⭐ LES TROIS `Choose` SONT DES CHOIX, PAS DES BOUTONS DE PIED, et c'est ce
   qui rend l'écran tenable. Eric l'a vu venir lui-même : *« pire, 5 boutons
   comme y'a 3 listes »*. `CADRES.md` §0bis mesure le pied à 76 px **tant que
   la paire tient sur une ligne**, et nomme le TROISIÈME bouton comme le vrai
   risque — cinq ne tiennent pas à 360. Sa propre phrase distingue d'ailleurs
   « les choix » et « les boutons » : les premiers vivent dans le corps, les
   seconds restent la paire que la coquille pose.
   ⚠️ RESTE UN ÉCART DE MOT À TRANCHER : la coquille pose `CANCEL`/`DONE` sur
   un écran d'item, quand Eric écrit `Done` / `I changed my mind`. Je n'invente
   pas un second retour — garde 17, *« un seul BACK dans tout ui/ »* — donc
   l'écran garde la paire de la coquille, et le mot se change là où il est posé,
   pas ici. */
const FEAT_SPELL_BLOCS = Object.freeze([
  { basePath: "background.originFeat[0].cantrips", titre: "Cantrips", mot: "Cantrip",
    consigne: "Drag a cantrip onto a slot to choose it · tap or right-click for info" },
  { basePath: "background.originFeat[0].prepared", titre: "Level 1 spell", mot: "Spell",
    consigne: "Drag a spell onto a slot to choose it · tap or right-click for info" }
]);

export function featListPlan(decisions) {
  return (decisions || []).find((d) => d && d.path === "background.originFeat[0].list") || null;
}

/** Le nom d'une liste — le `name` du RECORD de classe, recopié. ⛔ Jamais une
 *  table « cleric → Divine » : ce serait un second vocabulaire à tenir. */
function listeLabel(query, id) {
  const view = query({ kind: "class", id });
  return (view && view.record && view.record.name) || id;
}

/** L'ÉCRAN B0. Trois choses et pas une de plus : les choix, le bilan, l'hôte
 *  du pied. */
export function renderFeatListScreen(ctx, onAction) {
  const act = typeof onAction === "function" ? onAction : () => {};
  const plan = featListPlan(ctx.decisions);
  const query = ctx.query;
  const section = el("section", "feat-branche");
  section.dataset.objet = "dalle";

  section.append(el("h2", "guide-titre", [text(featLabel(query, ctx.featId))]));

  /* ── LES CHOIX ────────────────────────────────────────────────────────
     Un bouton par liste, à la cible tactile pleine. `markPressed` dit lequel
     porte le choix courant — le même organe que partout, jamais une classe
     « active » inventée pour cet écran. */
  const choix = el("div", "feat-branche-choix");
  for (const id of (plan ? plan.options : [])) {
    const actif = Boolean(plan && plan.selected.includes(id));
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "feat-branche-liste";
    bouton.dataset.value = id;
    markPressed(bouton, actif);
    bouton.append(el("span", null, [text(`Choose ${listeLabel(query, id)}`)]));
    /* ⭐ CHOISIR ENTRE DANS LA BRANCHE. L'écran ne navigue pas — il annonce le
       choix, la coquille décide où ça mène (voir `brancheChoisie`). */
    bouton.addEventListener("click", () => {
      act({ kind: "brancheChoisie", path: plan.path, ref: { kind: "class", id } });
    });
    choix.append(bouton);
  }
  section.append(choix);

  /* ── LE BILAN — il se remplit, il ne s'invente pas ────────────────────
     ⭐ Eric : *« un bilan qui se remplira en fonction de ce qui est choisi »*.
     Une ligne dont la réponse n'est pas encore là reste GRISÉE et ANNONCE ce
     qui vient (canon §4 : « grisée, pas absente ») — c'est ce qui rend le vert
     lisible quand il arrive.
     ⏳ Les deux lignes de sorts sont annoncées et pas encore remplissables :
     leurs plans arrivent avec BS1/BS2/BS3. Elles sont ici parce que les
     cacher ferait croire l'étape finie au moment où la liste est choisie. */
  const bilan = el("dl", "feat-branche-bilan");
  const ligne = (mot, valeur) => {
    const dt = el("dt", null, [text(mot)]);
    const dd = el("dd", null, [text(valeur === null ? "—" : valeur)]);
    if (valeur === null) dd.dataset.attente = "oui";
    bilan.append(dt, dd);
  };
  const listeChoisie = plan && plan.selected.length > 0 ? plan.selected[0] : null;
  ligne("Spell list", listeChoisie ? listeLabel(query, listeChoisie) : null);
  /* ⭐ LE BILAN SE REMPLIT AVEC CE QUI A ÉTÉ POSÉ EN BSS — Eric, 2026-08-20 :
     *« faut remonter de BSS à BS pour avoir un bilan »*. Sans ces deux lignes,
     remonter ne montrait rien de plus qu'avant de descendre, et le voyage
     n'avait pas d'objet. Les NOMS viennent des records, jamais d'une table.
     ⚠️ Une ligne sans réponse reste GRISÉE et annonce ce qui vient (canon §4) —
     elle ne disparaît pas. */
  for (const bloc of FEAT_SPELL_BLOCS) {
    const p = planAt(ctx.decisions, bloc.basePath);
    const poses = p && Array.isArray(p.selected) ? p.selected : [];
    ligne(bloc.titre, poses.length > 0 ? poses.map((id) => spellLabel(query, id)).join(" · ") : null);
  }
  section.append(bilan);

  /* L'HÔTE DU PIED — la coquille y dépose sa paire, et elle seule. */
  const hote = el("div", "parcours-pied");
  hote.dataset.sortieIci = "";
  section.append(hote);
  return section;
}

/* ══ BS1 / BS2 / BS3 — LES SORTS DU DON, AU GLISSER ═══════════════════════
   📐 Eric, 2026-08-20 : *« BS1 Arcane : choix drag and drop du cantrip et du
   sort lvl 1, et done ou back ou lore »*, et pareil pour BS2 et BS3.

   ⭐ TROIS BRANCHES, UN SEUL ORGANE. Ce ne sont pas trois écrans à écrire :
   c'est le même, dont les OPTIONS changent avec la liste choisie en B0. Écrire
   trois rendus aurait fait diverger trois fois le jour où le geste change.

   ⭐ ET LE GESTE EST CELUI DU MAGICIEN, MOT POUR MOT — c'est la demande
   d'Eric : *« il faut le construire comme le choix que fait un mago pour ses
   sorts »*. Même `renderChoixGlisses`, même `refKind: "spell"`, mêmes libellés
   et même popup d'info (`spellLabel` / `spellInfo`, empruntés à `class-step`,
   pas recopiés).

   ⛔ RIEN SI LA LISTE N'EST PAS CHOISIE : `planAt` rend `null`, et l'écran
   n'affiche alors AUCUN cadre vide — la règle que Class applique déjà pour un
   Rogue qui ne lance rien. */


export function renderFeatSpellsScreen(ctx, onAction) {
  const act = typeof onAction === "function" ? onAction : () => {};
  const decisions = ctx.decisions || [];
  const query = ctx.query;
  const section = el("section", "feat-branche");
  section.dataset.objet = "dalle";

  /* LE TITRE NOMME LA LISTE, pas le don : on est DANS la branche, et c'est la
     liste qui dit dans quel livre on prend. Le nom vient du RECORD. */
  const liste = featListPlan(decisions);
  const listeId = liste && liste.selected.length > 0 ? liste.selected[0] : null;
  section.append(el("h2", "guide-titre", [text(listeId ? listeLabel(query, listeId) : "Spells")]));

  for (const bloc of FEAT_SPELL_BLOCS) {
    const plan = planAt(decisions, bloc.basePath);
    if (!plan) continue;
    section.append(renderChoixGlisses({
      plan, slots: planSlots(decisions, bloc.basePath),
      titre: bloc.titre, mot: bloc.mot,
      refKind: "spell", labelOf: (id) => spellLabel(query, id), onAction: act,
      onInfo: (id) => { const info = spellInfo(query, id); if (info) act(info); },
      consigne: bloc.consigne
    }));
  }

  const hote = el("div", "parcours-pied");
  hote.dataset.sortieIci = "";
  section.append(hote);
  return section;
}

/** Les trois créneaux du don sont-ils remplis ? ⛔ Lu au carnet, jamais
 *  recompté : c'est le moteur qui sait ce qu'il attend. */
export function featSpellsDone(decisions) {
  return FEAT_SPELL_BLOCS.every((bloc) => {
    const plan = planAt(decisions || [], bloc.basePath);
    return plan ? plan.answered >= plan.expected : true;
  });
}

/** LE PALIER — un seul, et il ferme le panneau ouvert (B4.4 étape 2 :
 *  « toutes les fenêtres intermédiaires disparaissent »). Panneaux fermés :
 *  `Validate` avance quand LES DEUX cercles sont cochés (B4.4 étape 6). */
export function inheritanceValidate(ctx) {
  const decisions = ctx.decisions || [];
  if (ctx.open) {
    return {
      exists: true,
      ready: inheritancePanelDone(decisions, ctx.open),
      action: null,
      next: "close"
    };
  }
  const tout = INHERITANCE_PANELS.every((p) => inheritancePanelDone(decisions, p.id));
  return { exists: true, ready: tout, action: null, next: "step" };
}
