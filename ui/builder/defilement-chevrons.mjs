/* ══ LA JAUGE DE DÉFILEMENT — L'ORGANE, SANS SON ÉCRAN — lot 213 ══════════
   ⛔ CE MODULE N'IMPORTE RIEN, comme `interrupteur-organe.mjs` d'à côté, et
   pour la même raison : il descend de `destiny-step.mjs` pour qu'un SECOND
   écran le prenne sans traîner Destiny derrière lui.

   ⚖️ POURQUOI MAINTENANT — Eric, 17/09 au soir, sur la fiche X1 : *« on va
   enlever les flèches de navigation latérales et on va rendre la zone de texte
   scrollable »*, puis *« juste des chevrons discrets dans la marge droite pour
   informer le lecteur »*. C'est MOT POUR MOT ce qu'il avait demandé le 03/09
   pour les fenêtres de prose de Destiny (*« des chevrons sur le côté de boîte à
   l'extérieur à droite »*) — donc le même organe, pas un second.

   ⭐ LE NOM DEVIENT NEUTRE en descendant : `jauge-defile` et `chevron-defile`
   au lieu de `card-final-*`. Un organe qui sert deux écrans ne peut pas porter
   le nom du premier — et c'est le renommage qui prouve qu'il a déménagé.
   ⛔ Le DESSIN n'a pas bougé d'un blg : même boîte de 8, mêmes 6 de chevron,
   mêmes opacités .18 / .85, même `opacity` plutôt que `display` (garde 4). */

/* ⛔ SES DEUX HELPERS SONT À LUI — cinq lignes, comme dans chaque module du
   dépôt : une feuille sans import ne va pas chercher un utilitaire ailleurs. */
function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}

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
export function veilleLeDebordement(cadre) {
  if (!cadre) return null;
  const jauge = el("div", "jauge-defile");
  jauge.setAttribute("aria-hidden", "true");
  jauge.append(el("i", "chevron-defile vers-le-haut"));
  jauge.append(el("i", "chevron-defile vers-le-bas"));
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
}
