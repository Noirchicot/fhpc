/* ══ LE TAMBOUR — le mécanisme d'une roue à crans, et rien d'autre ══════════════
   ⛔ MODULE FEUILLE : aucun import, aucune cote, aucune couleur, aucun nom d'écran. Il ne
   sait pas ce qu'un cran DÉSIGNE — une section, une catégorie, une sous-catégorie — et
   c'est la condition pour qu'il y en ait trois.

   🔴 POURQUOI IL EXISTE, ET LA DOCTRINE A DÉJÀ ÉTÉ PAYÉE DEUX FOIS. Eric, 17/09, sur
   l'interrupteur du menu que je recopiais au lieu de le reprendre : *« t'es pas foutu de
   récupérer le bouton du menu et de le mettre ici, bordel ! »*. `jeton-objet.mjs` est né de
   cette phrase ; celui-ci naît de la même, au moment où Wares réclame **deux** roues de plus
   (les catégories, puis les sous-catégories) là où le sac n'en porte qu'une. Trois porteurs
   pour un mécanisme : il descend, et il prend un nom NEUTRE.
   ⭐ `sac-roue` disait l'écran qui l'avait portée la première ; `tambour` dit ce que c'est.

   ⚖️ CE QU'IL PORTE, ET CE QU'IL LAISSE À L'APPELANT :
     · à lui  — le ruban qui glisse, le marquage du cran dominant, le placement en tuiles
                (fractionnaire), l'aimantation au tap, la traduction rang ↔ cran ;
     · à vous — ce qu'un cran EST (son nœud, son libellé, ses attributs, son rôle ARIA), la
                fenêtre qui le clippe, et la feuille qui les habille.
   ⛔ Il n'ajoute aucune classe : l'appelant lui donne des nœuds déjà vêtus. Un module qui
   choisirait les classes déciderait de la peau de trois écrans à leur place. */

/** Décore une fenêtre de roue avec le mécanisme du tambour.
 *
 *  @param {object} o
 *  @param {HTMLElement} o.roue        la FENÊTRE — clippée, c'est elle qui défile.
 *  @param {HTMLElement} o.ruban       ce qui GLISSE dedans. Deux nœuds parce que deux rôles.
 *  @param {HTMLElement[]} o.crans     les crans, déjà fabriqués et vêtus par l'appelant.
 *  @param {number} o.actif            le rang du cran sous le viseur.
 *  @param {number} o.pas              la cote d'un cran, viseur compris (`ROUE.pas`).
 *  @param {HTMLElement} [o.loupe]     le halo fixe, s'il y en a un — il prend le GENRE du cran.
 *  @returns {HTMLElement} la roue, décorée de `placer` · `marquer` · `vise` · `rang` · `section`.
 *
 *  🔴 LE RUBAN NE BOUCLE PAS — Eric, 2026-09-19 : *« que ça tourne à l'infini n'aide pas ;
 *  autorise l'absence de tuiles à droite et à gauche »*. ⛔ Ce module ne peint donc la liste
 *  qu'UNE fois. Un anneau n'a pas de bout, donc il ne peut dire ni « tu es au début » ni « tu
 *  es à la fin » — et c'est exactement ce qu'Eric veut voir : du VIDE au bout de la liste.
 *  ⭐ C'est aussi ce que la roue actuelle de Wares ne fait pas : elle porte DOUZE copies de
 *  chaque cran dans le DOM. Elles disparaissent en passant par ici. */
export function monterLeTambour(o) {
  const roue = o.roue;
  const ruban = o.ruban;
  const crans = o.crans || [];
  const pas = o.pas;
  const n = crans.length;
  const actif = n ? Math.max(0, Math.min(o.actif | 0, n - 1)) : 0;

  for (const cran of crans) ruban.append(cran);

  /* ⭐ LA TRADUCTION SORT AVEC LA ROUE, dans les DEUX sens. ⛔ La recopier chez l'appelant
     en ferait une seconde vérité, et un jour un cran de service (un `+`, un `blank`) la
     décalerait d'un rang d'un seul côté. Ici elle est l'identité ; elle ne le restera
     peut-être pas, et c'est précisément pourquoi elle est nommée. */
  const rang = (i) => i;
  const section = (k) => k;
  const vise = rang(actif);
  roue.dataset.vise = String(vise);

  let marque = ruban.children[vise] || null;

  /* ⚖️ LE HALO RESTE CENTRÉ — Eric : *« le halo doit rester centré, les items défilent
     dessous »*. ⛔ Il ne voyage donc PAS avec le cran : c'est un cadre fixe, et les tuiles
     passent dessous. ⭐ Mais il prend le GENRE de ce qu'il cadre — la règle des trois
     liserés du 19/09 — et ce genre est une donnée de l'appelant (`data-lieu`), pas d'ici. */
  function habillerLaLoupe(item) {
    if (!o.loupe) return;
    const lieu = item && item.dataset ? item.dataset.lieu : undefined;
    if (lieu) o.loupe.dataset.lieu = lieu;
    else delete o.loupe.dataset.lieu;
  }

  /* ⭐ MARQUER, C'EST ÉTEINDRE UN SEUL NŒUD ET EN ALLUMER UN — ⛔ pas parcourir le ruban.
     📏 L'écriture d'avant posait l'attribut sur LES QUINZE tuiles à chaque image, donc quinze
     recalculs de style sur la seule surface qui doit rester fluide, et le prix montait avec
     le contenu. ⭐ Ici deux écritures, quel que soit le nombre de crans. */
  const marquer = (k) => {
    if (marque) marque.dataset.dominant = "non";
    marque = ruban.children[k] || null;
    if (marque) marque.dataset.dominant = "oui";
    habillerLaLoupe(marque);
  };
  habillerLaLoupe(ruban.children[vise]);

  /* ⚖️ TAPER UN CRAN NE CHOISIT RIEN — la loi du catalogue (II.3) : il AIMANTE, et c'est le
     viseur qui choisit. ⭐ Le surligné et le choisi sont ainsi le même nombre PAR
     CONSTRUCTION, jamais deux chemins qui doivent rester d'accord.
     🔴 ET CE TAP AVAIT DÉJÀ DISPARU UNE FOIS, dans la chirurgie du 19/09 : il appelait un
     `viser()` qu'on venait de supprimer, et aucun garde d'écran ne l'a vu — c'est celui des
     ORPHELINS qui l'a attrapé. Un tap de tuile rendait un `ReferenceError` au joueur. */
  const viser = (i) => {
    const x = pas * rang(i);
    if (typeof roue.scrollTo === "function") roue.scrollTo({ left: x, behavior: "smooth" });
    else roue.scrollLeft = x;
  };
  for (let i = 0; i < n; i += 1) {
    /* ⛔ un cran sans écouteur n'est pas un oubli de l'appelant : certains crans sont des
       champs de saisie, et taper dedans ne doit pas aimanter. Le module ne les distingue
       pas — il arme ce qui accepte un écouteur, et l'appelant marque le reste. */
    if (crans[i].dataset && crans[i].dataset.inerte === "oui") continue;
    crans[i].addEventListener("click", () => viser(i));
  }

  /* 📌 POSER LE RUBAN À UNE POSITION EN TUILES — gardé pour le banc et les gardes.
     ⭐ `scrollLeft`, ⛔ PAS UN `translate` : écrire une transformation demanderait un style
     EN LIGNE, que le garde des styles interdit dans tout `ui/`. Un défilement s'écrit sans
     toucher au style.
     📐 `k` peut être FRACTIONNAIRE : à mi-chemin entre deux dalles, le ruban est à mi-chemin
     entre deux tuiles. C'est ça, *« je vois les deux défiler en même temps »*. */
  roue.placer = (k) => {
    roue.scrollLeft = pas * k;
    marquer(Math.round(k));
  };
  roue.rang = rang;
  roue.section = section;
  roue.marquer = marquer;
  roue.vise = vise;
  roue.viser = viser;
  return roue;
}
