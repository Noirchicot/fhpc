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

import { planAt } from "./carnet.mjs?v=442";
import { versionQuery } from "./version.mjs?v=442";

/* ══ L'IMAGE D'UNE FICHE — hissée ici le 2026-08-16, quand les espèces sont
   arrivées ═══════════════════════════════════════════════════════════════
   `species-step.mjs` l'annonçait mot pour mot : *« le jour où les images
   arrivent, elles arrivent pour les deux écrans AU MÊME ENDROIT »*. Elles
   sont arrivées ; voici l'endroit.

   ⭐ LE CHEMIN SE DÉDUIT DE L'ID, IL NE SE DÉCLARE PAS. Une table
   `{ wizard: "…/wizard.webp" }` serait une seconde liste à tenir d'accord
   avec le dossier ; ici, poser un fichier dans `assets/fiches/` suffit à ce
   que la fiche le prenne.
   ⛔ ET L'ABSENCE N'EST PAS UNE ERREUR : tant que le fichier n'existe pas,
   `onerror` repose le dos de carte (voir `renderFicheBody`), et les autres
   fiches ne voient aucune différence.
   📌 L'id porte son préfixe de couche (`srd:species:en:elf`) ; seul le
   dernier segment nomme le fichier — `elf.webp`. Un record FH
   (`fh:species:en:araag`) et un record SRD se rangent donc côte à côte, sans
   que le dossier connaisse les couches. */
const IMAGES_DE_FICHE = "./assets/fiches";
/* ⏳ Le dos de carte, en attendant les fiches qui n'ont pas encore la leur.
   Il porte la version du graphe comme tout ce que `ui/` charge (lot 75). */
export const DOS_DE_CARTE = `./assets/arcana/back.webp${versionQuery(import.meta.url)}`;

export function imageDeFiche(id) {
  return `${IMAGES_DE_FICHE}/${String(id).split(":").pop()}.webp${versionQuery(import.meta.url)}`;
}

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
   ✅ ÉRIC A RENVERSÉ L'INVARIANT, 2026-08-15 (Ch4) : *« ce serait bien de
   reporter ce fonctionnement aux classes et species »* — le fonctionnement
   de la CEINTURE, qu'il venait de valider : *« il fonctionne bien, il est en
   scroll/tap »*. Le rail défile ET se tape, comme elle.

   ⛔ CE QUI A CHANGÉ, ET CE QUI N'A PAS CHANGÉ. Ce qui change : le cran est
   un `<button>`, il a un `cursor: pointer`, il s'atteint au Tab. Ce qui NE
   change PAS : **taper un cran ne choisit rien**. Il émet `snapTo` — la
   MÊME action que la molette de catégories de Compétences (B7.1), dont le
   commentaire de `shell.mjs` dit déjà tout : *« il AMÈNE la section dans le
   champ, il ne filtre rien »*. Le record n'est acté que par le cran
   d'aimantation, donc par le spy, donc par le défilement (II.1). Un tap est
   un RACCOURCI DE DÉFILEMENT, pas un geste de sélection.

   📌 La note d'avant disait : *« le jour où il dit oui, elle se répare ICI,
   une fois, pour les deux écrans — c'est précisément ce que l'extraction
   achète »*. Il a dit oui, et la réparation tient en une ligne d'écouteur.
   ⭐ Les QUATRE catalogues la reçoivent (Class, Species, Destiny en mode
   « choose yourself », le don d'origine) et c'est correct : `snapTo` ne
   touche ni le document ni le curseur, il ne fait que déplacer le champ.
   Un raccourci de défilement est bon partout où il y a du défilement.

   ⚠️ LE CROQUIS C PORTE UNE ANNOTATION QUI DIT L'INVERSE — *« ONLY
   CLICKABLE »*, flèche pointée sur la ligne `SEARCH` en tête du rail (donc :
   dans le rail, seule la recherche se clique). Elle est ANTÉRIEURE à la
   phrase ci-dessus, qui la renverse explicitement ; c'est la parole d'Eric
   qui tranche, et elle est notée ici pour que personne ne « corrige » ce
   fichier d'après le vieux dessin. */
export function renderCatalogueRail(ctx, onAction) {
  const options = catalogueOptions(ctx.decisions, ctx.path, ctx.options);
  if (options.length === 0) return null;
  /* Un rail sans destinataire reste LISIBLE (les gardes le rendent nu) : le
     cran existe, il ne mène simplement nulle part. */
  const act = onAction || (() => {});
  const cursor = Number.isInteger(ctx.cursor) ? ctx.cursor : 0;
  const list = el("ol", "catalogue-rail");
  list.setAttribute("aria-label", ctx.label || "Catalogue");
  options.forEach((id, index) => {
    /* Le `<li>` est NU, le cran porte la classe : `.catalogue-rail-item` est
       coté (74 px de texte, garde 5 de `fiche-360`), et déplacer la cote sur
       une enveloppe la ferait mentir. Un `<button>` dans un `<li>` garde la
       liste une liste — un `<button>` enfant direct d'un `<ol>` n'en est pas. */
    const item = el("li", null);
    const cran = el("button", "catalogue-rail-item", [text(recordName(ctx.query, ctx.kind, id))]);
    cran.type = "button";
    /* 🖼️ UN CRAN PEUT PORTER SA VIGNETTE — Eric, 2026-08-30, sur le scrollspy
       de Destiny : *« il y a un scrollspy avec les cartes de tarot »*, puis
       *« oui des cartes »*.
       ⭐ C'EST L'ÉCRAN QUI FOURNIT L'IMAGE, PAS LE RAIL QUI LA DEVINE :
       `ctx.railImage` rend une URL ou rien. Les catalogues qui n'en donnent
       pas gardent le cran de texte, à l'octet — un rail qui irait chercher
       lui-même une image par genre serait un rail qui connaît les couches.
       ⚠️ La vignette est DÉCORATIVE (`alt=""`) : le nom reste écrit sous elle,
       donc l'annonce à l'oreille ne perd rien. */
    const src = typeof ctx.railImage === "function" ? ctx.railImage(id) : null;
    if (src) {
      const img = document.createElement("img");
      img.className = "catalogue-rail-img";
      img.src = src;
      img.alt = "";
      img.loading = "lazy";
      cran.prepend(img);
      cran.dataset.vignette = "oui";
    }
    cran.dataset.value = id;
    cran.setAttribute("aria-current", index === cursor ? "true" : "false");
    cran.addEventListener("click", () => act({ kind: "snapTo", index }));
    item.append(cran);
    list.append(item);
  });
  return list;
}

/* ══ LES FICHES ══════════════════════════════════════════════════════════
   `data-snap` est le SEUL contrat entre un écran et le scrollspy du socle
   (voir SOCLE.md). Il est posé ICI et nulle part ailleurs — un garde le
   prouve (`tests/catalogue.test.mjs`), même patron que `markPressed` au
   lot 57 : une brique, un écrivain, un garde. */
export function renderCatalogueCards(ctx, renderCard, onAction) {
  const options = catalogueOptions(ctx.decisions, ctx.path, ctx.options);
  if (options.length === 0) return null;
  const cards = el("div", "catalogue-cards");
  /* Le GENRE du catalogue, sur le conteneur. ⭐ Une seule ligne, purement
     additive : elle permet à `fiche.css` de ne servir sa géométrie qu'aux
     deux écrans à fiche, sans `:has()` — qui échoue en silence là où il
     n'est pas porté — et sans toucher au contrat `data-snap`, partagé par
     cinq écrans (Destiny, Inheritance, Skills…). */
  cards.dataset.kind = ctx.kind;
  options.forEach((id, index) => {
    const card = el("section", "catalogue-card");
    card.dataset.snap = ctx.kind;
    card.dataset.value = id;
    /* ══ L'ENVELOPPE DE RANGÉE — Eric, 2026-08-16 : « oui je veux que tu
       règles ça » ═══════════════════════════════════════════════════════════
       🔴 LE DÉFAUT QU'ELLE RÉPARE, ET IL EST GÉOMÉTRIQUE, PAS COSMÉTIQUE : la
       DERNIÈRE fiche ne pouvait pas monter en haut de la scène. Le champ de
       défilement s'arrête au bas du dernier CONTENU ; une rangée de grille
       vide ne produit aucune boîte, donc les (scène − 440) px qui suivent la
       dernière dalle n'étaient pas défilables. Wizard se posait en bas —
       53 px de décalage à 375 (invisible), **524 px à 768** (très visible).

       ⭐ LA SORTIE : deux boîtes au lieu d'une. `.catalogue-card` devient la
       BOÎTE DE RANGÉE (une scène entière, sans décor, c'est elle qui porte
       `data-snap` et le défilement) ; `.fiche-dalle` est la DALLE VISIBLE
       (440 de haut, largeur plafonnée, tout le décor). La rangée étant
       maintenant une vraie boîte, elle défile jusqu'au bout.

       ⛔ POURQUOI PAS UNE LIGNE DE CSS — les trois pistes ont été écartées
       pour une raison mesurable : un `padding` en pourcentage se résout sur la
       LARGEUR du conteneur (le piège le plus contre-intuitif du modèle de
       boîte, déjà payé dans ce fichier) ; une cale en `::after` atterrit dans
       une rangée neuve et ajoute une scène vide défilable ; et donner la
       hauteur de rangée à la fiche elle-même étalerait son fond sur toute la
       scène, puisque c'est elle qui porte le décor.

       ⚠️ SEULS LES ÉCRANS À FICHE SONT ENVELOPPÉS (`ctx.fiche`, le drapeau que
       `class-step`/`species-step` déclarent déjà). Destiny et le don d'origine
       gardent la structure plate : leurs cartes n'ont ni hauteur imposée ni
       rangée d'une scène, l'enveloppe ne leur réparerait rien et changerait
       leur mise en page sans raison. */
    /* ⭐ LA FICHE EST UNE DALLE **INTERMÉDIAIRE** DEPUIS LE 2026-08-16 — Eric,
       en acceptant la conséquence du verre : *« ben oui ce sera plus une dalle
       majeure »*. Elle était MAJEURE (III.2 : opaque, « beaucoup de contenu ou
       des images ») ; elle porte maintenant le voile à 50 %, donc le régime
       intermédiaire, et la classe le DIT au lieu de le laisser deviner.
       ⛔ Le vocabulaire des trois dalles n'est pas décoratif : c'est lui qui
       dit quelle encre a le droit d'y vivre (la matrice du lot 59 interdit
       `--text-muted` sur du verre). Une classe qui ment sur son régime
       autorise en silence une encre illisible. */
    /* 🔴 ⛔ LA FICHE NE BOUGE PAS, ET C'EST UN ORDRE — Eric, 2026-08-26, en
       montrant le R de Species servi sur son téléphone : *« on part de ça !
       état actuel »*. Cet écran EST le modèle vers lequel les autres vont ;
       le modifier serait déplacer la cible en visant.
       ⭐ J'avais commencé par la faire descendre à 35 % au motif que NORMES §4
       écrit *« 50 % → aucun organe aujourd'hui »*. C'était corriger l'objet
       d'après le document. ⛔ C'est le document qui a tort : la fiche est ici
       depuis toujours, Eric la regarde tous les jours, et il vient de la
       désigner comme la référence. §4 sera corrigé, pas la fiche. */
    const hote = ctx.fiche ? el("div", "fiche-dalle dalle-intermediaire") : card;
    if (!ctx.fiche) card.className = "catalogue-card dalle-intermediaire";
    hote.append(el("h2", "catalogue-card-name", [text(recordName(ctx.query, ctx.kind, id))]));
    const noeuds = renderCard(ctx.query, id) || [];
    /* ⭐ LA FICHE A-T-ELLE UNE ZONE D'INFOS ? Eric, 2026-08-15 : quand elle
       en a une, tout est à fleur ; quand elle n'en a pas, **le blurb se
       CENTRE** entre le bloc haut et les boutons. Deux gabarits de grille,
       donc il faut le dire au CSS — et seul cet endroit voit les nœuds
       rendus.
       ⛔ PAS `:has()` : il échoue en silence là où il n'est pas porté, et la
       fiche prendrait le mauvais gabarit sans un mot (payé deux fois le
       15 août). Un attribut se lit partout. */
    /* `data-infos` vit sur l'HÔTE, c'est-à-dire là où vit la grille — sur la
       dalle quand elle existe, sur la carte sinon. Le poser sur la carte
       enveloppante le mettrait hors de portée du sélecteur qui le lit. */
    hote.dataset.infos = noeuds.some((n) => n && n.dataset && n.dataset.zone === "infos") ? "oui" : "non";
    /* Le MÊME mécanisme que `data-infos`, pour la même raison : la feuille a
       besoin de savoir, sur l'hôte, ce que le corps a mis dedans — et un corps
       ne peut pas peindre son enveloppe. */
    if (noeuds.some((n) => n && n.dataset && n.dataset.zone === "prose")) hote.dataset.dressing = "prose";
    for (const node of noeuds) hote.append(node);
    if (hote !== card) card.append(hote);
    /* ⭐ CH6 — LE `CHOOSE` DE CETTE FICHE-CI, ET C'EST ICI QU'IL SE CÂBLE :
       cette boucle est le SEUL endroit qui connaisse l'index de la fiche.
       Le passer explicitement, plutôt que de laisser `shell.mjs` lire le
       curseur du spy, ferme le seul écart possible entre « la fiche que le
       doigt touche » et « la fiche que le curseur croit » — un écart qui
       s'ouvre dès que le spy n'a pas encore relu (un volet masqué gèle
       `requestAnimationFrame`, mesuré deux fois le 15 août).
       ⛔ Les fiches SANS pied (Destiny, le don d'origine — leurs corps ne
       passent pas par `renderFicheBody`) n'ont rien à câbler : la recherche
       rend `null`, et leur écran garde son `Validate` générique. */
    const choisir = card.querySelector('[data-action="choose"]');
    if (choisir && typeof onAction === "function") {
      choisir.disabled = false;
      choisir.addEventListener("click", () => onAction({ kind: "ficheChoose", index }));
    }
    /* ⭐ `LORE` S'ALLUME AU LOT 82, et il attendait depuis le lot 77. Il porte
       le RECORD, pas l'index : le panneau affiche une prose, il n'a rien à
       faire du cran d'aimantation. `choose`, lui, garde son index parce qu'il
       agit sur le curseur — deux boutons voisins, deux natures. */
    const lire = card.querySelector('[data-action="lore"]');
    if (lire && typeof onAction === "function") {
      lire.disabled = false;
      lire.addEventListener("click", () => onAction({ kind: "lore", ref: { kind: ctx.kind, id } }));
    }
    cards.append(card);
  });
  return cards;
}

/** Les lignes « libellé → valeur » d'une fiche. Partagées parce que les deux
 *  écrans les dessinent pareil ; ce qu'elles CONTIENNENT est propre à chacun.
 *  Une ligne sans valeur ne s'affiche pas — jamais un tiret inventé pour
 *  remplir (le pool FH est absent d'un personnage SRD pur, et alors la ligne
 *  n'existe simplement pas). */
/* ══ LE BILAN ÉTIQUETÉ — « **Mot :** texte », enchaîné, pleine largeur ══════
   🔴 Eric, 2026-08-27 : *« mets en gras, deux-points, démarre le texte juste
   derrière — le tableau à deux colonnes DÉGAGE »*. Et le 29/08, capture à
   l'appui pour la troisième fois : *« Species = ce que je veux · Classes =
   Wizard toujours pas bon »*.

   ⚠️ SA DICTÉE N'AVAIT ÉTÉ APPLIQUÉE QU'À SPECIES. Elle vivait, écrite en
   toutes lettres, DANS `species-step.mjs` — donc Class ne pouvait pas en
   hériter, et continuait de tabuler. Une règle de présentation enfermée dans
   un écran n'est pas une règle : c'est un cas particulier qui a l'air d'une
   règle.
   ⭐ Elle sort ici, à côté de `renderCardRows` qu'elle remplace dans un
   RÉSUMÉ. Les deux coexistent et ne disent pas la même chose : un tableau
   pour une fiche qu'on compare, de la prose étiquetée pour un bilan qu'on lit.

   ⛔ ET C'EST LE MÊME DOM QUE SPECIES, pas un jumeau : `p.bilan-ligne` +
   `strong`. Deux balisages « équivalents » divergent au premier style. */
export function renderBilanLignes(rows) {
  const bloc = el("div", "species-acquis-bilan");
  let posees = 0;
  for (const [label, value, opts] of rows) {
    if (value === null || value === undefined || value === "") continue;
    const ligne = el("p", "bilan-ligne");
    /* 🔗 LA TÊTE PEUT MENER AU LIVRE (§7 ter, étendu le 29/08) : une feature
       de classe est un nom DANS DE LA PROSE — le joueur ne l'a pas posée, rien
       ne dit qu'elle répond. Elle porte donc l'habit de la prose (`.lien-sort`,
       bleu souligné), jamais l'encre du jeton posé (§1 ter bis³). */
    if (opts && opts.href) {
      const lien = el("a", "lien-sort", [text(label)]);
      lien.href = opts.href;
      lien.target = "_blank"; lien.rel = "noopener";
      const tete = el("strong", null, [lien]);
      tete.append(text(" : "));
      ligne.append(tete);
    } else {
      ligne.append(el("strong", null, [text(`${label} : `)]));
    }
    /* Une valeur-nœud s'append telle quelle : c'est ce qui permet à une phrase
       de porter un lien noté (« Hunter's Mark ») sans qu'un moteur devine —
       mesuré le 29/08 : « Shield » chez le moine est l'ARMURE, l'auto-lien
       aurait menti. */
    if (typeof value === "object" && value.nodeType) ligne.append(value);
    else ligne.append(text(String(value)));
    bloc.append(ligne);
    posees += 1;
  }
  return posees > 0 ? bloc : null;
}

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
 *  tactile.
 *
 *  ⭐ `CHOOSE` EST DÉSORMAIS LA VALIDATION DE CET ÉCRAN (Ch6, arbitrage
 *  délégué par Eric le 2026-08-15 : *« CHOOSE et Validate ouvrent la même
 *  porte — lequel reste ? »*). Réponse : **CHOOSE**, et le `Validate`
 *  générique disparaît des deux écrans à fiche. Trois raisons, dans l'ordre
 *  de poids :
 *    1. **Le croquis fait foi**, et NI le croquis A (Species) NI le croquis
 *       C (Wizard) ne dessine de `Validate` sur la fiche — ils dessinent
 *       `LORE` et `CHOOSE`, et le second est annoté *« leads to choice
 *       screen »*, c'est-à-dire le 2ᵉ palier ;
 *    2. **une porte, un bouton.** Deux boutons pour la même porte, à 10 px
 *       l'un de l'autre, est le « faux magasin » que ce dépôt interdit ;
 *    3. c'est la loi du lot B — *« chaque écran valide chez lui »* — que la
 *       refonte 2 §1 a commencée en descendant `Validate` dans le contenu.
 *       La fiche est allée jusqu'au bout : elle porte SON geste.
 *
 *  ✅ `LORE` A SUIVI AU LOT 82. Il demandait le panneau plein écran du
 *  croquis A (*« lore sends to full page description either FH or SRD »*,
 *  avec son retour) — c'est `lore.mjs`, et il sert les DEUX écrans à fiche.
 *  Il est resté `disabled` cinq lots durant, ce qui était le bon choix : un
 *  bouton qui ne répond pas est pire qu'un bouton qui s'annonce éteint.
 *
 *  📌 `data-action` est un RÔLE, pas un record : c'est ce que
 *  `renderCatalogueCards` cherche pour câbler le cran (et lui seul connaît
 *  l'index de la fiche). Le garde du lot 77 interdit `data-value` sur ces
 *  boutons — un rôle n'en est pas un, et rien ici ne porte d'identité de
 *  classe ou d'espèce. */
function renderFicheActions() {
  const pied = el("div", "fiche-actions");

  /* 🔴 `LORE` N'EST PLUS UN MOT, C'EST UN LIVRE — Eric, 2026-08-26 : *« plutôt
     qu'un bouton rules ou lore, on crée un bouton de même dimension que `?`
     mais à ma gauche, il contient un livre… et exit le bouton lore »*.

     ⭐ CE QUE ÇA RANGE, ET C'EST PLUS QUE DE LA PLACE : le pied portait DEUX
     mots pour deux gestes de nature différente — `LORE` ouvre une lecture,
     `CHOOSE` écrit dans le document. Les mettre côte à côte au même habit
     disait qu'ils se valaient. Le rond les sépare : ⭕ à gauche on LIT, le
     bouton au centre on CHOISIT, ⭕ à droite on demande de l'AIDE.
     ⭐⭐ Et les deux ronds deviennent une PAIRE symétrique — le `?` était seul
     dans son coin depuis le 19/08.

     ⛔ LE RÔLE NE CHANGE PAS : `data-action="lore"` reste, donc
     `renderCatalogueCards` câble le cran exactement comme avant. Ce lot change
     un DESSIN, pas un branchement. */
  const livre = el("button", "fiche-livre");
  livre.type = "button";
  livre.dataset.action = "lore";
  livre.disabled = true;      // rallumé par `renderCatalogueCards`, comme avant
  livre.setAttribute("aria-label", "Lore");
  pied.append(livre);

  const choisir = el("button", "fiche-action", [text("Choose")]);
  choisir.type = "button";
  choisir.dataset.action = "choose";
  choisir.disabled = true;
  pied.append(choisir);
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
/* ⭐ `dressing: "prose"` — L'HABILLAGE D'UNE FICHE QUI N'A QU'UN TEXTE.
   Eric, 2026-08-20, en voyant la fiche de don : *« juste un titre centré, pas
   d'image, un bloc texte en dessous ; mets un peu d'air dans le texte. Le bloc
   texte peut prendre la place qu'il veut tant qu'il respecte sa dalle. »*
   ⚠️ CE N'EST PAS UN CHOIX SUR LE KIND — cette fonction ne sait toujours pas
   qui l'appelle (loi des lots 39/42). C'est l'APPELANT qui dit de quoi il
   dispose : un don n'a ni stats, ni traits, ni image, donc rien à mettre dans
   les deux colonnes du haut. Le dire par un habillage plutôt que par un `if
   (kind === "feat")` garde la porte ouverte à la prochaine fiche de prose. */
export function renderFicheBody({ stats, blurb, traits, infos, image, imageSecours, imageAlt, dressing }) {
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
  /* ⭐ LE REPLI SUR LE DOS DE CARTE — les vraies images arrivent une par une
     (la première le 2026-08-16), et les onze autres fiches ne doivent rien
     perdre en attendant. `onerror` est le SEUL moyen de savoir qu'un fichier
     manque : un `fetch` de vérification doublerait chaque requête, et une
     liste des images existantes serait une seconde vérité à tenir d'accord
     avec le dossier.
     ⛔ L'écouteur se retire lui-même : si le secours manquait AUSSI, le
     navigateur rappellerait `onerror` sur lui, et la boucle serait infinie. */
  if (typeof imageSecours === "string" && imageSecours !== image) {
    img.addEventListener("error", function reposer() {
      img.removeEventListener("error", reposer);
      img.src = imageSecours;
    });
  }
  cadre.append(img);

  /* ── LA MOITIÉ BASSE PORTE LE BLURB, ET ELLE LE REPORTE ────────────────
     🔴 RENVERSÉ LE 2026-08-17, sur les trois maquettes qu'Eric a faites à la
     main (Hoddon, Elf, Dragonborn — voir `fh-phb/LOT-81-FICHES-SPECIES.md`).

     Au lot 78, la moitié basse d'une espèce portait ses TRAITS et son blurb
     n'était affiché nulle part. Les maquettes d'Eric remontent les traits
     dans le quart haut-gauche, à la suite des stats, et rendent le bas à la
     prose. ⭐ Ce que ça récupère est réel : les douze blurbs existaient déjà
     dans la couche, écrits, et **aucun joueur ne les avait jamais vus**.

     ⛔ Le choix ne se fait toujours pas sur le KIND — cette fonction ne sait
     pas qui l'appelle (loi des lots 39/42). Une classe ne passe simplement
     aucun `traits`, et son bloc 1 se réduit à ses stats, comme avant. */
  const bas = el("p", "fiche-blurb", [text(typeof blurb === "string" ? blurb : "")]);

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

  /* ── LE BLOC 1 — les stats PUIS les traits, dans une seule boîte ────────
     ⭐ Les trois maquettes d'Eric posent les traits signature juste sous les
     quatre lignes de stats, dans le même quart haut-gauche : `Fey Ancestry`
     en gras, son effet en italique dessous, et ainsi de suite. C'est UNE
     boîte pour la grille — sans quoi les traits réclameraient leur propre
     rangée et la grille de la dalle passerait de cinq rangées à six, ce qui
     déplacerait l'image.
     ⛔ Une classe n'a pas de traits : son bloc 1 ne contient que ses stats, et
     sa géométrie ne bouge pas d'un pixel. */
  const bloc1 = el("div", "fiche-bloc1", [colonne]);
  if (Array.isArray(traits) && traits.length) bloc1.append(renderFicheTraits(traits));

  /* L'HABILLAGE DE PROSE : le titre, le texte, les portes. Rien d'autre —
     pas de bloc de stats vide, pas de cadre d'image à remplir. La marque part
     sur le texte, et c'est l'hôte qui la lira (même mécanisme que `infos`). */
  if (dressing === "prose") {
    bas.dataset.zone = "prose";
    return [bas, renderFicheActions()];
  }
  return bande
    ? [bloc1, cadre, bande, bas, renderFicheActions()]
    : [bloc1, cadre, bas, renderFicheActions()];
}

/** La bande d'infos complémentaires — même forme qu'une ligne de stats
 *  (étiquette en gras, valeur en normal), mais sur toute la largeur. */
function renderFicheInfos(infos) {
  const bande = el("dl", "fiche-infos");
  bande.dataset.zone = "infos";   // ce que lit `renderCatalogueCards`
  for (const ligne of infos) {
    /* ⭐ UN INTERTITRE DANS LA BANDE — organe neuf du 2026-08-16, demandé par
       le test d'Eric : *« Subclasses (bold) »* au-dessus de trois lignes.
       ⛔ RENDU DANS UN `<div>`, PAS À NU : un `<dl>` n'accepte que `dt`, `dd`
       et `div` — un `<h3>` posé dedans serait du balisage invalide, que le
       navigateur ne signale pas et que personne ne verrait passer.
       ⭐ Un `<dt>` seul hérite du gras des étiquettes et n'a PAS de
       deux-points : ce n'est pas une étiquette qui annonce une valeur, c'est
       un titre. Purement additif — une entrée sans `title` suit le chemin
       d'avant, et les 16 autres bandes du dépôt ne bougent pas. */
    if (ligne && typeof ligne.title === "string") {
      const titre = el("div", "fiche-info-row fiche-info-titre");
      titre.append(el("dt", null, [text(ligne.title)]));
      bande.append(titre);
      continue;
    }
    if (!ligne || typeof ligne.label !== "string" || typeof ligne.value !== "string") continue;
    const row = el("div", "fiche-info-row");
    row.append(el("dt", null, [text(`${ligne.label} :`)]));
    row.append(el("dd", null, [text(ligne.value)]));
    bande.append(row);
  }
  return bande;
}

/** LA LISTE DES TRAITS — le nom sur sa ligne, l'effet dessous.
 *
 *  🔴 LE TIRET A DISPARU LE 2026-08-17, et ce n'est pas cosmétique. Le lot 78
 *  écrivait `nom — effet` sur UNE ligne, parce que les traits vivaient dans la
 *  boîte du bas, large de 253 px. Ils sont montés dans le bloc 1, large de
 *  145 : une ligne unique s'y replierait au milieu d'un mot, à un endroit
 *  différent pour chaque espèce. Les maquettes d'Eric les dessinent déjà en
 *  deux lignes — nom en gras, effet en italique dessous — et c'est la forme
 *  qui tient dans une colonne étroite.
 *
 *  ⛔ Le nom et l'effet restent DEUX nœuds, comme avant : le nom se lit en
 *  diagonale (c'est lui qu'on cherche), l'effet se lit après. C'est la feuille
 *  qui décide s'ils sont côte à côte ou l'un sous l'autre. */
function renderFicheTraits(traits) {
  const liste = el("ul", "fiche-traits");
  for (const t of traits) {
    if (!t || typeof t.name !== "string" || typeof t.effect !== "string") continue;
    const item = el("li", "fiche-trait");
    item.append(el("b", "fiche-trait-nom", [text(t.name)]));
    item.append(el("span", "fiche-trait-effet", [text(t.effect)]));
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
export function catalogueValidate(ctx, palier2, palier3) {
  /* 🔴 UN TROISIÈME PALIER, 2026-08-20 — et ce n'est pas une extension
     spéculative : le don d'origine en a besoin (R3 → B0 → BS), et l'invariant
     I.4 du dépôt dit depuis toujours *« un écran peut compter UN, DEUX OU
     TROIS »*. Le code n'en comptait que deux ; il compte maintenant ce que la
     loi annonçait.
     ⛔ Les catalogues qui n'en ont pas ne bougent pas d'un pixel : sans
     `palier3`, le 2ᵉ palier reste terminal (`next: "step"`), exactement comme
     avant. C'est la SEULE façon d'élargir un organe partagé sans toucher aux
     trois écrans qui s'en servent déjà. */
  /* 🔴 PAR OÙ ON SORT SE DÉCLARE, IL NE SE DEVINE PAS — Eric, 2026-08-20 :
     *« la fin de la validation doit plutôt ramener au menu racine, où les
     bonus doivent aussi être validés »*.
     ⭐ Species et Class sont des ÉTAPES : les finir, c'est passer à la
     suivante. Le don d'origine n'en est pas une — c'est **un item de
     l'Inheritance**, et le finir doit RENDRE au guide où l'autre item (les
     bonus) attend encore sa signature. Envoyer le joueur à Destiny sautait
     par-dessus la moitié de l'étape.
     ⛔ Et `close` n'est pas qu'une navigation : c'est lui qui SIGNE l'item
     (voir `pressDone`, la branche `close`). Sans lui, la pastille du don
     restait éteinte quoi qu'on fasse — donc le pied du guide restait au `Done`
     au lieu de passer au vert et au `Next`. Un seul défaut, deux symptômes. */
  const fin = ctx.fin === "close" ? "close" : "step";
  /* 🔴 UN `Done` REMONTE D'UN CRAN, IL NE SAUTE PAS DEHORS — Eric,
     2026-08-20 : *« faut remonter de BSS à BS pour avoir un bilan, et de BS à R
     pour valider globalement »*.
     ⭐ CE QUE ÇA DIT DE L'ARBRE : chaque cran a son propre récapitulatif, et on
     le TRAVERSE en repartant. Finir les sorts (BSS) rend à la branche (BS), où
     le bilan s'est rempli ; finir la branche rend au menu racine (R0), où
     l'autre item attend encore. Refermer d'un coup depuis le fond sautait
     par-dessus le bilan que le joueur vient de remplir.
     ⛔ `remonter` n'est ni `palier` (qui descend) ni `close` (qui sort) : c'est
     le mouvement inverse de `palier`, et il n'existait pas. */
  if (ctx.palier === 3) {
    return {
      exists: Boolean(palier3),
      ready: Boolean(palier3 && palier3.ready),
      action: null,
      next: "remonter"
    };
  }
  if (ctx.palier === 2) {
    return {
      exists: Boolean(palier2),
      ready: Boolean(palier2 && palier2.ready),
      action: null,
      /* 🔴 LE `Done` D'UN CRAN INTERMÉDIAIRE SORT, IL NE DESCEND PAS — Eric,
         2026-08-20 : *« si je dis à BS Done, direction R pour valider la
         totalité »*.
         ⭐ CE QUI DESCEND, C'EST LE CHOIX, pas la validation. Choisir une liste
         entre dans ses sorts (`brancheChoisie`) ; `Done` dit « j'ai fini ici »
         et remonte. Les deux mouvements ne partagent pas le même bouton, sinon
         `Done` voudrait dire deux choses selon l'endroit — mesuré à l'écran :
         il RENVOYAIT vers BSS au lieu de rendre le menu racine. */
      next: fin
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
