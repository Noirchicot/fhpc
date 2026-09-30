/* ══ MY CHARACTERS — le rang B1 du Menu, tel qu'Eric l'a dicté — lot 374 ════════════════════════
   ⚖️ La dictée du 29/09, mot pour mot : *« B1 — other page - Your Characters (page de liste) · image /
   Ratchapapoulos / Humain Guerrier lvl4 / Les chevaliers Noirs / bouton pour ouvrir fiche de perso »*.
   Puis, chaque réponse avec sa question : la page s'appelle **My characters** (comme son bouton) ;
   `Open` **105 × 40** (*« pardon »*, pas 100) ; **la poubelle tout à droite** de chaque ligne,
   40 × 40 ; **une question avant d'effacer un perso**. Et le 30/09, à *« My characters, stockage "le
   fichier" : une page web ne peut pas effacer un fichier rangé sur l'appareil ; la poubelle d'une
   ligne ? »* → **« Efface la copie de l'app »** : la ligne quitte My characters, le fichier reste où
   le joueur l'a rangé, et la question le dit.

   🗄️ CE QU'ELLE REMPLACE : la page du magasin des lots 195 et 202 (`magasin-ecran.mjs`) — les
   versions datées groupées par personnage, `Save location` et le popup de la destination. Une ligne
   par personnage, désormais (lot 374, Q1 posée à Eric par ARCHI 35).

   ⛔ ELLE NE SAIT PAS OÙ LES OCTETS SONT : elle rend ce que l'organe du stockage a listé
   (`magasin.mjs`), et elle ne reçoit jamais l'organe — des faits seulement. La poubelle émet un geste
   et c'est la coquille qui pose la question (`popupEffacerUnPersonnage`, ci-dessous) avant d'effacer.
   ⛔ AUCUNE PAGE NE DÉFILE (Eric, 29/09 : *« on respecte les hauteurs de dalle, pas de scroll »*) :
   la liste PAGINE (`pageDeListe`, l'organe du socle), elle ne défile jamais.
   ⚠️ LES TEXTES SONT DES BROUILLONS en anglais : c'est Eric qui arrête les mots que le joueur lit. */

import { imageDeFiche, DOS_DE_CARTE } from "./catalogue.mjs?v=940";
import { motDuChoix } from "./mot-du-choix.mjs?v=940";
import { poubelle } from "./poubelle-organe.mjs?v=940";
import { pageDeListe } from "./normes.mjs?v=940";
import { swapContent } from "./socle.mjs?v=940";
import { armerEngrenage } from "./engrenage.mjs?v=940";

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/** LES MOTS DE LA PAGE — ⚠️ brouillons anglais à Eric, écrits une fois. */
export const MOTS_DE_MES_PERSONNAGES = Object.freeze({
  titre: "My characters",
  ouvrir: "Open",
  ouvrirUnFichier: "Open a file…",
  chargement: "Looking for your characters…",
  vide: "No characters here yet. Save character, at the end of creation, keeps yours here — and Open a file… brings back one you saved elsewhere.",
  sansCampagne: "none",
  sansEspeceNiClasse: "no species or class yet",
  illisible: "This character could not be read",
  pagePrecedente: "Previous page",
  pageSuivante: "Next page"
});

/** ⚖️ COMBIEN DE LIGNES TIENNENT DANS LA DALLE — une déviation DÉCLARÉE du « 15 par page » du socle
 *  (📍 `liste-quinze-est-un-defaut` : *« un écran qui dévie passe explicitement son nombre »*).
 *  📐 L'arithmétique, à 500 blg de scène : 8 (air) + 32 (titre et son écart) + la liste + 52 (la rangée
 *  des pages et son écart, quand il y en a plusieurs) + 52 (le pied `Open a file…` et son écart — 🗄️ lot
 *  376 : `Save location` est parti dans Vault) + 60 (la paire de la coquille) → 296 blg ; une ligne vaut
 *  44 (sa cible) + 8 (l'écart du sacré n° 3) = 52 ; ⌊296 / 52⌋ = **5**. ⛔ Mesuré au banc avant
 *  livraison, jamais seulement déduit. */
export const LIGNES_PAR_PAGE = 5;

/** CE QU'UNE LIGNE MONTRE — lu dans le DOCUMENT, sans dérivation.
 *  ⭐ Les choix portent ce qu'il faut : `species` et `class` (des références), `level` (un nombre).
 *  Un perso rangé qui ne dérive plus (une règle a bougé) se liste quand même — la liste ne juge pas
 *  un personnage, elle le montre. Les noms passent par `motDuChoix`, l'organe unique du mot d'un
 *  choix : un record absent se dit en clair, jamais par son id nu.
 *  @returns {{id:string, nom:string, image:string, quoi:string, campagne:string, revision:string|null}} */
export function ligneDuPersonnage(document, query, revision = null) {
  const choix = (document && document.build && Array.isArray(document.build.choices)) ? document.build.choices : [];
  const ref = (chemin) => {
    const c = choix.find((x) => x && x.path === chemin);
    return c && c.ref && typeof c.ref.id === "string" ? c.ref : null;
  };
  const valeur = (chemin) => {
    const c = choix.find((x) => x && x.path === chemin);
    return c ? c.value : undefined;
  };
  const espece = ref("species");
  const classe = ref("class");
  const niveau = valeur("level");
  const morceaux = [espece && motDuChoix(query, espece.kind, espece.id), classe && motDuChoix(query, classe.kind, classe.id)]
    .filter((m) => typeof m === "string" && m !== "");
  /* ⚖️ La forme de la dictée : « Humain Guerrier lvl4 » — l'espèce, la classe, le niveau. */
  const quoi = morceaux.length === 0
    ? MOTS_DE_MES_PERSONNAGES.sansEspeceNiClasse
    : `${morceaux.join(" ")}${Number.isInteger(niveau) ? ` lvl ${niveau}` : ""}`;
  const campagne = document && typeof document.campaign === "string" && document.campaign.trim() !== ""
    ? document.campaign.trim() : MOTS_DE_MES_PERSONNAGES.sansCampagne;
  return {
    id: document.id,
    nom: document && typeof document.name === "string" ? document.name : "",
    /* ⭐ L'IMAGE EST CELLE DE LA FICHE DE L'ESPÈCE (`imageDeFiche`, le même chemin que Species) —
       aucun écran ne remplit le `portrait` du schéma aujourd'hui. Sans espèce, le dos de carte. */
    image: espece ? imageDeFiche(espece.id) : DOS_DE_CARTE,
    quoi,
    campagne,
    revision
  };
}

/* ⭐ LA PAGE COURANTE VIT ICI, PAS DANS LE DOCUMENT — ni dans la coquille : un numéro de page n'est
   pas une décision de personnage (la loi du vivier de `glisser.mjs`). Tourner une page repeint la
   liste seule, par `swapContent`, sans repasser par la coquille. */
let pageCourante = 0;

/**
 * 🗂️ LA PAGE.
 * @param {object} ctx
 * @param {{etat:"chargement"}|{etat:"liste",personnages:object[],illisibles:object[]}|{etat:"sans-liste"}|{etat:"refus",raison:string}} ctx.personnages
 *   ce que `lister()` a rendu pour la copie de l'app
 * @param {Function} [ctx.query]  pour nommer espèce et classe
 * @param {string|null} [ctx.ouvertureRefusee]
 * @param {(action: object) => void} onAction
 *   `{kind:"ouvrirUnPersonnage", id}` · `{kind:"demanderEffacerUnPersonnage", id}` · `{kind:"ouvrirUnFichier"}`
 */
export function renderMesPersonnages(ctx, onAction) {
  const section = el("section", "universe-step mes-personnages dalle-intermediaire");
  section.dataset.objet = "dalle";
  /* ⛔ ELLE NE PORTE PAS SA PROPRE SORTIE : `data-sortie-ici` la déclare, la coquille pose `Back`. */
  section.dataset.sortieIci = "true";
  section.dataset.ecran = "characters";
  section.append(el("h3", "tdc-titre-b", [text(MOTS_DE_MES_PERSONNAGES.titre)]));

  if (ctx.ouvertureRefusee) {
    section.append(el("p", "doc-field-error", [text(`That character was not opened: ${ctx.ouvertureRefusee}`)]));
  }

  const liste = ctx.personnages || { etat: "chargement" };
  if (liste.etat === "chargement") {
    /* ⭐ « JE CHERCHE » ET « IL N'Y A RIEN » NE SE DISENT PAS PAREIL (la leçon du lot 195). */
    section.append(el("p", "universe-note mes-personnages-attente", [text(MOTS_DE_MES_PERSONNAGES.chargement)]));
  } else if (liste.etat === "refus") {
    section.append(el("p", "doc-field-error mes-personnages-refus", [text(`Your characters could not be listed: ${liste.raison}`)]));
  } else {
    const lignes = [
      ...(Array.isArray(liste.personnages) ? liste.personnages : []).map((p) => ({ ...ligneDuPersonnage(p.document, ctx.query, p.revision) })),
      ...(Array.isArray(liste.illisibles) ? liste.illisibles : []).map((i) => ({ id: i.id, illisible: i.raison }))
    ];
    if (lignes.length === 0) {
      section.append(el("p", "universe-note mes-personnages-vide", [text(MOTS_DE_MES_PERSONNAGES.vide)]));
    } else {
      section.append(renderLaListe(lignes, onAction));
    }
  }

  const pied = el("div", "parcours-pied mes-personnages-pied");
  const fichier = document.createElement("button");
  fichier.type = "button";
  fichier.className = "menu-porte mes-personnages-fichier";
  fichier.append(text(MOTS_DE_MES_PERSONNAGES.ouvrirUnFichier));
  fichier.addEventListener("click", () => onAction({ kind: "ouvrirUnFichier" }));
  pied.append(fichier);
  /* 🗄️ LOT 376 — `Save location` est parti dans Vault, où le stockage se choisit (*« jusqu'au lot Vault »*,
     ratifié par Eric le 30/09 à 12:50). */
  section.append(pied);
  return section;
}

/** LA LISTE, PAGINÉE — et la rangée des pages seulement quand il y en a plus d'une (la loi du
 *  vivier, `liste-une-seule-page-pas-de-fleches`). ⭐ SOUS la liste, pas sur ses côtés : deux
 *  gouttières latérales prendraient 88 blg à une ligne qui porte déjà image, `Open` et poubelle.
 *  ⭐ LES CHEVRONS SONT CEUX DES PAGES DE WARES ET DE X5 (`wares-chevron`, le dessin de Pack, et son
 *  engrenage — 📍 `chevron-lateral-de-pack`, `chevron-engrenage-partout`) : un seul organe de page. */
function renderLaListe(lignes, onAction) {
  const bloc = el("div", "mes-personnages-bloc");
  const corps = el("ul", "mes-personnages-lignes");
  const compte = el("span", "wares-compte mes-personnages-compte");
  const remplir = () => {
    const vue = pageDeListe(lignes, pageCourante, LIGNES_PAR_PAGE);
    pageCourante = vue.page;
    /* ⛔ `swapContent` est le SEUL remplaçant du dépôt (`socle-un-seul-ecrivain-par-brique`). */
    swapContent(corps, vue.objets.map((ligne) => renderUneLigne(ligne, onAction)));
    compte.textContent = `${vue.page + 1}/${vue.pages}`;
    return vue;
  };
  const vue = remplir();
  bloc.append(corps);
  if (vue.pages > 1) {
    const tourner = (sens) => { pageCourante += sens; remplir(); return true; };
    const chevron = (sens) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "wares-chevron";
      b.append(text(sens === "gauche" ? "‹" : "›"));
      b.setAttribute("aria-label", sens === "gauche" ? MOTS_DE_MES_PERSONNAGES.pagePrecedente : MOTS_DE_MES_PERSONNAGES.pageSuivante);
      b.dataset.sens = sens;
      b.addEventListener("click", () => tourner(sens === "gauche" ? -1 : 1));
      armerEngrenage(b, { groupe: "personnages-pages", avancer: (s) => tourner(s) });
      return b;
    };
    bloc.append(el("div", "mes-personnages-pages", [chevron("gauche"), compte, chevron("droite")]));
  }
  return bloc;
}

/** UNE LIGNE — image · nom · espèce classe niveau · campagne · `Open` · la poubelle, tout à droite.
 *  ⛔ UNE LIGNE ILLISIBLE N'A PAS D'`Open` (un bouton qui ouvre sur une erreur est un bouton mort)
 *  mais elle garde sa poubelle : c'est la seule sortie d'un personnage qu'on ne peut plus lire. */
function renderUneLigne(ligne, onAction) {
  const li = el("li", "mes-personnages-ligne");
  li.dataset.id = ligne.id;
  if (ligne.illisible) {
    li.dataset.illisible = "true";
    li.append(el("span", "mes-personnages-image-vide"));
    li.append(el("div", "mes-personnages-texte", [
      el("span", "mes-personnages-nom", [text(MOTS_DE_MES_PERSONNAGES.illisible)]),
      el("span", "doc-field-error mes-personnages-quoi", [text(ligne.illisible)])
    ]));
  } else {
    const image = document.createElement("img");
    image.className = "mes-personnages-image";
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    image.draggable = false;
    image.src = ligne.image;
    /* L'absence d'une image n'est pas une erreur : le dos de carte la remplace (la loi de la fiche). */
    image.addEventListener("error", () => { if (image.src !== DOS_DE_CARTE) image.src = DOS_DE_CARTE; });
    li.append(image);
    li.append(el("div", "mes-personnages-texte", [
      el("span", "mes-personnages-nom", [text(ligne.nom)]),
      el("span", "mes-personnages-quoi", [text(ligne.quoi)]),
      el("span", "mes-personnages-campagne", [text(ligne.campagne)])
    ]));
    const ouvrir = document.createElement("button");
    ouvrir.type = "button";
    ouvrir.className = "menu-porte mes-personnages-ouvrir";
    ouvrir.append(text(MOTS_DE_MES_PERSONNAGES.ouvrir));
    ouvrir.setAttribute("aria-label", `${MOTS_DE_MES_PERSONNAGES.ouvrir} ${ligne.nom}`);
    ouvrir.addEventListener("click", () => onAction({ kind: "ouvrirUnPersonnage", id: ligne.id }));
    li.append(ouvrir);
  }
  li.append(poubelle({
    mot: `Delete ${ligne.illisible ? MOTS_DE_MES_PERSONNAGES.illisible.toLowerCase() : ligne.nom}`,
    onClick: () => onAction({ kind: "demanderEffacerUnPersonnage", id: ligne.id })
  }));
  return li;
}

/** ❓ LA QUESTION DE LA POUBELLE — une description d'état que `paintPopup` (shell.mjs) sait peindre.
 *  ⭐ ELLE SUIT LE STOCKAGE CHOISI, PAR SA DONNÉE (`efface`), jamais par son nom :
 *  · un lieu qui NE SAIT PAS effacer (le fichier) → *« Efface la copie de l'app »* (Eric, 30/09) :
 *    la question le dit, et le fichier reste où le joueur l'a rangé ;
 *  · un lieu qui SAIT effacer (Dropbox demain) → la dictée du 29/09 : *« Delete this character for
 *    good? »* — effacé du stockage ET de l'app.
 *  · rôle `aiguilleur`, réponse EXIGÉE (`popup-question-exige-une-reponse`) ; `Cancel` et `Delete`
 *    portent le rouge de ce qui défait (`bouton-famille-defaire`).
 *  ⛔ ELLE NE SAIT PAS CE QUE `choisir` FAIT — la coquille décide.
 *  @param {{nom:string, lieuEfface:boolean, lieu:string, choisir:(voie:"cancel"|"delete")=>void}} p */
export function popupEffacerUnPersonnage({ nom, lieuEfface, lieu, choisir }) {
  const qui = nom && nom.trim() !== "" ? nom.trim() : "this character";
  return {
    titre: lieuEfface ? "Delete this character for good?" : "Delete this character?",
    role: "aiguilleur",
    exigeUneReponse: true,
    /* ⚖️ Q1 b — la poubelle retire le personnage ENTIER de l'app : sa copie et toutes ses versions
       datées ; la question le dit. */
    texte: lieuEfface
      ? `This deletes ${qui} — every saved version — from ${lieu} and from this app. It cannot be undone.`
      : `This removes ${qui} and every saved version from My characters. Your files stay where you saved them.`,
    actions: [
      { mot: "Cancel", defait: true, faire: () => choisir("cancel") },
      { mot: "Delete", defait: true, faire: () => choisir("delete") }
    ]
  };
}

/** ⚖️ § 10 — LA QUESTION DE LA RÉOUVERTURE (29/09, réponse « a ») : *« Ce perso a été modifié sur un
 *  autre appareil : garder lequel ? »* — posée quand la copie de l'app a changé depuis que CETTE copie
 *  de travail l'a ouverte (un autre onglet aujourd'hui, un autre appareil avec Dropbox). ⛔ Rien n'a
 *  été écrasé en attendant : c'est la raison d'être de la question.
 *  · rôle `aiguilleur`, réponse EXIGÉE (`popup-question-exige-une-reponse`) ;
 *  · ⚠️ AUCUNE DES DEUX VOIES NE PORTE LE ROUGE : chacune défait le travail de l'autre, et c'est la
 *    forme ouverte de `A-TRANCHER §C40` (un choix entre deux voies) — ⛔ un lot ne la tranche pas en
 *    repeignant une voie au hasard. Elles retombent sur le défaut de la famille.
 *  ⚠️ Brouillons anglais à Eric.
 *  ⚖️ LOT 377 — D'OÙ VIENT L'AUTRE VERSION SE DIT PAR LA DONNÉE (`ailleurs`, la capacité du lieu qui la
 *  tient : « in another window » pour l'app, « on another device » pour Dropbox), ⛔ jamais par un test sur
 *  le nom du lieu. Et une seconde forme, `efface` (ARCHI 35, 30/09 : (b)) — le perso a été EFFACÉ là-bas
 *  alors qu'il avait changé ici : `Keep` le renvoie, `Delete` le retire d'ici comme là-bas. `Delete` porte
 *  le rouge de la poubelle (`bouton-famille-defaire`) : c'est le même geste, confirmé ailleurs.
 *  @param {{nom:string, ailleurs?:string, genre?:"modifie"|"efface",
 *    choisir:(voie:"ici"|"ailleurs"|"garder"|"effacer")=>void}} p */
export function popupDeLaReouverture({ nom, ailleurs = "in another window", genre = "modifie", choisir }) {
  const qui = nom && nom.trim() !== "" ? nom.trim() : "This character";
  if (genre === "efface") {
    return {
      titre: "Keep this character?",
      role: "aiguilleur",
      exigeUneReponse: true,
      texte: `${qui} was deleted ${ailleurs}, but was changed here since. Nothing was deleted here.`,
      actions: [
        { mot: "Keep", faire: () => choisir("garder") },
        { mot: "Delete", defait: true, faire: () => choisir("effacer") }
      ]
    };
  }
  return {
    titre: "Which version do you keep?",
    role: "aiguilleur",
    exigeUneReponse: true,
    texte: `${qui} was also changed ${ailleurs} after you opened it here. Nothing was overwritten.`,
    actions: [
      { mot: "This one", faire: () => choisir("ici") },
      { mot: "The other one", faire: () => choisir("ailleurs") }
    ]
  };
}
