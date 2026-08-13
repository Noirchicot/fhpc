/* ══ LE SOCLE DE RENDU — lot 58 ═══════════════════════════════════════════
   Quatre fonctions. Pas cinq. Les RÈGLES qui les entourent sont dans
   `ui/builder/SOCLE.md`, à côté de ce fichier — lis-le avant d'ajouter quoi
   que ce soit ici.

   ── CE QUE CE FICHIER EXISTE POUR RÉPARER (mesuré, ERGONOMIE-BUILDER.md §0)
   `shell.mjs` faisait `app.innerHTML = ""` à chaque clic. Toute la page était
   détruite et reconstruite, et RIEN ne conservait la position de défilement —
   `grep -rn "scrollTop\|scrollY\|scrollTo" ui/` ne trouvait AUCUNE sauvegarde,
   seulement deux `scrollIntoView` qui DÉPLAÇAIENT la page. Sur un écran de
   16 513 px, ça se voyait à chaque clic.

   ⛔ CE N'EST PAS UN FRAMEWORK, et ça ne doit jamais le devenir (loi Q3 du
   chantier : « ESM natif, zéro build, zéro framework »). Il n'y a ici ni
   composant, ni cycle de vie, ni diff, ni réactivité. Quatre fonctions qui
   touchent au DÉFILEMENT — la seule chose que le DOM natif ne conserve pas
   tout seul quand on remplace du contenu.

   📌 LE PATRON EST CELUI DE `markPressed()` (lot 57, carnet.mjs) : une
   brique, UN écrivain, UN garde. Ici : `swapContent` est le SEUL endroit du
   dépôt qui remplace le contenu d'un nœud, et `tests/socle.test.mjs` le
   prouve — sur une source inventée d'abord (l'attaque), sur le vrai arbre
   ensuite. */

/* ── 1. LE REMPLAÇANT DE CONTENU ───────────────────────────────────────
   La seule fonction du dépôt qui vide et regarnit un nœud.

   ⭐ POURQUOI ELLE EST NÉCESSAIRE, ET CE QU'ELLE NE FAIT PAS : remplacer les
   enfants d'un conteneur qui défile met sa hauteur à zéro l'espace d'un
   instant, et le navigateur RABAT `scrollTop` à 0 — définitivement, même
   quand le contenu suivant est aussi haut. Ce n'est pas un bogue du
   navigateur, c'est la seule chose qu'il puisse faire d'une position qui ne
   désigne plus rien. La conserver est donc un geste EXPLICITE, à faire à
   l'endroit exact du remplacement ; nulle part ailleurs on ne saura plus
   quelle était la position d'avant.

   ⚠️ Elle ne PROMET PAS de retrouver la position : si le nouveau contenu est
   plus court, le navigateur rabat, et c'est correct — on ne peut pas défiler
   vers un endroit qui n'existe plus. Elle promet de ne pas la JETER. */
export function swapContent(node, children) {
  const top = node.scrollTop;
  const left = node.scrollLeft;
  node.replaceChildren(...children);
  /* ⚠️ `instant`, ET IL FAUT LE DIRE : `scroll-behavior: smooth` en CSS
     s'applique AUSSI aux écritures de script. Sans ce mot, restaurer la
     position deviendrait un VOYAGE ANIMÉ à chaque clic — le retour du défaut
     qu'on répare, sous un autre visage. Restaurer n'est pas se déplacer. */
  node.scrollTo({ top, left, behavior: "instant" });
}

/* ── 2. AMENER UN ENFANT DANS LE CHAMP — DE SON DÉFILEMENT, ET DE LUI SEUL
   `scrollIntoView` REMONTE TOUTE LA CHAÎNE DES ANCÊTRES. C'est la seconde
   moitié du défaut §0 : `recenterBelt()` voulait recentrer la ceinture et
   déplaçait la PAGE, par-dessus la position déjà perdue par le re-render.
   Mesuré aussi sur `skills-step.mjs:527`, dont le clic de catégorie
   catapultait de 6 111 px (défaut A-1.3).

   Cette fonction ne touche qu'UN `scrollTop`/`scrollLeft` : celui du
   conteneur qu'on lui nomme. Elle ne calcule rien d'autre — `offsetTop`
   remonte au premier parent POSITIONNÉ, pas au conteneur qui défile, donc
   la mesure passe par les rectangles, comme le navigateur les donne.

   `axis` vaut "y", "x" ou "y-start". Rien d'autre :
     · "x" — la molette : CENTRÉ, elle doit montrer ses voisins ;
     · "y" — le rail : AU PLUS PRÈS, on ne bouge que si le cran sort ;
     · "y-start" — un POINT D'AIMANTATION : le haut de l'enfant se pose sur
       le haut du champ. C'est ce que « s'aimanter sur une fiche » veut dire
       (II.1), et c'est le seul cas où l'on déplace le champ même si
       l'enfant y était déjà visible. */
export function keepInView(scroller, child, axis) {
  if (!scroller || !child || typeof child.getBoundingClientRect !== "function") return;
  const box = scroller.getBoundingClientRect();
  const item = child.getBoundingClientRect();
  /* ⚠️ `instant`, TOUJOURS, ET C'EST MESURÉ. `scroll-behavior: smooth` en CSS
     s'applique aussi aux écritures de script : arriver sur Class devant la
     classe déjà choisie (la douzième) déclenchait une DESCENTE ANIMÉE DE
     7 457 PIXELS, vue à l'œil dans le navigateur. Cette fonction n'est jamais
     un geste du joueur — c'est un indicateur qui rattrape ce qu'il désigne.
     Un indicateur ne voyage pas. Les chevrons, eux, sont un geste : ils
     laissent le CSS décider (`mountChevrons`, plus bas). */
  const to = (patch) => scroller.scrollTo({ ...patch, behavior: "instant" });
  if (axis === "y-start") {
    to({ top: scroller.scrollTop + (item.top - box.top) });
    return;
  }
  if (axis === "x") {
    /* Centré : une molette montre ses voisins des deux côtés, c'est ce qui
       dit qu'il y a du hors-champ (bible §4). */
    to({ left: scroller.scrollLeft + (item.left + item.width / 2) - (box.left + box.width / 2) });
    return;
  }
  /* Vertical : « au plus près », jamais centré — un rail de 4 crans qui
     recentre à chaque cran saute sans arrêt. On ne bouge que si l'élément
     sort. */
  if (item.top < box.top) to({ top: scroller.scrollTop - (box.top - item.top) });
  else if (item.bottom > box.bottom) to({ top: scroller.scrollTop + (item.bottom - box.bottom) });
}

/* ── 3. LE POINT D'AIMANTATION — QUI EST LA FICHE COURANTE ─────────────
   `scroll-snap` (II.1) fait que le défilement se POSE sur une fiche : c'est
   elle qui est choisie, il n'existe aucun geste de sélection. Le scrollspy
   n'est donc pas un repère, c'est LE SÉLECTEUR (II.3) — et l'icône
   surlignée et la fiche validée sont la même chose par construction, parce
   qu'elles lisent le même nombre.

   ⭐ LA DÉCISION EST UNE FONCTION PURE, À PART, et c'est délibéré : la
   géométrie n'existe pas dans `tests/dom-stub.mjs` (aucune mise en page),
   donc ce qui est testable est CE QU'ON FAIT des mesures, pas les mesures.
   `nearestIndex` est testée ; `watchSnap` se regarde dans le navigateur —
   c'est la loi du dépôt (« on teste la fonction, pas la page »). */
export function nearestIndex(offsets, target) {
  let best = -1;
  let bestGap = Infinity;
  offsets.forEach((offset, index) => {
    const gap = Math.abs(offset - target);
    /* `<` STRICT : à égalité parfaite, le PREMIER gagne. Sans ça, deux
       fiches à distance égale (le milieu exact d'un geste) feraient
       osciller le rail entre deux crans à chaque image. */
    if (gap < bestGap) { bestGap = gap; best = index; }
  });
  return best;
}

/** Pose UN écouteur de défilement sur `scroller`, une fois pour toutes, et
 *  appelle `onSettle(index, element)` quand le cran change — jamais à chaque
 *  pixel.
 *
 *  ⚠️ IL NE RETIENT AUCUN ÉLÉMENT. Les fiches sont relues à chaque lecture
 *  (`[data-snap]`), donc un remplacement de contenu ne le casse pas : c'est
 *  exactement le piège mesuré au §3bis d'ERGONOMIE-BUILDER.md, où une mesure
 *  qui gardait une référence aux boutons a planté quand `innerHTML = ""` les
 *  a détruits. Un observateur qui s'abonne élément par élément
 *  (`IntersectionObserver`) aurait ce problème ; celui-ci ne l'a pas par
 *  construction, et c'est pour ça qu'il est écrit comme ça. */
export function watchSnap(scroller, onSettle) {
  let current = -1;
  let pending = false;

  const read = () => {
    pending = false;
    const items = scroller.querySelectorAll("[data-snap]");
    if (items.length === 0) { current = -1; return; }
    const top = scroller.getBoundingClientRect().top;
    const index = nearestIndex([...items].map((item) => item.getBoundingClientRect().top), top);
    if (index === current || index < 0) return;
    current = index;
    onSettle(index, items[index]);
  };

  scroller.addEventListener("scroll", () => {
    /* Une image, pas un pixel : le navigateur émet `scroll` des dizaines de
       fois par geste, et relire douze rectangles à chaque fois ferait
       exactement le « ça rame sur mobile » qu'Eric nomme en B5.2d. */
    if (pending) return;
    pending = true;
    requestAnimationFrame(read);
  }, { passive: true });

  /* `settle()` : à appeler quand le CONTENU a changé sous l'écouteur (la
     seule chose que l'écouteur ne peut pas voir tout seul — un
     remplacement n'émet aucun `scroll`). */
  return { settle: () => { current = -1; read(); }, index: () => current };
}

/* ── 4. LES CHEVRONS FLOTTANTS (I.7 / B0.22) ───────────────────────────
   « D'expérience les chevrons sont mieux s'ils sont à l'extrême droite de
   l'écran. Ils disparaissent au bout d'une seconde et réapparaissent dès
   qu'on scrolle. » (Eric, 2026-08-14)

   LE MINUTEUR VIT ICI, dans la fermeture, posé UNE FOIS avec l'écouteur —
   c'est la troisième des cinq choses que `innerHTML = ""` détruisait. Il ne
   peut plus être détruit par un redessin : rien ne remplace ce nœud-là.

   ⚠️ RÉSERVE DE L'ARCHITECTE, NON TRANCHÉE PAR ERIC et reportée telle quelle
   d'ERGONOMIE-BUILDER.md (B0.22) : un contrôle qui s'efface n'est pas
   DÉCOUVRABLE — au premier écran, un joueur qui ne défile pas ne saura pas
   qu'il existe. C'est pourquoi ils commencent VISIBLES (voir `mount`), et ne
   s'effacent qu'après le premier repos : le cas du premier usage est ainsi
   celui qui les montre, sans rien changer au comportement qu'Eric décrit. */
export const CHEVRON_REST_MS = 1000;

export function mountChevrons(host, scroller) {
  let timer = null;

  const show = () => {
    host.dataset.visible = "true";
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => { host.dataset.visible = "false"; timer = null; }, CHEVRON_REST_MS);
  };

  scroller.addEventListener("scroll", show, { passive: true });
  show(); // ⭐ visibles à l'arrivée — voir la réserve ci-dessus

  return {
    /* Un cran = une hauteur de fiche : le défilement est aimanté (II.1),
       donc « la suivante » et « un écran plus bas » sont la même chose.
       ⭐ AUCUN `behavior` DEMANDÉ ICI, ET C'EST DÉLIBÉRÉ : c'est un GESTE du
       joueur, donc il a le droit de s'animer — et `scroll-behavior` en CSS
       tranche pour lui, y compris sous `prefers-reduced-motion`, qui le
       repasse à `auto`. Écrire `"smooth"` en dur ici passerait par-dessus ce
       réglage système. */
    step: (direction) => {
      scroller.scrollBy({ top: direction * scroller.clientHeight });
      show();
    }
  };
}

/* ── LE CONTENEUR QUI DÉFILE, TROUVÉ PAR SON MARQUEUR ──────────────────
   Un écran profond (Compétences) doit pouvoir amener une de ses sections
   dans le champ sans connaître la coquille. Il remonte donc jusqu'au
   marqueur `data-scroller`, posé UNE FOIS par `shell.mjs` sur la fiche.

   ⛔ Pas de `getComputedStyle` pour deviner qui défile : deviner marcherait
   jusqu'au jour où un `overflow: hidden` intermédiaire mentirait. Le
   marqueur est une déclaration, pas une inférence. */
export function scrollParent(node) {
  let current = node && node.parentNode;
  while (current) {
    if (current.dataset && current.dataset.scroller) return current;
    current = current.parentNode;
  }
  return null;
}
