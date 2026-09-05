/* ══ L'ÉTAPE DESTINY — lot 45, refaite au 61, REFAITE AU LOT 109 ═════════
   Croquis d'Eric du 2026-08-30 (planches « B.1 » et « B2 ») et sa dictée du
   même jour. L'étape a maintenant TROIS temps, et c'est ce fichier qui rend
   le premier et le dernier ; la cérémonie du milieu vit dans
   `destiny-ceremonie.mjs`.

     **R**  — un écran FF d'ambiance, deux portes : `DRAW` (le sort tire) ou
              `CHOOSE` (le joueur choisit).
     **B1** — la cérémonie plein écran (le module voisin), quatre séquences.
     **B2** — le catalogue des 22, rail à gauche : *« c'est F pas FS, il y a
              un scrollspy avec les cartes de tarot »* (Eric, 2026-08-30).
     **④**  — l'écran final, LE MÊME pour les deux branches : la carte, son
              texte détaillé, le Score, et la paire `I changed my mind` /
              `Next`.

   ⭐ UN SEUL ÉCRAN FINAL POUR DEUX BRANCHES, et c'est ce que les deux
   planches d'Eric dessinent à l'identique. Deux rendus jumeaux auraient
   divergé au premier réglage.

   🔴 B6.2 TIENT TOUJOURS : rien n'est acté tant que le joueur n'a pas poussé
   la porte de sortie. Le tirage vit dans l'état d'écran, jamais dans le
   document — `fh.destiny.*` est un namespace STRICT, toute écriture que le
   module ne reconnaît pas fait JETER `rebuild()` (mesuré au lot 45).

   ⚠️ LE MODE N'EST PAS UN CHOIX DU DOCUMENT non plus : `draw` ou `choice` vit
   en mémoire d'écran, comme la méthode d'Abilities. */

import { drawArcana } from "./dice.mjs?v=579";
import { renderCardRows } from "./catalogue.mjs?v=579";
/* Lot 75 — les images d'arcanes sont des chargements d'EXÉCUTION : leurs
   `src` portent la version du graphe, lue dans l'URL de CE module, sinon le
   cache peut servir une image d'avant avec un écran neuf (`version.mjs`). */
import { versionQuery } from "./version.mjs?v=579";

export { drawArcana };

export const DESTINY_ARCANA_PATH = "fh.destiny.arcana";

/** 📖 Le chapitre des arcanes sur le site des règles — écrit UNE fois.
 *  ⚠️ `major-arcana` n'est qu'une page de redirection : le chapitre vivant est
 *  `fates-hand-mechanic`, et chaque carte a SA page sous `chapters/arcana/`.
 *  Vérifié le 2026-09-03 : les vingt-deux répondent 200. */
export const LIVRE_ARCANES = "https://noirchicot.github.io/fh-phb/chapters/arcana/";
const DESTINY_STAT_ID = "fh:destiny";

/** Le dossier des 22 faces + le dos. ⛔ Le nom du fichier EST le slug du
 *  moteur — le mapping par NOM est fait à la préparation des images, pas
 *  ici (voir `assets/arcana/arcana.measured.json`). */
export const ARCANA_DIR = "./assets/arcana";
export function arcanaImageSrc(id) {
  return `${ARCANA_DIR}/${String(id).replace("fh:arcana:en:", "")}.webp${versionQuery(import.meta.url)}`;
}
export const ARCANA_BACK_SRC = `${ARCANA_DIR}/back.webp${versionQuery(import.meta.url)}`;

/* 🧹 `arcanaSymboleSrc` ET LES 22 SVG SONT PARTIS — 2026-09-03, après cinq
   jeux de pictogrammes que l'œil d'Eric a refusés l'un après l'autre. Le rail
   porte désormais le chiffre et le NOM.
   ⛔ Un asset que plus aucun écran n'appelle est une dette, pas une réserve :
   il se maintient, il se déploie, et il fait croire à un lot futur qu'un organe
   existe. Les fichiers vivent toujours dans le vault (`07-Symboles-v1`) et dans
   l'historique — c'est là qu'on les reprendra si on y revient.
   📌 CE QUI RESTE DE CETTE CHASSE, ET QUI VAUT PLUS QUE LES FICHIERS : ce qui
   fait l'épaisseur d'une icône n'est ni sa toile ni son trait, c'est leur
   RAPPORT. Une livraison a doublé les deux en croyant affiner. */

/** Le chiffre romain d'un arcane, tel que la couche l'écrit (`0` … `XXI`). */
export function arcanaNumeral(query, id) {
  const vue = query ? query({ kind: "arcana", id }) : null;
  const data = vue && vue.record ? vue.record.data : null;
  return (data && data.numeral) || "";
}

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

function bouton(libelle, className, onClick) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = className;
  b.textContent = libelle;
  b.addEventListener("click", onClick);
  return b;
}

/* 🔴 LE PIED EST L'ORGANE DES AUTRES CHAPITRES, PAS UN PIED À MOI — Eric,
   2026-08-30 : *« I changed my mind comme dans les autres chapitres, organes
   livre et ? »*.
   ⭐ CE QUE ÇA REND SANS RIEN ÉCRIRE : `.parcours-pied` porte déjà l'octogone,
   les 4 px au-dessus et en dessous, le rouge du défaire, le bleu du mouvement,
   la place du livre à gauche et celle du `?` à droite. Réutiliser l'organe,
   c'est hériter de ses six réglages — et de ceux qu'il recevra demain.
   ⛔ Un pied « presque pareil » écrit à côté aurait divergé au premier
   ajustement, et personne ne l'aurait vu avant la capture d'Eric. */
function pied(livreDe, act) {
  const rangee = el("div", "parcours-pied");
  const livre = el("button", "fiche-livre parcours-livre");
  livre.type = "button";
  livre.setAttribute("aria-label", "Rules");
  if (livreDe && livreDe.href) {
    /* 📖 LE LIVRE OUVRE LES RÈGLES SUR FH WEB — Eric, 2026-09-03 : *« le livre
       mène aux règles dans FH Web »* · *« ouverture d'une fenêtre dans le site
       des règles »*.
       ⭐ CE N'EST PLUS UN POPUP DE TEXTE, ET C'EST MIEUX : la page du chapitre
       est une source datée, versionnée, avec son attribution — pas deux phrases
       recopiées par l'interface. C'est déjà la doctrine de Concept (26/08) :
       *« par défaut sur FH, sinon SRD »*.
       ⛔ `noopener` N'EST PAS UN ORNEMENT : sans lui, la page ouverte reçoit un
       `window.opener` sur le builder et peut le renavigger.
       📏 LES VINGT-DEUX DESTINATIONS EXISTENT — vérifiées une par une le
       2026-09-03, toutes en 200 : `fh-phb/chapters/arcana/<slug>/`. */
    livre.addEventListener("click", () => { window.open(livreDe.href, "_blank", "noopener"); });
  } else if (livreDe && livreDe.texte) {
    livre.addEventListener("click", () => act({
      kind: "popup", titre: livreDe.titre || "Lore", texte: livreDe.texte
    }));
  } else {
    /* ⛔ `disabled`, PAS un bouton muet : un livre qui répond au doigt sans
       rien ouvrir apprend au joueur à ne plus le regarder. */
    livre.disabled = true;
  }
  rangee.append(livre);
  return rangee;
}

/** L'id posé sur `fh.destiny.arcana`, lu dans `document.build.choices` —
 *  jamais dans `resolved` (le Score ne porte que l'IMPACT, pas l'id). */
export function currentArcanaId(document) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const entry = choices.find((c) => c.path === DESTINY_ARCANA_PATH);
  return entry && entry.ref ? entry.ref.id : undefined;
}

/* ══ LE SCORE, ET CE QU'IL OUVRE ══════════════════════════════════════════
   Eric, 2026-08-30 : *« pour avoir le score de destinée au point où on en
   est — species, feat, lvl, carte — on peut le calculer. Tu le mets tout en
   bas. »*

   ⭐ LE SOCLE CALCULE, CET ÉCRAN AJOUTE UNE SEULE CHOSE : l'impact de la
   carte **pas encore actée**. `resolved.stats` porte le Score du document tel
   qu'il est — species, inheritance, dons, niveau — et il ne peut pas connaître
   une carte que le joueur n'a pas validée. Recalculer le reste ici en ferait
   une seconde vérité (loi du lot 39 : un Score menteur s'affiche menteur). */
export function scoreDeDestinee(resolved, impact) {
  const stats = resolved && Array.isArray(resolved.stats) ? resolved.stats : [];
  const stat = stats.find((s) => s.id === DESTINY_STAT_ID);
  if (!stat || !Number.isFinite(Number(stat.value))) return null;
  return Number(stat.value) + (Number(impact) || 0);
}

/** Le rang de Vibration le plus haut qu'un Score ouvre — la table du chapitre
 *  *Destiny & Arcana* (§8), tranchée par Eric le 2026-08-29.
 *  ⛔ Cette échelle est une RÈGLE, pas un réglage d'écran : elle se corrige
 *  dans le chapitre du vault, et se recopie ici parce que le builder doit
 *  savoir quoi montrer. Le jour où elle bouge, les deux bougent. */
export function rangMaxDeVibration(score) {
  const n = Number(score);
  if (!Number.isFinite(n)) return 0;
  if (n >= 21) return 6;
  if (n >= 16) return 5;
  if (n >= 11) return 4;
  if (n >= 7) return 3;
  if (n >= 4) return 2;
  return 1;
}

/** Les Vibrations que ce Score rend atteignables.
 *  ⭐ Eric, 2026-08-30 : *« ne [pas] lister les vibrations inaccessibles =
 *  gain de place »*. Ce n'est pas qu'une économie de pixels : une liste qui
 *  montre six rangs dont quatre sont hors de portée annonce des pouvoirs
 *  qu'on n'a pas. */
/** Les TERMES du Score, tels que le socle les a calculés — jamais réadditionnés.
 *  ⭐ Croquis d'Eric du 2026-09-02 : « CALCUL DU SCORE · X + X + X = SCORE ». Il
 *  ne veut plus le total seul, il veut le voir se faire.
 *  ⛔ ET LA CARTE PAS ENCORE ACTÉE EST LE SEUL TERME QUE CET ÉCRAN AJOUTE :
 *  `resolved.stats[].breakdown` porte tout le reste (maîtrise, base d'espèce,
 *  bonus de trait, dons, gloire), avec le libellé de chaque ligne. Le recopier
 *  garde une seule vérité ; le recalculer en ferait une seconde. */
export function detailDuScore(resolved, impact, record) {
  const stats = resolved && Array.isArray(resolved.stats) ? resolved.stats : [];
  const stat = stats.find((s) => s.id === DESTINY_STAT_ID);
  const lignes = stat && Array.isArray(stat.breakdown)
    ? stat.breakdown.filter((l) => Number.isFinite(Number(l.value)))
      .map((l) => ({ label: String(l.label || ""), value: Number(l.value) }))
    : [];
  const ajout = Number(impact) || 0;
  if (ajout !== 0) lignes.push({ label: record && record.name ? record.name : "Arcana", value: ajout });
  return lignes;
}

export function vibrationsAccessibles(data, score) {
  const toutes = data && Array.isArray(data.vibrations) ? data.vibrations : [];
  const max = rangMaxDeVibration(score);
  return toutes.filter((v) => Number(v.rank) <= max);
}

/* ⭐ LE MOT DE L'AIGUILLEUR DU R — Eric, 2026-09-02 : *« l'aiguilleur donne une
   explication plus META de ce qui va se passer »*.
   ⚖️ C'EST CE QUI LE SÉPARE DE LA PROSE AU-DESSUS, et les deux sont sur la même
   dalle : les deux paragraphes parlent de **Nymedes** (vingt-deux cartes vous
   regardent), celui-ci parle du **builder** (ce que les deux boutons vont
   faire de vous). Un aiguilleur *« PRÉVIENT »* (NORMES §7) — il ne raconte pas.
   ⛔ IL NE PROMET PAS CE QUE L'ÉCRAN NE TIENT PAS : les deux branches finissent
   bien sur le même écran (`renderDestinyFinal`, un seul rendu pour deux
   chemins), et rien n'entre au document avant `Next` (B6.2, le tirage vit dans
   l'état d'écran). Les deux moitiés de la phrase sont donc vérifiables.
   📌 IL VIT ICI, À UN SEUL ENDROIT — un texte d'écran recopié dans un test
   diverge au premier réglage (même loi que `CEREMONIE_TEXTE`). */
export const PORTE_AIGUILLEUR =
  "Both doors end on the same screen — Draw plays a short ceremony, " +
  "Choose opens the deck. Nothing reaches your sheet until you press Next.";

/* ══ ① LE R — L'AMBIANCE, ET LES DEUX PORTES ═══════════════════════════════
   Eric, 2026-08-30 : *« explicatif sur R : juste explication globale, peu
   détaillée, ambiance »*. Le détail est pour la fin ; ici on donne l'envie et
   le choix du geste. */
export function renderDestinyPorte(act) {
  const dalle = el("section", "card-porte dalle-simple");
  dalle.dataset.objet = "dalle";
  dalle.append(el("h2", "card-porte-titre", [text("Your Major Arcana")]));
  dalle.append(el("p", "card-porte-mot", [text(
    "Twenty-two cards watch over Nymedes, and one of them is already looking at you. " +
    "It will shape your Destiny, lend you a power, and answer you in six ways."
  )]));
  dalle.append(el("p", "card-porte-mot", [text(
    "Let fate deal it, or walk the deck and take the face you recognise."
  )]));

  /* 🔵 LA BANDE D'AIGUILLEUR, JUSTE AU-DESSUS DES BOUTONS — Eric, 2026-09-02 :
     *« insère un bloc pour placer l'aiguilleur au dessus des boutons »*.
     ⭐ C'EST `.guide-mot`, L'ORGANE DU RANG B, PAS UN SOSIE. Il apporte déjà le
     liseré bleu, le fond à 12 %, le corps T1, l'interligne 1,5 et ses trois
     lignes de hauteur minimale — les six réglages que le 26 et le 27/08 ont
     coûté. Une bande « presque pareille » écrite ici aurait divergé au premier
     ajustement, exactement comme l'aurait fait un pied à moi (voir `pied()`).
     ⛔ ET SA PLACE EST LA MÊME QU'AILLEURS : *« on le met en bas, juste
     au-dessus des boutons »* (Eric, 26/08) — il se lit au moment où l'on
     cherche la sortie, c'est-à-dire quand la question « et maintenant ? » se
     pose. Ici c'est littéralement la question que le R pose.
     📌 Ses 8 blg au-dessus et en dessous ne sont PAS écrits sur lui : la dalle
     les donne par son `gap`, une seule fois pour tous ses enfants (shell.css).
     C'est ce qui empêche que deux marges s'additionnent — la faute que
     NORMES §4 ter nomme trois fois. */
  dalle.append(el("p", "guide-mot", [text(PORTE_AIGUILLEUR)]));

  const rangee = pied(null, act);
  rangee.append(bouton("Draw", "parcours-next", () => act({ kind: "destinyDraw" })));
  rangee.append(bouton("Choose", "parcours-next", () => act({ kind: "destinyMode", value: "choice" })));
  dalle.append(rangee);
  return dalle;
}

/* ══ ④ L'ÉCRAN FINAL — la carte, son texte, le Score ══════════════════════
   Les deux planches le dessinent pareil : deux colonnes, `TAROT` à gauche,
   `TEXTE EXPLICATIF` à droite, le voyant en tête, la paire de boutons au pied.

   🔴 « ÇA DOIT RESTER DANS LE CADRE QUE J'AI DESSINÉ » (Eric, 2026-08-30) :
   le texte détaillé ne fait pas grandir la dalle, il **défile dans sa
   colonne**. C'est le gabarit de la fenêtre du SB1 des espèces — la dalle
   tient sa hauteur, la fenêtre prend ce qui reste et défile.

   ⭐ LE VOYANT EST UN VOYANT, PAS UN BOUTON (Eric : *« idem voyant dans
   species »*). Il DIT que la carte est retenue ; c'est `Next` qui agit. Le
   nommer ainsi n'est pas de la précaution de style : le croquis l'appelait
   « bouton vert de validation », et un lot pressé en aurait fait un contrôle. */
export function renderDestinyFinal(ctx, onAction) {
  const act = onAction || (() => {});
  /* 🔴 DEUX RANGS, UN SEUL ORGANE — Eric, 2026-09-03 : la fiche du catalogue
     **EST** l'écran final, dézoomé à 0,85, moins trois choses (le voyant, le
     Destiny Score, la paire de boutons) et plus une rangée à 100 %.
     ⭐ CE N'EST PAS UNE SECONDE MISE EN PAGE : un `gabarit` qui retire, jamais
     un écran jumeau qui recopie. Le jour où l'écran final bouge, la fiche du
     catalogue bouge avec lui — sans quoi les deux divergeraient en silence,
     et c'est le défaut que le lot 60 interdit (« un catalogue, un écrivain »).
     📏 ET 0,85 N'EST PAS UN RÉGLAGE, C'EST UN RÉSULTAT : `375 × 0,85 = 318,75`,
     et la place que laisse le rail vaut `375 − 8 − 32 − 8 − 8 = 319`. À un quart
     de blg près. Le nombre est forcé par la géométrie, pas choisi à l'œil. */
  const apercu = ctx.gabarit === "apercu";
  const query = ctx.query || (() => null);
  const id = ctx.drawnId || currentArcanaId(ctx.document);
  const view = id ? query({ kind: "arcana", id }) : null;
  const record = view && view.record ? view.record : null;
  const data = (record && record.data) || {};

  const dejaActee = currentArcanaId(ctx.document) === id;
  const impact = data.destiny && typeof data.destiny === "object" ? Number(data.destiny.impact) : 0;
  /* si la carte est déjà au document, son impact est DÉJÀ dans le Score du
     socle — l'ajouter une seconde fois le doublerait. */
  const score = scoreDeDestinee(ctx.resolved, dejaActee ? 0 : impact);

  const dalle = el("section", "card-final dalle-simple");
  dalle.dataset.objet = "dalle";
  dalle.dataset.allume = "true"; // une carte est là : le voyant s'allume

  /* ⛔ PAS DE VOYANT EN APERÇU — Eric : *« ce qui est retiré de la fiche : le
     voyant vert »*. ⭐ Et c'est juste : le voyant DIT que la carte est retenue.
     Au catalogue on parcourt, on n'a rien retenu — il mentirait vingt-deux fois. */
  if (!apercu) {
    const tete = el("div", "card-final-tete");
    tete.append(el("span", "parcours-voyant"));
    tete.setAttribute("aria-hidden", "true");
    dalle.append(tete);
  } else {
    dalle.dataset.gabarit = "apercu";
    dalle.dataset.allume = "false";
  }

  const corps = el("div", "card-final-corps");

  /* ── LA CARTE, EN HAUT À DROITE ──────────────────────────────────────────
     🔴 DEUX COLONNES, ET C'EST LE CROQUIS QUI TRANCHE (2026-09-02). Le lot 116
     avait ramené cet écran à UNE colonne, sur une mesure : à 375 blg la colonne
     de texte tombait à ~40 blg. Eric avait alors dit « on y reviendra de manière
     spécifique » — c'est ce croquis-ci, et il redessine deux colonnes.
     ⭐ CE QUI CHANGE PAR RAPPORT AU 116, ET QUI REND LA MESURE CADUQUE : la
     carte n'occupe plus la moitié de la largeur sur toute la hauteur. Elle tient
     le HAUT de la colonne droite, et le texte reprend toute la largeur en
     dessous d'elle — c'est ce que le dessin montre avec la boîte du Score, plus
     large que les autres. La colonne de texte ne vaut donc plus « la moitié
     moins les gouttières » sur toute la page. */
  const colonneCarte = el("div", "card-final-carte");
  if (id) {
    const img = document.createElement("img");
    img.className = "card-final-img";
    img.src = arcanaImageSrc(id);
    img.alt = record ? record.name : "";
    colonneCarte.append(img);
  }
  corps.append(colonneCarte);

  /* ── LA COLONNE DE GAUCHE — les libellés et leurs fenêtres ───────────────
     Croquis : `ABILITY` et `IMPACT` sont des lignes courtes (une valeur tient
     à côté du mot) ; `MEANING`, `POWER` et `VIBRATIONS` portent chacun une
     FENÊTRE encadrée sous leur libellé. */

  /* 🔴 LE TITRE VIT DANS LA COLONNE DE GAUCHE — Eric, 2026-09-02 : *« centre
     Hermit au-dessus des blocs texte 1 et 2 »*. Il ne coiffe donc pas la dalle
     entière : il coiffe SA colonne, et il se centre sur elle.
     ⭐ CE QUE ÇA LIBÈRE, ET C'EST LE POINT : la colonne de droite n'a plus de
     titre au-dessus d'elle, donc la carte peut remonter jusqu'au bord haut du
     corps — c'est ce qu'Eric demande dans la même phrase. Poser le titre en
     pleine largeur l'en aurait empêché, quel que soit le réglage. */
  if (record) corps.append(el("h2", "card-final-nom", [text(record.name)]));

  const ligne = (libelle, valeur, place) => {
    if (valeur === null || valeur === undefined || valeur === "") return null;
    const l = el("p", `card-final-ligne ${place}`);
    l.append(el("span", "card-final-etiq", [text(libelle)]));
    l.append(el("span", "card-final-val", [text(String(valeur))]));
    return l;
  };
  const bloc = (libelle, contenu, place) => {
    if (!contenu) return null;
    const b = el("div", `card-final-bloc ${place || ""}`.trim());
    b.append(el("h3", "card-final-etiq", [text(libelle)]));
    b.append(contenu);
    return b;
  };

  /* 🔴 LES CHEVRONS QUI DISENT « IL Y EN A ENCORE » — Eric, 2026-09-03, a
     ouvert une exception à sa loi du non-défilement pour les deux fenêtres de
     prose, puis a nommé le signe : *« des chevrons sur le côté de boîte à
     l'extérieur à droite »*.
     ⭐ ALORS LE DÉFILEMENT DOIT SE VOIR : un joueur qui ne sait pas qu'il manque
     du texte croit avoir lu la règle entière — ce qui est PIRE que la coupe
     visible qu'on vient de retirer, parce que rien ne l'avertit.
     ⛔ L'ASCENSEUR NE SUFFIT PAS, ET C'EST MESURABLE : sur iOS il est en
     surimpression et n'apparaît QUE pendant le geste. Le chevron est le seul
     signe qui existe AVANT qu'on touche.
     ⚠️ POURQUOI CE N'EST PAS DU CSS : aucune règle ne sait dire « ce texte
     dépasse sa boîte ». Il faut mesurer, donc du code — mais le code ne fait que
     POSER UNE CLASSE, la feuille garde tout le dessin.
     ⭐ ET LE HAUT COMPTE AUTANT QUE LE BAS : arrivé en bas, ce qui reste à dire
     est qu'il y a du texte AU-DESSUS. Un seul chevron mentirait la moitié du
     temps. */
  const veilleLeDebordement = (cadre) => {
    if (!cadre) return null;
    const jauge = el("div", "card-final-defile");
    jauge.setAttribute("aria-hidden", "true");
    jauge.append(el("i", "card-final-chevron vers-le-haut"));
    jauge.append(el("i", "card-final-chevron vers-le-bas"));
    const relire = () => {
      cadre.classList.toggle("deborde-haut", cadre.scrollTop > 1);
      cadre.classList.toggle("deborde-bas",
        cadre.scrollHeight - cadre.clientHeight - cadre.scrollTop > 1);
    };
    /* ⚠️ RIEN N'EST MESURABLE AVANT LA MISE EN PAGE : au moment où ce nœud est
       fabriqué il n'est pas encore au document, et les trois hauteurs valent 0.
       Un appel direct ICI rendrait « ne déborde pas », toujours.
       ⛔ ET L'OBSERVATEUR SEUL NE SUFFIT PAS — mesuré au banc le 2026-09-03 : il
       ne se déclenche que sur un changement de TAILLE, et la boîte est plafonnée
       à 4 lignes. Un texte deux fois plus long n'en change pas la taille d'un
       blg : le contenu déborde et aucun événement ne le dit.
       ⭐ D'OÙ LES DEUX : une lecture programmée pour la première mise en page,
       et l'observateur pour ce qui bouge après (largeur du panneau, cran de la
       ceinture). Aucun des deux ne couvre le cas de l'autre. */
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(relire);
    if (typeof ResizeObserver === "function") new ResizeObserver(relire).observe(cadre);
    cadre.addEventListener("scroll", relire, { passive: true });
    return jauge;
  };

  /* 🔴 LES HUIT BLOCS SONT DES ENFANTS DIRECTS DE LA GRILLE — Eric, 2026-09-03 :
     *« tu as 7 blocs texte et un bloc image, place-les et fige-les »*.
     ⛔ CINQ D'ENTRE EUX VIVAIENT DANS UN CONTENEUR, et c'est ce qui rendait
     l'écran impossible à régler : un bloc enfermé ne peut pas être PLACÉ, il
     subit le flux de sa boîte. Toute la soirée s'est passée à pousser des marges
     pour déplacer des blocs qui n'avaient pas d'adresse.
     ⭐ Chacun porte maintenant SA case, nommée dans `grid-template-areas`. Le
     dessin se lit dans la feuille en sept lignes, et se change en déplaçant un
     mot — plus en compensant une marge par une autre. */
  const courtes = [
    ligne("Ability", data.ability || null, "aire-ability"),
    /* 🔴 `+0` S'ÉCRIT, IL NE SE TAIT PAS — Eric, 2026-09-03 : *« manque impact
       dans Strength »* · *« idem dans Death »* · *« +0 »*.
       ⛔ LE CODE MASQUAIT LE BLOC QUAND L'IMPACT VALAIT ZÉRO, et c'est la faute
       que le dépôt nomme depuis le 20/08 : **une absence n'est jamais une
       réponse**. Un champ à `0` caché ne se lit pas « zéro », il se lit « cette
       carte n'a pas d'impact » — et cinq arcanes sur vingt-deux racontaient
       cette histoire fausse.
       ⭐ La distinction reste faite là où elle a un sens : `null` (la couche ne
       dit rien) se tait toujours, `0` s'écrit. Ce ne sont pas le même fait. */
    ligne("Impact", Number.isFinite(impact) ? (impact >= 0 ? `+${impact}` : String(impact)) : null, "aire-impact")
  ].filter(Boolean);
  for (const l of courtes) corps.append(l);

  const meaning = bloc("Meaning", data.meaning ? el("p", "card-final-cadre", [text(data.meaning)]) : null, "aire-meaning");
  if (meaning) { const j = veilleLeDebordement(meaning.lastChild); if (j) meaning.append(j); corps.append(meaning); }

  const power = bloc("Power", data.power ? el("p", "card-final-cadre", [text(data.power)]) : null, "aire-power");
  if (power) { const j = veilleLeDebordement(power.lastChild); if (j) power.append(j); corps.append(power); }

  /* ── LES VIBRATIONS, EN PLEINE LARGEUR SOUS LA CARTE ─────────────────────
     🔴 Eric, 2026-09-02 : *« la carte remonte jusqu'à être au-dessus du bloc
     Vibrations. le bloc prend la place en largeur sous la carte à droite. Avec
     cet espace les vibrations tiennent en 3 lignes »*.
     ⭐ ET C'EST LA LARGEUR QUI PAIE LA HAUTEUR. Dans la colonne de gauche (190
     blg), chaque vibration prenait DEUX lignes — son nom, puis son effet en
     dessous. Sur les 335 blg de la pleine largeur, le nom et l'effet tiennent
     sur la MÊME ligne : trois vibrations, trois lignes. On ne gagne pas la
     place en coupant du texte, on la gagne en cessant de le plier.
     ⛔ Ce n'est donc plus une `<dl>` : un couple terme/définition s'empile par
     nature. Une vibration est UNE phrase dont le début est son nom. */
  const vibs = vibrationsAccessibles(data, score);
  if (vibs.length > 0) {
    const liste = el("div", "card-final-cadre card-final-rangs");
    for (const v of vibs) {
      /* 🔴 « 1 vp » EN GRAS, PUIS LE TEXTE — Eric, 2026-09-03 : *« 1 vp (en gras)
         texte · 2 vp (en gras) texte · 3 vp idem »*. Le rang ouvre la ligne sous
         sa forme de COÛT, et c'est lui seul qui porte le gras ; le nom de la
         vibration repasse dans le texte courant avec son effet. */
      /* 🔴 LA VIBRATION N'EST QUE NOMMÉE — Eric, 2026-09-03 : *« les vibrations
         peuvent n'être que nommées »* · *« dans tous les cas le livre permet de
         voir la description entière »*.
         📏 CE QUE ÇA REND, ET C'EST LE POSTE QUI DÉBORDAIT : trois lignes
         courtes au lieu de cinq longues, soit ~48 blg sur un budget de 500. On
         ne coupe pas le texte, on le DÉPLACE — il est en entier dans le livre,
         l'organe du pied qui existait déjà.
         ⭐ ET C'EST LA LOI DU DÉPÔT, PAS UNE TROUVAILLE : « un contenu qui ne
         tient pas : demander ce qu'il porte EN TROP, jamais ajouter un
         défilement ». L'effet n'était pas en trop dans le jeu, il était en trop
         SUR CET ÉCRAN. */
      const ligneVib = el("p", "card-final-rang");
      ligneVib.append(el("b", "card-final-rang-cout", [text(`${v.rank} vp`)]));
      /* 🔗 LE NOM EST UN LIEN, ET IL OUVRE UN POPUP — Eric, 2026-09-03 : *« les
         vibrations = popup »*.
         ⚖️ HABIT : `.lien-sort`, la classe du dépôt pour « un nom dans une
         phrase » — `--lien`, ce bleu à un souffle de l'encre, **non souligné**
         (NORMES §1 ter bis³). ⛔ Pas `--info` : un lien n'est pas une
         information qui crie. Et c'est un `<button>`, pas un `<a>` : un `<a>`
         arriverait souligné par défaut, et la norme a mesuré ce défaut le 29/08.
         ⭐ RIEN N'EST PERDU, TOUT EST DÉPLACÉ : le popup porte l'effet entier,
         le livre porte le chapitre. L'écran ne montre que ce qui tient. */
      /* ⛔ INERTES EN APERÇU — Eric, 2026-09-03 : *« inertes »*.
         ⭐ DEUX RAISONS, ET LA SECONDE EST MESURÉE. La fiche du catalogue se
         PARCOURT : on fait défiler les vingt-deux pour choisir, et ouvrir un
         popup interrompt ce parcours pour une information qu'on relira en SB2.
         📏 Et le dézoom rapetisse les cibles de 15 % : un lien déjà court y
         devient une cible plus petite qu'ailleurs sur l'écran. Le rendre inerte
         retire le problème au lieu de le compenser.
         ⚖️ ALORS IL PERD SON HABIT DE LIEN : `--lien` sur un mot qui ne mène
         nulle part apprend au joueur à ne plus y croire. En aperçu c'est un
         `<span>` d'encre de corps ; en SB2 il redevient bouton et lien. */
      let lien;
      const effet = String(v.effect).replace(/\*/g, "");
      if (apercu) {
        lien = el("span", "card-final-rang-nom", [text(v.name)]);
      } else {
        lien = document.createElement("button");
        lien.type = "button";
        lien.className = "lien-sort";
        lien.textContent = v.name;
        lien.addEventListener("click", () => act({
          kind: "popup", titre: `${v.rank} vp · ${v.name}`, texte: effet
        }));
      }
      ligneVib.append(text(" "));
      ligneVib.append(lien);
      liste.append(ligneVib);
    }
    const b = bloc("Vibrations", liste);
    b.className += " card-final-etale aire-rangs";
    corps.append(b);
  }

  /* ── LE CALCUL DU SCORE, EN PLEINE LARGEUR ───────────────────────────────
     🔴 Croquis : « CALCUL DU SCORE », et sa boîte est plus LARGE que les autres
     — elle passe sous la carte. Eric ne veut plus seulement le total : il veut
     le voir se FAIRE, `X + X + X = SCORE`.
     ⭐ LES TERMES SONT CEUX DU SOCLE, PAS UNE SECONDE ADDITION. `resolved.stats`
     porte déjà son `breakdown`, terme par terme, avec le libellé de chacun ; on
     le recopie. Recalculer ici en ferait une seconde vérité (loi du lot 39). */
  /* ⛔ PAS DE DESTINY SCORE EN APERÇU — Eric : *« ce qui est retiré de la
     fiche : la partie destiny score »*. ⭐ Et c'est la même raison que le
     voyant : le Score dit ce que la carte VAUT UNE FOIS PRISE. Au catalogue on
     n'a rien pris, et l'afficher vingt-deux fois ferait vingt-deux promesses.
     📏 Il pesait 100 blg plus son écart — le poste le plus lourd de l'écran. */
  if (score !== null && !apercu) {
    /* 🔴 LE TOTAL MONTE SUR LA LIGNE DE L'ÉTIQUETTE — Eric, 2026-09-03 :
       *« Destiny score. X · item 1 (en t1) · item 2 · item 3 · item 4 »*.
       ⭐ CE QUE ÇA CHANGE DANS LA LECTURE : on lit d'abord CE QUE ÇA VAUT, puis
       d'où ça vient. Le « = X » au bout d'un calcul enroulé faisait l'inverse —
       il fallait suivre les termes jusqu'au bout pour trouver le résultat, et sa
       place changeait avec l'enroulement. Ici le total est toujours au même
       endroit, quel que soit le nombre de termes. */
    const b = el("div", "card-final-bloc card-final-score aire-score");
    const tete = el("h3", "card-final-etiq card-final-score-tete");
    tete.append(el("span", null, [text("Destiny Score")]));
    tete.append(el("span", "card-final-total", [text(String(score))]));
    b.append(tete);
    const calcul = el("p", "card-final-cadre card-final-calcul");
    const termes = detailDuScore(ctx.resolved, dejaActee ? 0 : impact, record);
    /* 🔴 CHAQUE TERME DIT D'OÙ IL VIENT — Eric, 2026-09-03 : *« tu fais le
       détail : +2 feat (si c'est le cas) + 2 elf + 2 hermit + 2 PB (car lvl 1) »*.
       ⛔ Le total muet (« 2 + 2 + 2 ») ne se conteste pas : on ne peut pas voir
       QUEL terme est faux. Nommé, il devient vérifiable à la table.
       ⭐ ET LE MOT EST CELUI DU SOCLE, RECOPIÉ. `resolved.stats[].breakdown`
       porte déjà le libellé de chaque ligne — « Proficiency Bonus », le nom de
       l'espèce, celui du trait, du don, de la carte. En fabriquer un plus court
       ici serait une seconde vérité, et elle mentirait le jour où une règle
       change de nom. */
    for (const t of termes) {
      const jeton = el("span", "card-final-terme");
      jeton.append(el("span", "card-final-terme-val", [text(t.value > 0 ? `+${t.value}` : String(t.value))]));
      jeton.append(el("span", "card-final-terme-mot", [text(t.label)]));
      calcul.append(jeton);
    }
    b.append(calcul);
    /* ⛔ SUR `corps`, PAS SUR `fenetre` — mesuré à l'écran le 02/09 : posé dans
       la colonne de gauche, `grid-column: 1 / -1` ne pouvait rien faire, il
       héritait de la largeur de sa colonne. Une propriété de grille ne parle
       qu'aux ENFANTS DIRECTS de la grille. Le croquis le veut plus large que
       les autres boîtes, donc il est l'enfant du corps. */
    corps.append(b);
  }
  dalle.append(corps);

  /* ── LE PIED : DEUX RANGS, DEUX PAIRES, ET C'EST LE RANG QUI DÉCIDE ──────
     🔴 Eric, 2026-09-03 : *« en B2 le back ramène à R »* · *« en SB2 : I changed
     my mind dans le FF revient à B2 »*.
     ⭐⭐ LE BOUTON NE RETIENT RIEN. J'avais proposé qu'il se souvienne d'où on
     vient ; Eric a tranché autrement, et mieux : c'est le RANG où l'organe est
     rendu qui porte sa sortie. Pas d'historique à relire, pas d'état à tenir à
     jour — donc aucun chemin tordu ne peut le mettre en défaut. C'est la même
     loi que `R`/`B`/`SB` : un rang se lit, il ne se mémorise pas.

     ⚠️ ET LE PIED DE L'APERÇU VIT HORS DU ZOOM — Eric : *« ce qu'on rajoute sur
     la fiche et NON DÉZOOMÉS : le bouton choose, le livre et le ? »*.
     ⭐ CE QUE ÇA RÉPARE AU PASSAGE, ET C'EST OUVERT DEPUIS LE LOT 138 : le `?`
     est `position: absolute; bottom: var(--sp-8)` — ancré à la DALLE, pas au
     pied. Tant qu'il l'était, il flottait à côté des boutons au lieu de suivre
     leur ligne, et aucun réglage d'espacement ne le rattrapait. Sorti du zoom,
     il n'a plus le choix : il suit le pied. */
  const slug = record && record.slug ? record.slug : String(id || "").replace("fh:arcana:en:", "");
  const rangee = pied(slug ? { href: `${LIVRE_ARCANES}${slug}/` } : null, act);
  if (apercu) {
    /* ⛔ CET ÉCRAN NE DESSINE PAS SON `Back`, ET UN GARDE ME L'A REFUSÉ —
       `shell-wiring` 17 : *« UN SEUL retour dans tout ui/, et c'est la coquille
       qui le pose »* (I.5). J'avais écrit le bouton ici parce qu'Eric le
       demandait « à côté de Choose » ; le garde a raison et la demande aussi —
       ce qui manquait, c'est le CHEMIN.
       ⭐ IL EXISTE DÉJÀ, ET LE GARDE LE NOMME : *« l'item déclare un hôte et
       reçoit la paire de la coquille »*. La rangée porte `data-sortie-ici`, la
       coquille y pose SON retour, le livre passe à gauche et le `?` à droite
       (`poserLaSortie`). Le bouton d'Eric arrive, sans second chemin de retour.
       ⚖️ ET C'EST `pressBack()` QUI APPREND LE CRAN : le catalogue de Destiny
       devient un cran de recul entre le palier et l'étape — même élargissement
       que le lore au lot 82 et l'item au 19/08, pas un assouplissement. */
    rangee.setAttribute("data-sortie-ici", "");
    /* ⛔ `data-action="choose"` EST UN RÔLE, PAS UN CÂBLAGE : seul
       `renderCatalogueCards` connaît l'index de la fiche qu'on touche. Le bouton
       naît donc `disabled`, et c'est le catalogue qui l'allume — la loi posée au
       lot 45, qu'on ne double pas ici. */
    const choisir = el("button", "fiche-action");
    choisir.type = "button";
    choisir.dataset.action = "choose";
    choisir.disabled = true;
    choisir.append(text("Choose"));
    rangee.append(choisir);
  } else {
    /* 🔴 `Cancel` EFFACE TOUT (Eric, 2026-08-30 : *« oui rouge efface
       tout »*) — donc il est ROUGE. ⚠️ Il s'appelait `I changed my mind`
       jusqu'au 2026-09-05 ; Eric : *« cancel est clair et court »*, puis
       *« remplace par cancel partout »*. Le VERBE n'a pas bougé — les deux
       mots étaient déjà la même famille au corpus (DÉFAIRE, rouge). ⭐ SA DESTINATION SUIT LE RANG : en SB2 il
       rend au catalogue (rien n'était acté), ailleurs il rend au R en effaçant.
       C'est la coquille qui lit le rang, pas ce bouton — il n'émet qu'un verbe. */
    rangee.append(bouton("Cancel", "parcours-annuler", () => act({ kind: "destinyReset" })));
    /* 🔴 « NEXT », ET C'EST UN RETOUR EN ARRIÈRE ASSUMÉ SUR LE 02/09.
       Le croquis d'Eric disait *« DONE, pas NEXT »*, et le lot 142 l'a écrit.
       Eric, 2026-09-03, après avoir fait mesurer Species : *« on peut skip le
       done »* · *« c'est i changed my mind et next direct »*. La demande la plus
       récente fait loi, et elle est datée ici pour que personne ne redéfasse
       l'une en croyant réparer l'autre.
       ⭐ CE QUE LA MESURE A MONTRÉ, ET QUI DONNE RAISON À ERIC : dans Species, le
       pied vaut `I changed my mind` + `Done` tant que l'étape n'est pas faite,
       puis `I changed my mind` + `Next`. Deux états pour un seul geste — ici le
       `Next` ACTE ET AVANCE d'une pression (`destinyNext` ne change pas), donc
       l'état intermédiaire n'a rien à montrer.
       ⚖️ NORMES §6 sépare `NEXT` (naviguer) de `DONE` (acter) : la nuance reste
       vraie partout ailleurs. Ici le même bouton fait les deux, et c'est le
       parcours d'Eric qui le décide — pas une confusion des deux mots. */
    rangee.append(bouton("Next", "parcours-next", () => act({ kind: "destinyNext" })));
  }
  dalle.append(rangee);
  return dalle;
}

/* 🧹 `renderArcanaCardBody` A ÉTÉ RETIRÉ — lot 143, 2026-09-03.
   ⛔ C'ÉTAIT UNE SECONDE MISE EN PAGE DE LA MÊME CARTE : image, trois lignes,
   un bouton — à côté de l'écran final qui montre la même carte en mieux. Deux
   écrans qui disent la même chose se corrigent deux fois, et divergent la fois
   où l'on oublie. C'est le défaut que le garde du lot 60 interdit aux
   catalogues, et il vivait ici sans que personne le nomme.
   ⭐ LA FICHE DU CATALOGUE EST DÉSORMAIS `renderDestinyFinal({ gabarit:
   "apercu" })` : le MÊME organe, à qui l'on retire le voyant, le Score et la
   paire de boutons. Ce qui bouge sur l'écran final bouge sur la fiche.
   ⚠️ ET IL ÉTAIT DÉJÀ MORT QUAND JE L'AI RETIRÉ : plus aucun appel en
   production, seulement trois tests qui le maintenaient vert. Un export que
   seuls ses tests appellent est un orphelin — la suite reste verte pendant que
   le code ne sert plus. */


/**
 * L'aiguilleur de l'étape — il ne dessine rien lui-même.
 *
 * @param {object} ctx
 * @param {"porte"|"final"} ctx.phase  la cérémonie, elle, est rendue à part
 * @param {object} ctx.document        le document brut
 * @param {object} ctx.resolved        la fiche dérivée — le Score, à l'octet
 * @param {Function} ctx.query         `layers.verbs.query`
 * @param {string} [ctx.drawnId]       la carte tirée ou choisie, pas actée
 */
export function renderDestinyStep(ctx, onAction) {
  const act = onAction || ctx.onAction || (() => {});
  const section = el("section", "card-step");
  const id = ctx.drawnId || currentArcanaId(ctx.document);
  /* ⚠️ LA PHASE PRIME, MAIS UNE CARTE POSÉE RAMÈNE TOUJOURS AU FINAL : un
     joueur qui revient sur son étape doit revoir sa carte, pas la porte du
     tirage. */
  if (ctx.phase === "final" || (ctx.phase !== "porte" && id)) {
    section.append(renderDestinyFinal({ ...ctx, drawnId: id }, act));
    return section;
  }
  section.append(renderDestinyPorte(act));
  return section;
}

/** LE PALIER DE DESTINY.
 *  ⛔ `exists: false` DANS LES DEUX ÉCRANS QUI PORTENT LEUR PROPRE PIED — le
 *  R a `Draw`/`Choose`, le final a `I changed my mind`/`Next`. Laisser la
 *  coquille poser sa paire en plus, ce serait le doublon du 19/08 : deux
 *  commandes pour un geste, à dix pixels l'une de l'autre. */
export function destinyValidate(ctx) {
  const drawnId = ctx.drawnId;
  const pret = Boolean(drawnId);
  return {
    exists: false,
    ready: pret,
    action: pret ? { kind: "choose", path: DESTINY_ARCANA_PATH, ref: { kind: "arcana", id: drawnId } } : null,
    next: "step"
  };
}
