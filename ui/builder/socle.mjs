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

/* ⭐ LA SEULE DÉPENDANCE DU SOCLE, ET ELLE N'AJOUTE PAS UNE CINQUIÈME FONCTION
   ICI : `facteurZoom` appartient à l'échelle, qui la possède (lot 85). Le socle
   la CONSOMME pour ramener un écart peint en unités de mise en page — voir sa
   raison dans `keepInView`. */
import { facteurZoom } from "./echelle.mjs?v=454";

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
  /* 🔴 LES RECTANGLES SONT EN PIXELS PEINTS, `scrollTop` EST EN BLG — et sous
     `zoom` les deux ne sont plus la même chose. Mesuré : un bloc de 200 blg
     rend `rect.width` 400 au cran 2, `offsetWidth` 200. Ajouter un écart de
     rectangle à `scrollTop` faisait donc défiler DEUX FOIS TROP LOIN au cran 2,
     trois fois au cran 3 — sur le rail de Species comme sur la ceinture.
     ⛔ Ça ne se voyait pas au cran 1, et aucun test ne l'aurait dit : c'est
     exactement la famille de défaut que le lot 85 a passé sa journée à
     débusquer. On divise donc chaque écart par le zoom effectif, mesuré sur le
     champ lui-même (`facteurZoom`). */
  const z = facteurZoom(scroller) || 1;
  const dY = (a, b) => (a - b) / z;
  const dX = (a, b) => (a - b) / z;
  /* ⚠️ `instant`, TOUJOURS, ET C'EST MESURÉ. `scroll-behavior: smooth` en CSS
     s'applique aussi aux écritures de script : arriver sur Class devant la
     classe déjà choisie (la douzième) déclenchait une DESCENTE ANIMÉE DE
     7 457 PIXELS, vue à l'œil dans le navigateur. Cette fonction n'est jamais
     un geste du joueur — c'est un indicateur qui rattrape ce qu'il désigne.
     Un indicateur ne voyage pas. Les chevrons, eux, sont un geste : ils
     laissent le CSS décider (`mountChevrons`, plus bas). */
  const to = (patch) => scroller.scrollTo({ ...patch, behavior: "instant" });
  if (axis === "y-start") {
    to({ top: scroller.scrollTop + dY(item.top, box.top) });
    return;
  }
  if (axis === "x") {
    /* Centré : une molette montre ses voisins des deux côtés, c'est ce qui
       dit qu'il y a du hors-champ (bible §4). */
    to({ left: scroller.scrollLeft + dX(item.left + item.width / 2, box.left + box.width / 2) });
    return;
  }
  /* Vertical : « au plus près », jamais centré — un rail de 4 crans qui
     recentre à chaque cran saute sans arrêt. On ne bouge que si l'élément
     sort. */
  if (item.top < box.top) to({ top: scroller.scrollTop - dY(box.top, item.top) });
  else if (item.bottom > box.bottom) to({ top: scroller.scrollTop + dY(item.bottom, box.bottom) });
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

   LE MINUTEUR VIT ICI, dans la fermeture, posé UNE FOIS avec les écouteurs —
   c'est la troisième des cinq choses que `innerHTML = ""` détruisait. Il ne
   peut plus être détruit par un redessin : rien ne remplace ce nœud-là.

   ══ LOT 70 — LA VÉRITÉ GÉOMÉTRIQUE, MESURÉE À 1440 × 900 ═══════════════
   Trois mensonges du montage d'avant, tous vus à l'écran :
     · les chevrons FLASHAIENT sur des écrans qui ne défilent pas (Universe
       en Large : scrollHeight 800 == clientHeight 800) — une promesse de
       défilement là où il n'y en a pas ;
     · une fois effacés, ils étaient IRRÉCUPÉRABLES à la souris : les
       boutons passent en `pointer-events: none`, et seul un geste de
       molette les réveille — cliquer, attendre 1 s, voir le contrôle
       mourir SOUS le curseur ;
     · une direction impossible restait cliquable en apparence (∨ au pied
       de Wizard, où chaque arrivée sur Class se pose).
   Ce montage écrit donc la géométrie en ATTRIBUTS — jamais un nœud :
     · `host[data-visible]`  — le minuteur B0.22b/c, inchangé sur le fond ;
     · `scroller[data-more]` — « il reste du contenu plus bas ». C'est
       l'interrupteur de l'AMORCE de la fiche (l'affordance bible §4, la
       même famille que le fondu des molettes) : le CSS la consomme via
       `--stage-amorce`, éteinte à l'étroit, allumée en Large ;
     · `disabled` sur les deux boutons — un bout de course n'est pas une
       direction. (La molette, elle, MASQUE en bout de course — B0.3 — mais
       retirer un bouton d'une pile flottante ferait sauter l'autre ; ici
       la géométrie tient, l'encre s'éteint.)

   ⚠️ LA SOURIS POSÉE N'EST PAS DU REPOS (B0.22b, lu pour le desktop) :
   `pointerover`/`pointerout` de type « mouse » retiennent le minuteur tant
   que le curseur est sur un chevron — sans ça, le contrôle s'efface sous
   la main qui allait recliquer (mesuré, c'était le « morts à 1440 »). Un
   `pointerover` de type « touch » est ignoré : à 360, rien ne change. Le
   focus clavier retient pareil — un contrôle qu'on atteint au Tab doit se
   voir.

   ⚠️ RÉSERVE DE L'ARCHITECTE (B0.22, découvrabilité) : un contrôle qui
   s'efface n'est pas découvrable. L'ancien montage y répondait par UN
   `show()` au montage — une seule fois PAR SESSION, sur un écran (Universe)
   qui ne défile même pas en Large. La réponse vit désormais dans
   `settle(true)`, que `openSurface` appelle : CHAQUE nouvelle surface qui
   défile s'annonce une seconde — le comportement d'un indicateur iOS à
   l'ouverture d'une vue, la comparaison d'Eric elle-même. */
/* ⭐ 1000 → 600 ms — Eric, 2026-08-15 : « les petits chevrons QUI S'EFFACENT
   VITE ». Le repos d'une seconde était pensé pour deux pastilles de 44 px
   qu'on pouvait vouloir viser ; une barrette de 36 × 14 qui ne double qu'un
   geste de défilement n'a pas à s'attarder. Elle dit « il y a une suite »,
   puis elle sort du chemin. */
export const CHEVRON_REST_MS = 600;

export function mountChevrons(host, scroller) {
  let timer = null;
  let survole = false;  // un pointeur de SOURIS est posé sur un chevron
  let focalise = false; // un chevron a le focus clavier
  const retenu = () => survole || focalise;

  /* Les deux boutons, dans l'ordre où le cadre les pose : monter, puis
     descendre. Capturés UNE fois — le cadre ne les remplace jamais
     (SOCLE.md, « ce qui ne se redessine jamais »). Un hôte sans boutons
     reste légal : la tenue de `data-more` ne dépend pas d'eux. */
  const [monte, descend] = host.querySelectorAll(".stage-chevron");

  /* Le mou : ce que le champ ne montre pas. Tolérance de 1 px — les
     positions fractionnaires des écrans denses font mentir l'égalité
     stricte. */
  const mou = () => scroller.scrollHeight - scroller.clientHeight;
  const peutDefiler = () => mou() > 1;

  /* LA LECTURE : géométrie → attributs, et rien d'autre. C'est la ligne du
     socle (« on écrit l'état, on touche un attribut, on s'arrête là »). */
  const relire = () => {
    const defilable = peutDefiler();
    scroller.dataset.more = String(defilable && scroller.scrollTop < mou() - 1);
    if (monte) monte.disabled = !defilable || scroller.scrollTop < 1;
    if (descend) descend.disabled = !defilable || scroller.scrollTop >= mou() - 1;
    return defilable;
  };

  const cacher = () => { host.dataset.visible = "false"; timer = null; };
  const armer = () => {
    if (timer !== null) { clearTimeout(timer); timer = null; }
    if (!retenu()) timer = setTimeout(cacher, CHEVRON_REST_MS);
  };
  const show = () => {
    host.dataset.visible = "true";
    armer();
  };

  /* `show()` à CHAQUE événement — le repos se mesure depuis le DERNIER
     geste ; la géométrie, elle, se relit UNE image par rafale, jamais un
     pixel (le même étranglement que `watchSnap`, même raison B5.2d). */
  let pending = false;
  scroller.addEventListener("scroll", () => {
    show();
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; relire(); });
  }, { passive: true });

  /* `pointerover`/`out` BULLENT depuis les boutons (`pointerenter` ne bulle
     pas) — l'hôte est en `pointer-events: none`, seuls les boutons visibles
     reçoivent le pointeur : c'est aussi ce qui rend à la molette de souris
     et au balayage la bande que l'hôte mangeait (mesurée : 60 × 112 px posés
     sur la fiche, morts au geste). */
  host.addEventListener("pointerover", (event) => {
    if (event.pointerType !== "mouse") return;
    survole = true;
    if (timer !== null) { clearTimeout(timer); timer = null; }
  });
  host.addEventListener("pointerout", (event) => {
    if (event.pointerType !== "mouse") return;
    survole = false;
    if (host.dataset.visible === "true") armer();
  });
  host.addEventListener("focusin", (event) => {
    /* SEUL LE FOCUS CLAVIER RETIENT — trouvé en cliquant pour de vrai :
       un clic (et un tap, sur Chrome) pose AUSSI le focus sur le bouton,
       et `focalise` gelait alors les chevrons à l'écran pour toujours —
       B0.22b mort après le premier usage, à 360 comme à 1440, sous une
       suite verte. `:focus-visible` départage la main du clavier ; une
       cible sans `matches` (le stub des tests) compte clavier — c'est le
       sens du garde C ter. */
    const clavier = !event.target || typeof event.target.matches !== "function"
      || event.target.matches(":focus-visible");
    if (!clavier) return;
    focalise = true;
    if (peutDefiler()) show();
  });
  host.addEventListener("focusout", () => {
    focalise = false;
    if (host.dataset.visible === "true") armer();
  });

  /* Au montage : cachés, et la géométrie dit vrai (la scène est encore
     vide — rien à défiler, rien à promettre). L'annonce viendra de
     `settle(true)`, pas d'un `show()` aveugle. */
  host.dataset.visible = "false";
  relire();

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
    },

    /* LE RATTRAPAGE — même contrat que `watchSnap().settle()` : à appeler
       quand le CONTENU a changé sous les écouteurs (un remplacement n'émet
       aucun `scroll`). `refresh()` l'appelle nu — la géométrie se remet à
       jour, la visibilité ne bouge pas ; `openSurface(…)` l'appelle avec
       `annonce` — une surface NEUVE qui défile se montre une seconde
       (B0.22b), puis vit sa vie B0.22. Pas de défilement possible : tout
       s'éteint, minuteur compris — des chevrons sur un écran qui tient en
       entier sont un contrôle mort, mesuré tel. */
    settle: (annonce = false) => {
      const defilable = relire();
      if (!defilable) {
        if (timer !== null) { clearTimeout(timer); timer = null; }
        cacher();
        return;
      }
      if (annonce) show();
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
