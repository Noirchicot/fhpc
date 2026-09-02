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

import { drawArcana } from "./dice.mjs?v=449";
import { renderCardRows } from "./catalogue.mjs?v=449";
/* Lot 75 — les images d'arcanes sont des chargements d'EXÉCUTION : leurs
   `src` portent la version du graphe, lue dans l'URL de CE module, sinon le
   cache peut servir une image d'avant avec un écran neuf (`version.mjs`). */
import { versionQuery } from "./version.mjs?v=449";

export { drawArcana };

export const DESTINY_ARCANA_PATH = "fh.destiny.arcana";
const DESTINY_STAT_ID = "fh:destiny";

/** Le dossier des 22 faces + le dos. ⛔ Le nom du fichier EST le slug du
 *  moteur — le mapping par NOM est fait à la préparation des images, pas
 *  ici (voir `assets/arcana/arcana.measured.json`). */
export const ARCANA_DIR = "./assets/arcana";
export function arcanaImageSrc(id) {
  return `${ARCANA_DIR}/${String(id).replace("fh:arcana:en:", "")}.webp${versionQuery(import.meta.url)}`;
}
export const ARCANA_BACK_SRC = `${ARCANA_DIR}/back.webp${versionQuery(import.meta.url)}`;

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
  livre.setAttribute("aria-label", "Lore");
  if (livreDe && livreDe.texte) {
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
export function vibrationsAccessibles(data, score) {
  const toutes = data && Array.isArray(data.vibrations) ? data.vibrations : [];
  const max = rangMaxDeVibration(score);
  return toutes.filter((v) => Number(v.rank) <= max);
}

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

  const tete = el("div", "card-final-tete");
  tete.append(el("span", "parcours-voyant"));
  tete.setAttribute("aria-hidden", "true");
  dalle.append(tete);

  const corps = el("div", "card-final-corps");

  /* ── la colonne TAROT ── */
  const colonneCarte = el("div", "card-final-carte");
  if (id) {
    const img = document.createElement("img");
    img.className = "card-final-img";
    img.src = arcanaImageSrc(id);
    img.alt = record ? record.name : "";
    colonneCarte.append(img);
  }
  corps.append(colonneCarte);

  /* ── la colonne TEXTE EXPLICATIF, qui défile dans son cadre ── */
  const fenetre = el("div", "card-final-texte");
  if (record) fenetre.append(el("h2", "card-final-nom", [text(record.name)]));

  const rows = renderCardRows([
    ["Signature Ability", data.ability || null],
    ["Destiny Impact", Number.isFinite(impact) && impact !== 0 ? (impact > 0 ? `+${impact}` : String(impact)) : null],
    ["Meaning", data.meaning || null],
    ["Power", data.power || null]
  ]);
  if (rows) fenetre.append(rows);

  const vibs = vibrationsAccessibles(data, score);
  if (vibs.length > 0) {
    fenetre.append(el("h3", "card-final-sous", [text("Vibrations within your reach")]));
    const liste = el("dl", "card-liste-rangs");
    for (const v of vibs) {
      liste.append(el("dt", null, [text(`${v.rank} · ${v.name}`)]));
      liste.append(el("dd", null, [text(String(v.effect).replace(/\*/g, ""))]));
    }
    fenetre.append(liste);
  }

  /* 🔴 LE SCORE EST TOUT EN BAS — la place qu'Eric lui a donnée le 2026-08-30.
     Il ferme la lecture : on découvre la carte, ses pouvoirs, puis ce qu'elle
     pèse. */
  if (score !== null) {
    const bloc = el("div", "card-score");
    bloc.append(el("span", "card-score-label", [text("Destiny Score")]));
    bloc.append(el("span", "card-score-value", [text(String(score))]));
    fenetre.append(bloc);
  }
  corps.append(fenetre);
  dalle.append(corps);

  /* ── le pied : la paire du croquis ──
     🔴 `I changed my mind` EFFACE TOUT (Eric, 2026-08-30 : *« oui rouge efface
     tout »*) — donc il est ROUGE, et il rend au **R**, pas à l'étape d'avant.
     ⚠️ CORRIGÉ AU LOT 138 : cette ligne annonçait *« il demande confirmation
     avant de défaire […] la coquille porte le popup »*. **Elle décrivait une
     architecture qui n'existe pas** — `destinyReset` (shell.mjs) efface sans
     rien demander, et le builder n'a aucun organe de confirmation. Le commentaire
     de la coquille, lui, est exact et nomme la dette : NORMES §6 veut « rouge ET
     confirmé », et les CINQ écrans qui portent ce mot en sont là.
     ⛔ Un commentaire qui promet un organe absent envoie le lot suivant chercher
     un popup pendant vingt minutes, puis croire qu'il l'a cassé. */
  const rangee = pied(data.meaning ? { titre: record ? record.name : "Lore", texte: data.meaning } : null, act);
  rangee.append(bouton("I changed my mind", "parcours-annuler", () => act({ kind: "destinyReset" })));
  rangee.append(bouton("Next", "parcours-next", () => act({ kind: "destinyNext" })));
  dalle.append(rangee);
  return dalle;
}

/** LE CORPS D'UNE FICHE DE CARTE, pour la branche `CHOOSE` — le catalogue
 *  partagé rend le cadre, ceci en remplit une. */
export function renderArcanaCardBody(query, id) {
  const view = query({ kind: "arcana", id });
  const data = (view && view.record && view.record.data) || {};
  const img = document.createElement("img");
  img.className = "card-choice-img";
  /* ⭐ PARESSEUX, ET SEULEMENT ICI. Le catalogue liste les VINGT-DEUX faces ;
     sans ça, ouvrir la branche `Choose` télécharge le jeu entier avant
     d'afficher la première carte. */
  img.loading = "lazy";
  img.src = arcanaImageSrc(id);
  img.alt = "";
  const rows = renderCardRows([
    ["Ability", data.ability || null],
    ["Impact", data.destiny && typeof data.destiny === "object" ? String(data.destiny.impact) : null],
    ["Meaning", data.meaning]
  ]);
  /* 🔴 LA FICHE PORTE SON `CHOOSE` — croquis « B2 » d'Eric (2026-08-30), et
     c'est la loi des écrans à fiche depuis Ch6 : *« chaque écran valide chez
     lui »*. Sans ce bouton, la branche du choix n'avait AUCUNE porte : le
     `Done` de la coquille restait éteint faute de carte tirée, et le joueur
     regardait vingt-deux cartes sans pouvoir en prendre une (mesuré au banc
     le 30/08).
     ⛔ IL NE SE CÂBLE PAS ICI : `data-action="choose"` est un RÔLE, et seul
     `renderCatalogueCards` connaît l'index de la fiche qu'on touche. Il naît
     donc `disabled`, et c'est le catalogue qui l'allume. */
  const pied = document.createElement("div");
  pied.className = "fiche-actions";
  const choisir = document.createElement("button");
  choisir.type = "button";
  choisir.className = "fiche-action";
  choisir.dataset.action = "choose";
  choisir.disabled = true;
  choisir.textContent = "Choose";
  pied.append(choisir);
  return [img, rows, pied].filter(Boolean);
}

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
