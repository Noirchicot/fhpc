/* ══ LE POPUP — lot 62, invariant III.4 ═══════════════════════════════════
   « Un POPUP ou un OVERLAY se ferme en CLIQUANT DEHORS. »
   ⛔ Et l'invariant ajoute, en toutes lettres : « À coder UNE fois, pas
   trois. » Le même geste revient à TROIS endroits déjà nommés — le popup de
   commentaire de Compétences (B7.7), la fenêtre « What you already have »
   d'Equipment (B8.2), et l'overlay de détail de l'œil (B8.3). Écrit trois
   fois, il divergerait trois fois. Ce fichier est donc la seule
   implémentation, et un garde le prouve.

   ⚠️ NE PAS LE CONFONDRE AVEC LA CROIX/LE SWIPE D'UNE DALLE MAJEURE
   (III.3/III.5) : deux objets, deux fermetures. Une dalle majeure se ferme
   par croix ou swipe ; un popup se ferme en cliquant dehors. Ce fichier ne
   connaît que le second.

   ── OÙ VIT L'ÉTAT, ET POURQUOI PAS ICI ──────────────────────────────────
   `SOCLE.md` le dit d'avance : « l'état d'un popup DOIT SURVIVRE — il vivra
   dans `state` comme le reste, jamais dans le DOM ». Ce module ne retient
   donc RIEN : il monte une surface persistante dans le cadre, et
   `shell.mjs` lui dit quoi montrer. Un remplacement de contenu ne peut pas
   fermer un popup, puisque le popup n'est pas dans le contenu.

   ⛔ ET IL PASSE PAR `swapContent` (socle.mjs) POUR GARNIR SA SURFACE : le
   garde du lot 58 n'autorise `replaceChildren` que là, et il a raison même
   ici — deux façons de remplacer du contenu dans le même dépôt, c'est déjà
   une de trop.

   ── LE PIÈGE DU CLIC QUI OUVRE ET FERME ─────────────────────────────────
   Le clic qui OUVRE le popup se produit forcément DEHORS (sur une ligne de
   compétence, par exemple). Écouter le document tout de suite ferait donc
   fermer le popup dans le même geste qui vient de l'ouvrir — il
   clignoterait sans jamais s'afficher. D'où l'armement DIFFÉRÉ : l'écouteur
   ne mord qu'à partir du tour de boucle suivant. */

import { swapContent } from "./socle.mjs?v=323";

/** Monte la surface de popup dans `host` (un nœud du cadre, persistant).
 *  Rend `{ show(children), hide() }` — `onOutside` est appelé quand le
 *  joueur clique dehors, à charge de l'appelant de mettre son état à jour.
 *
 *  ⛔ Ce module N'APPELLE JAMAIS `refresh()` : il ne connaît pas la coquille.
 *  Il signale, elle décide. */
export function mountPopup(host, onOutside) {
  let arme = false;
  let differe = null;

  const dehors = (event) => {
    if (!arme) return;
    let node = event.target;
    while (node) {
      if (node === host) return; // le clic est DANS le popup : il ne ferme rien
      node = node.parentNode;
    }
    onOutside();
  };
  /* `capture: true` — le popup doit se fermer même si un contrôle en dessous
     arrête la propagation. Un bouton qui mange l'événement laisserait sinon
     le popup ouvert pour toujours, sans que personne comprenne pourquoi. */
  document.addEventListener("click", dehors, true);

  const desarmer = () => {
    if (differe !== null) clearTimeout(differe);
    differe = null;
    arme = false;
  };

  return {
    show(children) {
      host.hidden = false;
      swapContent(host, children);
      desarmer();
      /* Armé au tour de boucle SUIVANT : voir « le piège du clic qui ouvre
         et ferme », en tête de fichier. */
      differe = setTimeout(() => { arme = true; differe = null; }, 0);
    },
    hide() {
      host.hidden = true;
      swapContent(host, []);
      desarmer();
    }
  };
}
