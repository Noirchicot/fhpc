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

   ── 🔴 LOT 201 — L'EXCEPTION : LE POPUP QUI POSE UNE QUESTION ──────────
   ⚖️ Eric, 10/09 : *« Un popup doit me dire, avant même d'arriver à
   l'étape 1, tout de suite : tu veux SRD ou FH ? — et faire le réglage pour
   moi. »* Un popup qui pose une question NE SE FERME QUE PAR UNE RÉPONSE :
   ni clic à côté, ni Échap. 📏 Mesuré le 13/09 : fermé d'un clic dehors, il
   laissait le carnet vide et Species sans une espèce.
   ⭐ C'EST LA DONNÉE DU POPUP QUI LE DIT — `show(children, { exigeUneReponse })`,
   lu par la coquille sur `state.popup.exigeUneReponse` — et ce module la
   PORTE SUR L'HÔTE (`data-exige-une-reponse`) pour que la feuille fasse le
   reste : il prend le pointeur, et il voile ce qu'il couvre (shell.css). ⛔ Le
   voile n'est pas un écouteur de plus ici : rien dessous ne reçoit un clic
   parce que rien dessous n'est ATTEIGNABLE, pas parce qu'on l'intercepte.
   Sans le champ, rien ne change : le clic dehors ferme, comme depuis le 62.

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

import { swapContent } from "./socle.mjs?v=626";

/** Monte la surface de popup dans `host` (un nœud du cadre, persistant).
 *  Rend `{ show(children), hide() }` — `onOutside` est appelé quand le
 *  joueur clique dehors, à charge de l'appelant de mettre son état à jour.
 *
 *  ⛔ Ce module N'APPELLE JAMAIS `refresh()` : il ne connaît pas la coquille.
 *  Il signale, elle décide. */
export function mountPopup(host, onOutside) {
  let arme = false;
  let differe = null;
  /* LOT 201 — le popup ouvert exige-t-il une réponse ? Posé par `show`, lu par
     `dehors` : un clic à côté d'une question n'est pas une réponse. */
  let exige = false;

  const dehors = (event) => {
    if (!arme || exige) return;
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
    /** @param {Node[]} children
     *  @param {{exigeUneReponse?: boolean}} [options] LOT 201 — `true` : le popup
     *  pose une question, il ne se ferme que par une de ses actions. */
    show(children, { exigeUneReponse = false } = {}) {
      host.hidden = false;
      exige = exigeUneReponse === true;
      /* Sur l'hôte, pour la feuille : le pointeur et le voile (shell.css). */
      host.dataset.exigeUneReponse = String(exige);
      swapContent(host, children);
      desarmer();
      /* Armé au tour de boucle SUIVANT : voir « le piège du clic qui ouvre
         et ferme », en tête de fichier. */
      differe = setTimeout(() => { arme = true; differe = null; }, 0);
    },
    hide() {
      host.hidden = true;
      exige = false;
      host.dataset.exigeUneReponse = "false";
      swapContent(host, []);
      desarmer();
    }
  };
}
