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

import { planAt } from "./carnet.mjs?v=56";
import { versionQuery } from "./version.mjs?v=56";

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
export const DOS_DE_CARTE = `./assets/arcana/back.jpg${versionQuery(import.meta.url)}`;

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
    const hote = ctx.fiche ? el("div", "fiche-dalle dalle-intermediaire") : card;
    if (!ctx.fiche) card.className = "catalogue-card dalle-majeure";
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
    cards.append(card);
  });
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
 *  ⛔ `LORE` NE SUIT PAS, ET C'EST DIT PLUTÔT QUE BRICOLÉ. Il demande le
 *  panneau plein écran avec son `copier` (croquis A : *« lore sends to full
 *  page description either FH or SRD »*, avec un retour), un organe partagé
 *  par trois écrans qui a son propre lot. Il reste `disabled` — un bouton
 *  qui ne répond pas est pire qu'un bouton qui s'annonce éteint.
 *
 *  📌 `data-action` est un RÔLE, pas un record : c'est ce que
 *  `renderCatalogueCards` cherche pour câbler le cran (et lui seul connaît
 *  l'index de la fiche). Le garde du lot 77 interdit `data-value` sur ces
 *  boutons — un rôle n'en est pas un, et rien ici ne porte d'identité de
 *  classe ou d'espèce. */
function renderFicheActions() {
  const pied = el("div", "fiche-actions");
  for (const mot of ["Lore", "Choose"]) {
    const bouton = el("button", "fiche-action", [text(mot)]);
    bouton.type = "button";
    bouton.dataset.action = mot.toLowerCase();
    bouton.disabled = true;   // `renderCatalogueCards` rallume `choose` s'il a un destinataire
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
export function renderFicheBody({ stats, blurb, traits, infos, image, imageSecours, imageAlt }) {
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
