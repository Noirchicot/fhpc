/* ══ LE DRESSING EN TROIS BANDES — NORMES §1 sexies, tranché par Eric 26/08 ══
   *« un dressing qui scrolle, des boutons fixes »* — le second écran à
   défiler, après le Seuil, et il applique la même loi :

       bande HAUTE (fixe)  · le TITRE — « Gear », absorbé de la scène :
                             ⛔ depuis l'absorption il est LA SEULE CHOSE qui
                             nomme B3, il ne peut plus disparaître (Archi 27)
       bande FLUX (défile) · la PIÈCE des boîtes (taille FIXE — l'écran
                             défile autour, elle ne se dilate pas : la loi du
                             jeton tient) · puis le SAC · puis le STORAGE —
                             « ça grandit avec le personnage »
       bande BASSE (fixe)  · la barre des boutons

   ⛔ SB3.1 et SB3.3 RESTENT DES ÉCRANS. Le flux réemploie leurs rangées
   (`rangeeEchange`, une seule écriture du geste d'échange) mais ne les
   remplace pas : les retirer de l'arborescence est une décision d'Eric,
   posée sur sa table par Archi 27 le 26/08 — si oui, ils tomberont en une
   ligne de pilote, puisque leur contenu vit déjà ici.

   ⏳ COUTURE : ce module n'est PAS encore monté par le produit —
   `equipment-step.mjs` est tenu par le siège 5-VISEUR (lot 5). Le banc
   `ecran-b3.html` le montre, le banc de parcours le mesure (GOOGLE
   HEADLESS). */

import { construireLaSceneB3 } from "./b3-scene.mjs?v=316";
import { rangeeEchange, lignesParLieu } from "./equipement-pipeline.mjs?v=316";
import { BARRE } from "./b3-disposition.mjs?v=316";

function eld(balise, classe, texte) {
  const n = document.createElement(balise);
  if (classe) n.className = classe;
  if (texte !== undefined) n.textContent = texte;
  return n;
}

/**
 * COMPOSE LE DRESSING — trois bandes.
 * @param {object} options
 * @param {object} [options.contenu]    le contenu vivant de la scène (pilote)
 * @param {"h"|"f"} [options.corps]     le filigrane
 * @param {boolean} [options.apercus]   BANC : faux ×N de la scène
 * @param {Array}  [options.lignes]     les lignes gear du personnage (avec `nomAffiche`)
 * @param {(a:object) => void} [options.onAction]      les gestes (moveGearLine, …)
 * @param {(mot:string) => void} [options.surBouton]   la barre : Equipment · Send…
 * @returns {{ noeud: HTMLElement, flux: HTMLElement }}
 */
export function construireLeDressing(options = {}) {
  const lignes = options.lignes || [];
  const onAction = options.onAction || (() => {});
  const surBouton = options.surBouton || null;

  /* 🔴 LE DRESSING PREND LE VOILE DU SITE — mesuré le 2026-08-26 : sa dalle
     rendait `rgb(31, 28, 22)`, **opaque, sans canal alpha**, seule surface de
     ce genre parmi les huit étapes. Elle contredisait la norme qu'Eric a
     ratifiée le même jour : *« voilà c'est ça la norme du site en terme de
     transparence : 50 % »*.
     ⭐ ET LA CLASSE DÉCIDE, PAS UNE VALEUR RECOPIÉE : `dalle-intermediaire`
     porte le 50 % au socle. Écrire la couleur ici ferait exactement ce que le
     fond d'Identity a fait pendant six jours — dire « comme les autres » avec
     un nombre qui cesse d'être vrai dès que les autres bougent. */
  const noeud = eld("section", "dressing dalle-intermediaire");

  /* ── bande HAUTE — le titre, et rien d'autre ── */
  const titre = eld("h2", "dressing-titre", "Gear");
  noeud.append(titre);

  /* ── bande FLUX — la seule qui défile ── */
  const flux = eld("div", "dressing-flux");
  const scene = construireLaSceneB3({
    piece: true,
    corps: options.corps,
    apercus: options.apercus,
    contenu: options.contenu,
  });
  const porteScene = eld("div", "dressing-piece");
  porteScene.append(scene.noeud);
  flux.append(porteScene);

  /* le sac et la remise — les rangées d'échange, DÉROULÉES : ici on défile,
     donc pas de pages (⛔ une liste de CHOIX pagine ; un inventaire qui
     grandit avec le personnage défile — c'est la distinction du §1 sexies). */
  for (const [lieu, mot, videMot] of [
    ["backpack", "Backpack", "The backpack is empty."],
    ["storage", "Storage", "Nothing stored."],
  ]) {
    const section = eld("section", "dressing-section");
    section.dataset.lieu = lieu;
    section.append(eld("h3", "dressing-section-titre", mot));
    const ici = lignesParLieu(lignes, lieu);
    if (!ici.length) section.append(eld("p", "pipeline-vide", videMot));
    for (const l of ici) section.append(rangeeEchange(l, lieu, onAction));
    flux.append(section);
  }
  noeud.append(flux);

  /* ── bande BASSE — la barre, extraite de la scène. Formes : lot 3
     (octogones) ; ici la bande et le câblage. Le 5ᵉ cadre du croquis reste
     réservé — un espace, pas un bouton mort. ── */
  const barre = eld("div", "dressing-barre");
  for (const nom of BARRE.noms) {
    if (!nom) { barre.append(eld("span", "dressing-reserve")); continue; }
    const b = eld("button", "dressing-bouton", nom);
    b.type = "button";
    b.setAttribute("aria-label", nom);
    if (surBouton) b.addEventListener("click", () => surBouton(nom));
    /* Craft · Companions : hors mandat (24/08) — le pilote les laisse muets. */
    barre.append(b);
  }
  noeud.append(barre);

  return { noeud, flux, peindreScene: scene.peindre };
}
