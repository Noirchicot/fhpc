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

import { planAt } from "./carnet.mjs?v=2";

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
  /* Le GENRE du catalogue, sur le conteneur. ⭐ Une seule ligne, purement
     additive : elle permet à `fiche.css` de ne servir sa géométrie qu'aux
     deux écrans à fiche, sans `:has()` — qui échoue en silence là où il
     n'est pas porté — et sans toucher au contrat `data-snap`, partagé par
     cinq écrans (Destiny, Inheritance, Skills…). */
  cards.dataset.kind = ctx.kind;
  for (const id of options) {
    const card = el("section", "catalogue-card dalle-majeure");
    card.dataset.snap = ctx.kind;
    card.dataset.value = id;
    card.append(el("h2", "catalogue-card-name", [text(recordName(ctx.query, ctx.kind, id))]));
    /* La fiche est MAJEURE (III.2) : elle porte des libellés en
       `--text-muted`, et la matrice du lot 59 les interdit sur du verre. */
    const noeuds = renderCard(ctx.query, id) || [];
    /* ⭐ LA FICHE A-T-ELLE UNE ZONE D'INFOS ? Eric, 2026-08-15 : quand elle
       en a une, tout est à fleur ; quand elle n'en a pas, **le blurb se
       CENTRE** entre le bloc haut et les boutons. Deux gabarits de grille,
       donc il faut le dire au CSS — et seul cet endroit voit les nœuds
       rendus.
       ⛔ PAS `:has()` : il échoue en silence là où il n'est pas porté, et la
       fiche prendrait le mauvais gabarit sans un mot (payé deux fois le
       15 août). Un attribut se lit partout. */
    card.dataset.infos = noeuds.some((n) => n && n.dataset && n.dataset.zone === "infos") ? "oui" : "non";
    for (const node of noeuds) card.append(node);
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

/* ══ LA FICHE À 360 — lot 77 ═════════════════════════════════════════════
   📐 Croquis C (Wizard) et croquis A (Species), 2026-08-15. Les deux
   dessinent LA MÊME fiche, et c'est pour ça qu'elle est écrite ICI et pas
   deux fois : nom + stats en haut à GAUCHE, image en haut à DROITE, le
   blurb sur toute la largeur en dessous, `LORE` et `CHOOSE` au pied.

   ⚠️ L'ORDRE VIENT DU DESSIN, PAS DU TABLEAU. Le récapitulatif du gabarit
   liste « 100 IMAGE │ 8 │ 118 STATS » de gauche à droite ; les DEUX croquis
   montrent l'inverse (stats à gauche, image à droite, et l'espèce annote
   même « upper left quarter » / « upper right quarter »). Le croquis fait
   foi — c'est une répartition de largeurs, pas un ordre de colonnes.

   ⛔ CE QUE CETTE FONCTION NE FAIT PAS : elle ne connaît ni Class ni
   Species. Les deux écrans lui passent LEURS lignes et LEUR texte ; c'est
   tout ce qui les distingue (« B3 = B2 », loi du dépôt). */

/** Le pied de la fiche : les deux actions du croquis, à T3 et à la cible
 *  tactile. ⏳ Elles ne sont pas encore CÂBLÉES — le panneau `lore` plein
 *  écran (et son `copier`) est un organe partagé par trois écrans, hors
 *  périmètre du lot 77, et `CHOOSE` ouvre le 2ᵉ palier que `Validate` ouvre
 *  déjà. `disabled` le DIT, au lieu de laisser croire à un geste : un
 *  bouton qui ne répond pas est pire qu'un bouton qui s'annonce éteint. */
function renderFicheActions() {
  const pied = el("div", "fiche-actions");
  for (const mot of ["Lore", "Choose"]) {
    const bouton = el("button", "fiche-action", [text(mot)]);
    bouton.type = "button";
    bouton.disabled = true;
    pied.append(bouton);
  }
  return pied;
}

/** LE CORPS D'UNE FICHE, tel que les deux écrans le dessinent.
 *  `stats` : les lignes `{label, value}` de `data.fiche_stats` — la couche
 *  `fh-fiche-en` les porte déjà compressées à la colonne de 118 px, et un
 *  garde le mesure (`tests/fiche-360.test.mjs`).
 *  `blurb` : les ~50 mots de la couche, dans une boîte FIXE de 10 lignes —
 *  `B0.23` (« choix identique ⇒ dalle de taille identique ») : douze blurbs
 *  de hauteurs libres feraient douze fiches de hauteurs différentes, et le
 *  cran du défilement aimanté dériverait. */
/*  🔴 LES QUATRE NŒUDS SONT RENDUS À PLAT, SANS ENVELOPPE, ET C'EST LA
 *  GÉOMÉTRIE QUI L'EXIGE. Le nom de la fiche est posé par
 *  `renderCatalogueCards` (il est commun aux quatre catalogues) : pour que
 *  l'image occupe le quart haut-DROIT sur toute sa hauteur — nom compris,
 *  comme les deux croquis la dessinent —, elle doit être la SŒUR du nom
 *  dans une même grille, pas l'enfant d'une enveloppe posée dessous. Une
 *  `.fiche-head` intermédiaire ferait commencer l'image sous le nom. */
export function renderFicheBody({ stats, blurb, traits, infos, image, imageAlt }) {
  const colonne = el("dl", "fiche-stats");
  for (const ligne of Array.isArray(stats) ? stats : []) {
    if (!ligne || typeof ligne.label !== "string" || typeof ligne.value !== "string") continue;
    const row = el("div", "fiche-stat-row");
    row.append(el("dt", null, [text(`${ligne.label} :`)]));
    row.append(el("dd", null, [text(ligne.value)]));
    colonne.append(row);
  }

  /* ⏳ AUCUNE IMAGE DE FICHE N'EXISTE ENCORE (cotes visées 200 × 260, PNG
     transparent, Eric les produit). Le dos de carte tient la place — et il
     la tient VRAIMENT : sans lui, la colonne de stats s'étalerait sur les
     226 px utiles, et tout bougerait le jour où l'image arrive. */
  const cadre = el("div", "fiche-image");
  const img = document.createElement("img");
  img.src = image;
  img.alt = imageAlt || "";
  cadre.append(img);

  /* ── LA MOITIÉ BASSE — MÊME BOÎTE, DEUX CONTENUS ────────────────────────
     ✅ Eric, 2026-08-15 : *« B3 = B2 »* ne vaut que pour la GÉOMÉTRIE. La
     boîte garde ses 160 px et sa place ; une CLASSE y met son blurb, une
     ESPÈCE y met ses traits (son croquis A). ⛔ Le choix ne se fait pas sur
     le KIND — cette fonction ne sait pas qui l'appelle, et c'est voulu
     (loi des lots 39/42) : elle rend ce qu'on lui donne. */
  const bas = Array.isArray(traits) && traits.length
    ? renderFicheTraits(traits)
    : el("p", "fiche-blurb", [text(typeof blurb === "string" ? blurb : "")]);

  /* ── LES INFOS COMPLÉMENTAIRES — croquis d'Eric, 2026-08-15 ────────────
     Une bande pleine largeur sous le bloc haut. ⭐ Elle porte ce qui n'est
     ni une stat ni de l'ambiance : aujourd'hui `Lineages`, que le SRD
     appelle lignage et qu'Eric appelle `Subspecies` — c'est le même organe,
     confirmé par lui, et il n'y en aura qu'un.
     ⛔ ELLE N'EXISTE QUE SI ELLE A QUELQUE CHOSE À DIRE : sept espèces sur
     douze n'offrent aucun lignage, et une bande vide de 40 px serait le
     « faux magasin » que ce dépôt interdit. C'est son ABSENCE qui déclenche
     le blurb centré (voir `renderCatalogueCards`). */
  const bande = Array.isArray(infos) && infos.length ? renderFicheInfos(infos) : null;

  return bande
    ? [colonne, cadre, bande, bas, renderFicheActions()]
    : [colonne, cadre, bas, renderFicheActions()];
}

/** La bande d'infos complémentaires — même forme qu'une ligne de stats
 *  (étiquette en gras, valeur en normal), mais sur toute la largeur. */
function renderFicheInfos(infos) {
  const bande = el("dl", "fiche-infos");
  bande.dataset.zone = "infos";   // ce que lit `renderCatalogueCards`
  for (const ligne of infos) {
    if (!ligne || typeof ligne.label !== "string" || typeof ligne.value !== "string") continue;
    const row = el("div", "fiche-info-row");
    row.append(el("dt", null, [text(`${ligne.label} :`)]));
    row.append(el("dd", null, [text(ligne.value)]));
    bande.append(row);
  }
  return bande;
}

/** LA LISTE DES TRAITS — `nom — effet`, une ligne courte, exactement la forme
 *  du croquis A d'Eric. ⛔ Le nom et l'effet sont DEUX nœuds : le nom se lit
 *  en diagonale (c'est lui qu'on cherche), l'effet se lit après. Une seule
 *  chaîne interdirait de les distinguer sans découper du texte au rendu. */
function renderFicheTraits(traits) {
  const liste = el("ul", "fiche-traits");
  for (const t of traits) {
    if (!t || typeof t.name !== "string" || typeof t.effect !== "string") continue;
    const item = el("li", "fiche-trait");
    item.append(el("b", "fiche-trait-nom", [text(t.name)]));
    item.append(el("span", "fiche-trait-effet", [text(` — ${t.effect}`)]));
    liste.append(item);
  }
  return liste;
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
