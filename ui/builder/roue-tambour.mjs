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

  /* 🔴 DEUX CALES, ⛔ PLUS UN `padding` — ET C'EST UNE MESURE, PAS UN GOÛT. Eric, 20/09 :
     *« il faut que tu autorises les espaces vides à droite et à gauche des tokens »*.
     📏 Le ruban portait `padding-inline: (piste − tuile) / 2` — 137 de chaque côté — et ça ne
     marchait PAS : dans un défileur, le `padding-inline-end` d'un enfant `flex` n'entre pas
     dans le `scrollWidth`. Relevé au navigateur : piste 331, centre 166, et le PREMIER cran
     avait son centre à **226** (60 trop à droite) tandis que le DERNIER ne descendait jamais
     sous 487. Aucun des deux ne pouvait atteindre le viseur.
     ⛔ ET LE SAC A LE MÊME DÉFAUT, mesuré dans la même minute : 1er à 226, dernier à 321 au
     défilement maximal. Ce n'est donc pas une régression de Wares — c'est un défaut PARTAGÉ,
     que six catégories rendent visible là où cinq sections le cachaient.
     ⭐ UNE CALE EST UN ÉLÉMENT : elle compte toujours, dans tous les moteurs. Et elle est
     `aria-hidden` — un vide qui se lit à voix haute est un vide qui ment. */
  const cale = () => {
    const c = document.createElement("span");
    c.className = "roue-cale";
    c.setAttribute("aria-hidden", "true");
    return c;
  };
  ruban.append(cale());
  for (const cran of crans) ruban.append(cran);
  ruban.append(cale());

  /* ⭐ LA TRADUCTION SORT AVEC LA ROUE, dans les DEUX sens. ⛔ La recopier chez l'appelant
     en ferait une seconde vérité, et un jour un cran de service (un `+`, un `blank`) la
     décalerait d'un rang d'un seul côté. Ici elle est l'identité ; elle ne le restera
     peut-être pas, et c'est précisément pourquoi elle est nommée. */
  const rang = (i) => i;
  const section = (k) => k;
  const vise = rang(actif);
  roue.dataset.vise = String(vise);

  /* 🔴 LE MARQUAGE DE DÉPART APPARTIENT AU MODULE, ⛔ PLUS À L'APPELANT — trouvé par le garde 2
     du tambour, qui a rougi sur un module que je croyais fini. Le sac marquait son cran dominant
     LUI-MÊME, dans sa boucle (`t.dataset.dominant = souslaLoupe ? "oui" : "non"`), et le module
     ne faisait que déplacer la marque ensuite. ⭐ Un organe que CHAQUE écran doit se rappeler de
     poser sera oublié par celui qui l'oublie : Wares en monte deux de plus, et rien ne le lui
     aurait rappelé. Le module marque donc d'abord, et l'appelant peut le redire — c'est la même
     valeur, et l'idempotence est ce qui rend le déménagement sans risque. */
  /* 🔴 LE MARQUAGE LIT LE TABLEAU DES CRANS, ⛔ PLUS `ruban.children[k]` — les deux cales sont
     des enfants, donc l'index du DOM n'est plus celui du cran. ⭐ Et c'est plus juste de toute
     façon : le module reçoit ses crans, il n'a jamais eu besoin de les retrouver par position
     dans un parent qu'il ne possède pas. Un index qui traverse une frontière est un index qui
     se décale au premier voisin. */
  let marque = null;

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
    marque = crans[k] || null;
    if (marque) marque.dataset.dominant = "oui";
    habillerLaLoupe(marque);
  };
  marquer(vise);   /* ⭐ et c'est LUI qui habille la loupe, une fois, par le même chemin */

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
  /* 🔴 NOS PROPRES ÉCRITURES SE MARQUENT, sans quoi elles se relisent comme un GESTE. Poser le
     ruban déclenche un événement `scroll` ; si l'appelant l'écoute pour savoir ce que le
     joueur a choisi, il entend sa propre voix et repeint en boucle. ⭐ Le sac le dit déjà :
     *« nos écritures de scrollLeft sont marquées, sans quoi l'aval se révélerait tout seul »*. */
  let programmatique = false;
  roue.estProgrammatique = () => programmatique;
  roue.placer = (k) => {
    programmatique = true;
    roue.scrollLeft = pas * k;
    marquer(Math.round(k));
    /* ⛔ ON NE REND LA MAIN QU'APRÈS L'IMAGE : l'événement `scroll` arrive APRÈS l'écriture,
       donc lever le drapeau tout de suite le lèverait avant qu'on l'ait lu. */
    (globalThis.requestAnimationFrame || setTimeout)(() => { programmatique = false; }, 0);
  };
  /* ⭐ ET LE PLACEMENT DE DÉPART SE PUBLIE, ⛔ IL NE SE FAIT PAS ICI. Un nœud qui n'est pas
     encore dans le document n'a ni `scrollWidth` ni `scrollLeft` utilisable : l'appel réussit
     et ne fait RIEN, en silence. C'est le piège que `poserLesDalles` règle pour le sac, et il
     se règle au même endroit — après que l'écran est posé.
     🔴 SANS LUI, LA TUILE CHOISIE RESSAUTE À L'ORIGINE : Eric, 20/09 — *« la tuile ne reste
     pas, elle ressaute à l'origine, pas normal. Problème avec le magnet ? »*. 📏 Mesuré : après
     un repeint, `data-vise` valait bien 2 et `scrollLeft` valait 0. Le marquage suivait le
     choix, le ruban non — et `scroll-snap: mandatory` ramenait au premier cran. */
  roue.poser = () => {
    if (roue.isConnected === false) return false;
    roue.placer(vise);
    return true;
  };
  roue.rang = rang;
  roue.section = section;
  roue.marquer = marquer;
  roue.vise = vise;
  roue.viser = viser;
  return roue;
}
