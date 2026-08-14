/* ══ LE CATALOGUE À DÉFILEMENT AIMANTÉ — lot 60 ═══════════════════════════
   Class et Species sont LE MÊME ÉCRAN. Eric, 2026-08-14 : *« l'étape 3 va
   être identique à la 2 »*, et ERGONOMIE-BUILDER.md l'écrit noir sur blanc :
   ⛔ *« Ne recopie pas B2 ici. Une règle écrite deux fois diverge — c'est la
   loi du dépôt, et elle a déjà coûté. B3 = B2, point. »*

   ⭐ CE FICHIER EST LA RÉPONSE À CETTE PHRASE. Le lot 58 avait construit le
   catalogue DANS `class-step.mjs` ; le recopier dans `species-step.mjs`
   aurait produit les deux copies que la loi interdit. Il est donc SORTI ici,
   et les deux écrans en deviennent des configurations — même précédent que
   `carnet.mjs` au lot 42, quand `planAt`/`violationAt` sont sorties de
   `skills-step.mjs` pour que trois écrans les partagent.

   CE QUE LE CATALOGUE SAIT FAIRE, et rien d'autre :
     · les douze fiches, aimantées, une par écran (II.1, II.2, B2.1f/h) ;
     · le rail qui les suit — un INDICATEUR, pas un contrôle (II.3) ;
     · les deux paliers de `Validate` (I.4, B2.4).

   CE QU'IL NE SAIT PAS, et que chaque écran lui donne :
     · à quoi ressemble UNE fiche (`renderCard`) — Class montre un dé de PV,
       Species une taille et des sens ; rien à partager là ;
     · ce que confirme le 2ᵉ palier (`palier2`) — un QCM pour Class, une
       bourse OU un QCM OU RIEN pour Species.

   ⛔ AUCUNE RÈGLE DE JEU ICI, comme partout : ce fichier lit `decisions[]`
   par chemin et rend ce qu'il trouve. */

import { planAt } from "./carnet.mjs?v=1";

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/** Les options du plan, DANS SON ORDRE — jamais une liste écrite ici. C'est
 *  cet ordre-là que le rail, les fiches et le curseur partagent : un seul
 *  tableau, donc l'icône surlignée et la fiche validée ne PEUVENT pas
 *  diverger (II.3, « la même chose par construction »). */
export function catalogueOptions(decisions, path, fournies) {
  /* ⚠️ LOT 61 — `fournies` EST UNE PORTE ÉTROITE, ET ELLE A UNE MESURE.
     Destiny n'a AUCUN plan dans `decisions[]` pour `fh.destiny.arcana` : le
     point de décision existe et fonctionne, mais `projectDecisions` n'en
     publie pas (mesuré au lot 45, et toujours vrai). Son catalogue de 22
     cartes vient donc du CATALOGUE DE COUCHES (`query({kind:"arcana"})`),
     pas du carnet.
     ⛔ Ce n'est pas une échappatoire pour composer une liste à la main : un
     écran qui A un plan doit le lire. Class et Species ne passent jamais par
     là — un garde le vérifie. */
  if (Array.isArray(fournies)) return fournies;
  const plan = planAt(decisions, path);
  return plan && Array.isArray(plan.options) ? plan.options : [];
}

/** Le cran d'arrivée : le record DÉJÀ posé s'il l'est, sinon le premier.
 *  Arriver sur l'écran doit montrer où on en est — et comme le défilement
 *  EST le choix, s'ouvrir ailleurs ferait écraser un choix en silence. */
export function catalogueCursor(decisions, path) {
  const plan = planAt(decisions, path);
  const options = catalogueOptions(decisions, path);
  const selected = plan && Array.isArray(plan.selected) ? plan.selected[0] : null;
  const index = options.indexOf(selected);
  return index >= 0 ? index : 0;
}

export function recordName(query, kind, id) {
  const view = query({ kind, id });
  return view && view.record ? view.record.name : id;
}

/* ══ LE RAIL (B2.1a/d/g) ═════════════════════════════════════════════════
   ⛔ CE NE SONT PAS DES BOUTONS, et c'est une décision tenue depuis le lot
   58 : les rendre cliquables poserait un geste qui MÈNE à un record en un
   tap — très près de la sélection que l'invariant II.1 supprime. La lecture
   stricte de B2.1d (« un scrollspy relie les deux : la gauche SUIT ce qu'on
   regarde à droite ») dit un indicateur.
   ⏳ La question est POSÉE À ERIC, non tranchée. Le jour où il dit oui, elle
   se répare ICI, une fois, pour les deux écrans — c'est précisément ce que
   l'extraction achète. */
export function renderCatalogueRail(ctx) {
  const options = catalogueOptions(ctx.decisions, ctx.path, ctx.options);
  if (options.length === 0) return null;
  const cursor = Number.isInteger(ctx.cursor) ? ctx.cursor : 0;
  const list = el("ol", "catalogue-rail");
  list.setAttribute("aria-label", ctx.label || "Catalogue");
  options.forEach((id, index) => {
    const item = el("li", "catalogue-rail-item");
    item.dataset.value = id;
    item.setAttribute("aria-current", index === cursor ? "true" : "false");
    item.append(text(recordName(ctx.query, ctx.kind, id)));
    list.append(item);
  });
  return list;
}

/* ══ LES FICHES ══════════════════════════════════════════════════════════
   `data-snap` est le SEUL contrat entre un écran et le scrollspy du socle
   (voir SOCLE.md). Il est posé ICI et nulle part ailleurs — un garde le
   prouve (`tests/catalogue.test.mjs`), même patron que `markPressed` au
   lot 57 : une brique, un écrivain, un garde. */
export function renderCatalogueCards(ctx, renderCard) {
  const options = catalogueOptions(ctx.decisions, ctx.path, ctx.options);
  if (options.length === 0) return null;
  const cards = el("div", "catalogue-cards");
  for (const id of options) {
    const card = el("section", "catalogue-card dalle-majeure");
    card.dataset.snap = ctx.kind;
    card.dataset.value = id;
    card.append(el("h2", "catalogue-card-name", [text(recordName(ctx.query, ctx.kind, id))]));
    /* La fiche est MAJEURE (III.2) : elle porte des libellés en
       `--text-muted`, et la matrice du lot 59 les interdit sur du verre. */
    for (const node of renderCard(ctx.query, id) || []) card.append(node);
    cards.append(card);
  }
  return cards;
}

/** Les lignes « libellé → valeur » d'une fiche. Partagées parce que les deux
 *  écrans les dessinent pareil ; ce qu'elles CONTIENNENT est propre à chacun.
 *  Une ligne sans valeur ne s'affiche pas — jamais un tiret inventé pour
 *  remplir (le pool FH est absent d'un personnage SRD pur, et alors la ligne
 *  n'existe simplement pas). */
export function renderCardRows(rows) {
  const dl = el("dl", "catalogue-card-list");
  let posees = 0;
  for (const [label, value] of rows) {
    if (typeof value !== "string" || value === "") continue;
    const row = el("div", "catalogue-card-row");
    row.append(el("dt", null, [text(label)]));
    row.append(el("dd", null, [text(value)]));
    dl.append(row);
    posees += 1;
  }
  return posees > 0 ? dl : null;
}

/** Une liste de noms sous un intertitre — les features de niveau 1 d'une
 *  classe, les traits d'une espèce. Les DESCRIPTIONS restent dehors : les
 *  couper serait effacer des mots (défaut n°3), les afficher en entier
 *  referait les 6 628 px d'Inheritance. */
export function renderCardNames(titre, noms) {
  if (!Array.isArray(noms) || noms.length === 0) return null;
  const block = el("div", "catalogue-card-features");
  block.append(el("h3", null, [text(titre)]));
  const ul = el("ul", "catalogue-card-name-list");
  for (const nom of noms) ul.append(el("li", null, [text(nom)]));
  block.append(ul);
  return block;
}

/* ══ LES DEUX PALIERS DE `Validate` (I.4, B2.4) ══════════════════════════
   Ce que l'ÉCRAN sait, et rien de plus : ce que le palier courant confirme,
   et s'il est prêt. C'est `shell.mjs` qui possède l'enchaînement (SOCLE.md).

   `palier2` décrit le second palier, ou vaut `null` s'il n'y en a pas :
   ⭐ UNE ESPÈCE QUI N'ACCORDE RIEN N'A QU'UN SEUL PALIER. Loroka ne publie
   ni bourse ni QCM ; un 2ᵉ appui sur un menu vide serait un geste pour rien.
   I.4 le dit déjà : « un écran peut en compter un, deux ou trois ».
   ⚠️ Et `exists` ne peut se lire qu'APRÈS le `choose` du palier 1 — le plan
   du 2ᵉ palier décrit le record CHOISI, pas celui sous le curseur. C'est
   `shell.mjs` qui ré-interroge la porte une fois le carnet reconstruit. */
export function catalogueValidate(ctx, palier2) {
  if (ctx.palier === 2) {
    return {
      exists: Boolean(palier2),
      ready: Boolean(palier2 && palier2.ready),
      action: null,
      next: "step"
    };
  }
  const options = catalogueOptions(ctx.decisions, ctx.path);
  const cursor = Number.isInteger(ctx.cursor) ? ctx.cursor : 0;
  const id = options[cursor];
  if (!id) return { exists: true, ready: false, action: null, next: "palier" };
  return {
    exists: true,
    ready: true, // une fiche est toujours sous le doigt : un choix est toujours possible (B2.4)
    action: { kind: "choose", path: ctx.path, ref: { kind: ctx.kind, id } },
    next: "palier"
  };
}
