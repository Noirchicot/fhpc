/* ══ LA PAGE DU MAGASIN — le rang B où `Open` atterrit — lot 195 ══════════
   ⚖️ Eric, 10/09 : *« quand j'appuie sur **Open**, j'ai une page avec **toutes
   mes sauvegardes** dedans »*, *« un **bouton reste présent : "save
   location"** »*, *« le DM aura plus évolué, mais idem »*.

   🔴 CE QU'ELLE REMPLACE, ET LA PHRASE QUI ÉTAIT DEVENUE FAUSSE. Le rang B
   `characters` disait : *« This browser keeps one character. Open a
   .fh-char.json file from the Menu to switch… »* — vrai tant que `memoire.mjs`
   était le seul rangement. Le magasin garde AUTANT d'entrées que de Save, et
   la phrase mentait dès la seconde sauvegarde. Elle est réécrite, pas rognée.

   ⛔ ELLE NE SAIT PAS OÙ LES OCTETS SONT. Elle rend ce que `lister()` rend, et
   elle lit `ouEstCeRange()` pour la ligne discrète — jamais « es-tu le dossier
   ou le tiroir ? ». C'est ce qui rend *« jamais deux expériences pour le même
   geste »* vrai par construction : il n'y a qu'un rendu.

   ⚠️ LES TEXTES SONT DES BROUILLONS en anglais (arbitrage d'Eric, tête de
   `shell.mjs`) ; c'est lui qui arrête les mots que le joueur lit. */

import { MOT_DU_TIROIR } from "./magasin.mjs?v=621";

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
  b.append(text(libelle));
  b.addEventListener("click", onClick);
  return b;
}

/** LE MOT D'UNE DATE, tel que le joueur le lit — ⚖️ *« Ilyra — 10 sept.
 *  14:32 »*, l'exemple d'Eric.
 *
 *  🔴 IL SE FABRIQUE À PARTIR DE L'ISO, SANS `Date` — et ce n'est pas une
 *  coquetterie : `new Date(iso).toLocaleString()` rendrait l'heure LOCALE du
 *  lecteur, donc deux mots différents pour la même sauvegarde selon le fuseau,
 *  et un test qui ne pourrait rien affirmer. L'heure rangée est UTC à la
 *  seconde (`platformNow`), et c'est elle qu'on montre.
 *  ⏳ Le jour où Eric veut l'heure locale, c'est ICI que ça se change, une
 *  fois — et il faudra dire ce qu'on fait des minutes d'un autre fuseau. */
const MOIS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function motDeLaDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/.exec(String(iso));
  if (!m) return String(iso);
  return `${MOIS[Number(m[2]) - 1]} ${Number(m[3])} · ${m[4]}:${m[5]}`;
}

/* ── LES MOTS DE LA PAGE ─────────────────────────────────────────────────
   ⚠️ Chacun DIT ce qui est vrai de l'endroit où les octets sont rangés — un
   joueur qui garde tout dans le tiroir de son navigateur doit savoir que
   nettoyer ses données de site les emporte. ⛔ Pas de prose rassurante. */
export const MOT_VIDE_DOSSIER = "No saves in that folder yet. Save keeps a dated copy of your character every time — nothing is ever overwritten.";
export const MOT_VIDE_TIROIR = "Nothing saved yet. Save keeps a dated copy every time — nothing is overwritten. They live in this browser, so clearing site data takes them with it: Save also downloads a file you keep.";
export const MOT_DESTINATION = "Where should your saves go? Pick a folder and they live on your disk, where you can back them up or sync them. Or keep them in this browser — you can change it later from Save location.";

/**
 * 🗄️ LA PAGE — la liste, groupée par personnage, la plus récente en tête.
 *
 * @param {object} ctx
 * @param {{etat:"chargement"}|{etat:"liste",groupes:object[]}|{etat:"refus",raison:string}} ctx.magasin
 * @param {{mot:string, choisissable:boolean, choisi:boolean, possede:boolean}} ctx.ou
 * @param {string|null} [ctx.ouvertureRefusee]
 * @param {(action: object) => void} onAction
 *   `{kind:"ouvrirUneEntree", clef}` · `{kind:"ouvrirUnFichier"}` ·
 *   `{kind:"choisirLaDestination"}`
 */
export function renderMagasinEcran(ctx, onAction) {
  const section = el("section", "universe-step magasin-ecran dalle-intermediaire");
  section.dataset.objet = "dalle";
  /* ⛔ IL NE PORTE PAS SA PROPRE SORTIE : `data-sortie-ici` la DÉCLARE, et
     c'est la coquille qui produit la paire `Back · Done` (§6). */
  section.dataset.sortieIci = "true";
  section.dataset.ecran = "characters";
  section.append(el("h3", "tdc-titre-b", [text("My characters")]));

  const magasin = ctx.magasin || { etat: "chargement" };
  const ou = ctx.ou || { mot: MOT_DU_TIROIR, choisissable: false, choisi: false, possede: false };

  /* ⚠️ UN FICHIER REFUSÉ SE DIT ICI, parce que c'est ici qu'on l'a ouvert
     depuis le lot 195 — la tête de `R` ne le voit plus passer. */
  if (ctx.ouvertureRefusee) {
    section.append(el("p", "doc-field-error", [text(`That file was not opened: ${ctx.ouvertureRefusee}`)]));
  }

  if (magasin.etat === "chargement") {
    /* ⭐ IL DIT QU'IL CHERCHE — ⛔ jamais une liste vide pendant le chargement :
       « aucune sauvegarde » et « je n'ai pas fini de regarder » sont deux
       choses, et les confondre ferait croire au joueur qu'il a tout perdu. */
    section.append(el("p", "universe-note magasin-attente", [text("Looking for your saves…")]));
  } else if (magasin.etat === "refus") {
    section.append(el("p", "doc-field-error magasin-refus", [
      text(`Your saves could not be listed: ${magasin.raison}`)
    ]));
  } else {
    const groupes = Array.isArray(magasin.groupes) ? magasin.groupes : [];
    if (groupes.length === 0) {
      section.append(el("p", "universe-note magasin-vide", [
        text(ou.possede ? MOT_VIDE_DOSSIER : MOT_VIDE_TIROIR)
      ]));
    } else {
      const liste = el("div", "magasin-groupes");
      for (const groupe of groupes) liste.append(renderGroupe(groupe, onAction));
      section.append(liste);
    }
  }

  section.append(renderPied(ou, onAction));
  return section;
}

/** UN PERSONNAGE ET SES VERSIONS. ⚖️ *« la page montre les versions par
 *  personnage »* — le nom une fois, ses sauvegardes dessous. */
function renderGroupe(groupe, onAction) {
  const bloc = el("section", "magasin-groupe");
  bloc.dataset.personnage = groupe.personnage === null ? "" : groupe.personnage;
  bloc.append(el("h4", "magasin-nom", [
    /* ⭐ UNE ENTRÉE ILLISIBLE A SON PROPRE GROUPE et le DIT : la ranger sous un
       nom inventé la mêlerait aux vrais personnages. */
    text(groupe.personnage === null ? "Unreadable saves" : groupe.personnage)
  ]));
  const liste = el("ul", "magasin-entrees");
  for (const entree of groupe.entrees) liste.append(renderEntree(entree, onAction));
  bloc.append(liste);
  return bloc;
}

/** UNE ENTRÉE — nom · date · version, et de quoi rouvrir.
 *  ⛔ UNE ENTRÉE ILLISIBLE N'EST PAS CLIQUABLE et dit pourquoi : un bouton qui
 *  ouvre sur une erreur est un bouton mort du point de vue du joueur. */
function renderEntree(entree, onAction) {
  const ligne = el("li", "magasin-entree");
  ligne.dataset.clef = entree.clef;
  if (entree.refus) {
    ligne.dataset.refus = "true";
    ligne.append(el("span", "magasin-date", [text(motDeLaDate(entree.date))]));
    ligne.append(el("span", "doc-field-error magasin-mot", [text(entree.refus)]));
    return ligne;
  }
  const b = bouton("", "magasin-ouvrir", () => onAction({ kind: "ouvrirUneEntree", clef: entree.clef }));
  /* ⛔ LE LIBELLÉ SE COMPOSE EN TROIS MORCEAUX NOMMÉS, pas en une chaîne : la
     date et la version se lisent séparément, et un garde les mesure séparément
     (une entrée sans version doit rougir). */
  b.append(el("span", "magasin-date", [text(motDeLaDate(entree.date))]));
  b.append(el("span", "magasin-version", [text(entree.version)]));
  b.setAttribute("aria-label", `Open ${entree.personnage} — ${motDeLaDate(entree.date)}, ${entree.version}`);
  ligne.append(b);
  return ligne;
}

/** LE PIED — ⚖️ *« un bouton reste présent : save location »*, DISCRET, et à
 *  côté de lui la seule autre porte du fichier.
 *
 *  🔴 `Open a file…` VIT ICI, PAS SUR `R` (lot 195). ⚖️ Un joueur qui arrive
 *  avec un `.fh-char.json` reçu d'ailleurs doit pouvoir l'ouvrir — la loi du
 *  06/09 (*« chacun est propriétaire de ses données »*) n'a pas bougé. Mais
 *  `Open` sur `R` est désormais LA PORTE DE CETTE PAGE : y laisser aussi la
 *  boîte de fichiers du système, c'était le geste qu'Eric vient de retirer.
 *  La boîte descend donc d'un rang, là où on cherche une sauvegarde.
 *
 *  ⛔ `Save location` NE DISPARAÎT JAMAIS — même quand rien n'est choisissable.
 *  Un réglage que la plateforme ne peut pas honorer reste PRÉSENT, éteint,
 *  avec le mot qui dit où c'est (📍 `menu-reglage-impossible-reste-visible`).
 *  C'est LUI, la « ligne discrète » — la seule chose qui change entre les deux
 *  sols. */
function renderPied(ou, onAction) {
  const pied = el("div", "parcours-pied magasin-pied");
  pied.append(bouton("Open a file…", "tdc-vert magasin-fichier",
    () => onAction({ kind: "ouvrirUnFichier" })));

  const lieu = bouton(`Save location — ${ou.mot}`, "magasin-lieu",
    () => onAction({ kind: "choisirLaDestination" }));
  lieu.dataset.choisissable = String(Boolean(ou.choisissable));
  if (!ou.choisissable) {
    lieu.disabled = true;
    /* ⚠️ IL DIT POURQUOI IL DORT — ⛔ jamais un bouton gris sans raison. */
    lieu.setAttribute("title", "This browser cannot pick a folder — your saves stay here.");
  }
  pied.append(lieu);
  return pied;
}

/* ══ LE POPUP DE LA DESTINATION — la première fois, et là seulement ════════
   ⚖️ *« popup la première fois que je vais dans ce menu : "choisissez la
   destination de vos sauvegardes" »*.

   ⛔ PAS UN `confirm()` DU NAVIGATEUR, et pas `confirm.mjs` non plus : sa paire
   peint un bouton en `--critical` parce qu'elle protège une DESTRUCTION (c'est
   la raison que le lot 193 avait déjà mesurée). Ici les deux voies sont
   PAIRES — aucune ne défait rien — d'où la description d'état que `paintPopup`
   (shell.mjs) sait déjà peindre, rôle `guide`, celui qui « ne signale rien ».

   🔴 IL NE SE POSE QUE LÀ OÙ IL Y A UNE DESTINATION À CHOISIR. La coquille lit
   `ouEstCeRange().choisissable` — une DONNÉE du magasin, pas son identité. ⛔ Un
   popup posé sur une plateforme qui ne sait pas choisir de dossier serait une
   question sans réponse possible, et le mandat l'interdit en toutes lettres.

   ⚠️ ET LES DEUX VOIES RÉPONDENT. Décliner est une réponse : sans ça, « la
   première fois » se répéterait à chaque visite.

   @param {(dossier: boolean) => void} repondre */
export function popupDeLaDestination(repondre) {
  return {
    titre: "Where do your saves go?",
    role: "guide",
    texte: MOT_DESTINATION,
    actions: [
      { mot: "Keep them here", faire: () => repondre(false) },
      { mot: "Choose a folder", faire: () => repondre(true) }
    ]
  };
}
