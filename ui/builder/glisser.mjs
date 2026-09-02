/* ══ L'ORGANE DE GLISSER-DÉPOSER — lot 79, étape 2 ═══════════════════════
   📐 Croquis C (Wizard, 2ᵉ écran), et la consigne d'Eric du 2026-08-16 :
   *« on va tester le drag on verra »*, puis *« le tap sera peut-être plus
   approprié sur desktop, on peut construire les 2 en même temps »*.

   ⭐ DEUX GESTES, UNE SEULE SÉLECTION. Le même jeton se **tape** (il tombe
   dans le premier créneau libre) ou se **glisse** (il tombe dans le créneau
   visé). Ce n'est pas une redondance : le glisser désigne SA case, le tap
   laisse l'écran choisir — et sur un SE, viser une case de 44 px avec le
   pouce coûte plus cher que sur un trackpad.

   ⛔ PAS L'API HTML5 (`draggable`, `dragstart`), ET C'EST LA RAISON D'ÊTRE DE
   CE FICHIER : elle ne fonctionne pas sur Safari iOS, c'est-à-dire sur
   l'appareil où Eric teste. Tout passe par les ÉVÉNEMENTS POINTEUR, qui
   couvrent souris, doigt et stylet du même code.

   🔴 CE QUI DÉPARTAGE LE TAP DU GLISSER EST UNE DISTANCE, PAS UNE CIBLE.
   Le croquis pose les deux gestes sur le MÊME jeton (*« Tap on cantrip for
   info. Drag and drop to select »*) : on ne peut donc pas les séparer par
   l'endroit touché. Sous `SEUIL_GLISSER` px de déplacement, c'est un tap ;
   au-delà, un glisser. Un doigt n'est jamais parfaitement immobile — 6 px
   est le seuil qui laisse passer un tap tremblé sans déclencher de fantôme.

   ⛔ AUCUNE RÈGLE DE JEU ICI, comme partout : ce fichier reçoit des créneaux
   déjà calculés par le carnet et rend des actions. Il ne sait pas ce qu'est
   une compétence. */

import { pageDeListe } from "./normes.mjs?v=433";
/* Le mot d'un refus vient de LA table, jamais d'une reformulation locale. */
import { motDuVerrou as refusalWord } from "./skills-step.mjs?v=433";
import { swapContent } from "./socle.mjs?v=433";
/* Le facteur du zoom, mesuré sur `.app` — le fantôme y est monté, donc son
   `translate` est peint à l'échelle et les coordonnées du doigt ne le sont
   pas. Voir `fantomeSuivre`. */
import { facteurZoomCourant } from "./echelle.mjs?v=433";

/* ══ OÙ EN EST CHAQUE VIVIER — la mémoire de page ════════════════════════
   🔴 ELLE EST AU MODULE, ET C'EST OBLIGÉ. `shell.mjs` répond à toute action
   par un `refresh()` qui reconstruit la carte entière : un numéro de page
   gardé dans la fermeture de `renderChoixGlisses` retomberait à zéro au
   premier sort posé. Le joueur serait renvoyé page 1 à chaque choix, sur la
   liste même où il en fait quinze.
   ⭐ MÊME PRÉCÉDENT QU'AU TAMBOUR (`positionDuTambour`, equipment-step), et
   même clef qu'ailleurs dans le dépôt : le CHEMIN du premier créneau
   (`class.prepared[0]`, `species.lineage`…). Deux viviers de deux écrans ne
   partagent jamais un chemin.
   ⛔ ET ELLE N'ENTRE PAS DANS LE DOCUMENT : une page regardée n'est pas une
   décision de personnage. Elle meurt avec l'onglet, comme la position du
   tambour. */
const pageDuVivier = new Map();

/* ══ 🔴 L'INCIDENT DU 22/08 — LA CAPTURE MANGEAIT LE DÉFILEMENT ══════════
   Eric, sur son iPhone, page rechargée : *« défilement vertical toujours
   bloqué »*. Une liste d'objets qui défile, dont chaque ligne est un jeton :
   le doigt ne pouvait plus la parcourir.

   🔴 LA CAUSE ÉTAIT ICI, ET ELLE NE SE VOYAIT PAS. `setPointerCapture` était
   pris dans le gestionnaire d'APPUI, sans condition — avant le seuil de 6 px,
   avant toute décision. Or capturer un pointeur sur iOS ANNULE le défilement
   natif pour ce geste : le navigateur rend le pointeur à l'élément et cesse de
   faire défiler. `touch-action: pan-y` n'avait jamais sa chance, quoi qu'en
   déclare la feuille.

   ⭐ LA LEÇON, ET ELLE EST DANS CE FICHIER DEPUIS LE DÉBUT : **deux mécanismes
   bloquaient le défilement, un seul avait été rendu conditionnel.** Le
   `preventDefault` de `retenir` ne mord qu'une fois le jeton soulevé, et son
   commentaire le dit en toutes lettres — *« tant que le jeton dort, le doigt
   défile »*. La capture, elle, mordait dès l'appui. On avait donc pensé à la
   moitié du problème, et écrit la moitié de la parade.

   📌 POURQUOI PERSONNE NE L'AVAIT VU : les cinq écrans qui emploient cet organe
   (Abilities, Concept, Class, Inheritance, Species) posent leurs jetons sur des
   surfaces QUI NE DÉFILENT PAS — elles assument `touch-action: none`. `R.list`
   est la première où il faut pouvoir faire les deux, et c'est elle qui a
   révélé un défaut vieux de trois lots.
   ⭐ LA RÈGLE QU'ON EN TIRE : tout ce qui prive le navigateur d'un geste doit
   être conditionné au moment où l'organe DÉCIDE, jamais au moment où il
   observe. Observer est gratuit ; décider ne l'est pas. */

const SEUIL_GLISSER = 6;

/* ══ 🧊 LE MAINTIEN A ÉTÉ RETIRÉ — Eric, 2026-08-20 ══════════════════════
   *« Le glisser partout ! »* · *« Il ne faut plus d'ascenseurs couplés avec
   des actions drag and drop. »*

   CE QUE C'ÉTAIT : dans la grille des sorts, le jeton portait
   `touch-action: pan-y` et ne se soulevait qu'après 350 ms d'appui immobile.
   Ce péage n'a JAMAIS eu d'autre cause que l'ascenseur de la grille : les
   quinze cases pavaient une fenêtre défilante, un `touch-action: none` l'aurait
   rendue indéfilable au doigt, donc il fallait départager les deux gestes par
   le TEMPS.

   ⭐ EN SUPPRIMANT L'ASCENSEUR, ON SUPPRIME LA CAUSE. La grille défile
   maintenant avec la page, comme tout le reste ; plus rien ne dispute le geste
   au glisser, donc plus rien à départager. Le jeton reprend
   `touch-action: none` et se soulève d'emblée — le MÊME geste que dans Species,
   ce qu'Eric demandait par « le glisser partout ».
   📌 Et le tap continue de poser dans le premier créneau libre : le chemin
   court n'a jamais dépendu du maintien. */

/* ══ L'ABRÉGÉ D'UNE CASE — Eric, 2026-08-19 ═══════════════════════════════
   *« Pour qu'un écran 360 puisse contenir 3 boutons en largeur. Si le mot est
   trop [long], on réduit la taille avec des abréviations. »* Et, la minute
   d'avant : *« si une manière d'écrire le texte stabilise sa forme, il faut la
   trouver. »* La réponse est donc dans le MOT, pas dans la mise en page : ni
   corps rapetissé, ni césure, ni rognage.

   📌 LE CALCUL EXISTAIT DÉJÀ, et Eric a dû me le rappeler — *« tout ce calcul
   avait été fait, tu dois avoir ces choix notés quelque part »*. Deux traces :
   · `shell.css`, lot 79 étape 4 : *« à 375 px, quatre créneaux en ligne font
     74 px chacun, où Prestidigitation ne tient À AUCUN CORPS »* ;
   · le chantier v1 (vault, `FHPCv1 dice tray`) : les outils sont abrégés par
     une **RÈGLE MÉCANIQUE, PAS UN CHAMP À REMPLIR**, et *« deux abréviations
     cassent »*.

   🔴 D'OÙ UNE RÈGLE, ET SURTOUT PAS UNE TABLE. Mon premier jet listait trois
   noms à la main — exactement le « champ à remplir » que la doctrine de la v1
   refuse : une liste se périme au premier sort ajouté, et personne ne sait
   qu'elle existe. La règle, elle, vaut pour ce qui n'est pas encore écrit.

   📏 LE SEUIL SE DÉDUIT DU CORPS — il n'est pas un nombre en soi. La case fait
   87 px, dont **77** pour le mot (mesuré : 87 − 8 de rembourrage − 2 de
   liseré). Le corps décide du reste.

   🔴 REDÉRIVÉ LE 2026-08-26, PARCE QUE LE CORPS A CHANGÉ. Eric a tranché le
   jeton à **T1** (*« 13 T1 on aura moins d'enmerdes on jugera apres coup »*).
   Le seuil de **10** ci-dessous avait été déduit de `--t2` — le laisser aurait
   été garder une conséquence après avoir retiré sa cause, et abréger
   « Prestidigitation » alors qu'il tient désormais ENTIER.

   ┌ mesuré au navigateur, dans la case réelle, sur les 77 px utiles ──────┐
   │ mot                    car.   à T2      à T1                          │
   │ Prestidigitation ....... 16   85 ⛔     **73 ✅**  ← le mot-témoin     │
   │ d'invulnérabilité ...... 17   90 ⛔      77 ✅  (pile sur la limite)   │
   │ caractéristique ........ 15   85 ⛔      72 ✅                         │
   │ Invulnerability ........ 15   79 ⛔      67 ✅                         │
   │ Leatherworker's ........ 15   91 ⛔      78 ⛔                         │
   │ supplémentaires ........ 15   94 ⛔      80 ⛔                         │
   └───────────────────────────────────────────────────────────────────────┘

   ➡️ **`ABREGE_MAX` passe de 10 à 16**, et le nombre se lit sur la ligne du
   mot-témoin : à T1 « Prestidigitation », 16 caractères sans une seule espace
   où se couper, pèse 73 des 77 px. Il ne doit PAS être abrégé — c'est
   exactement le bénéfice qu'Eric achetait en descendant d'un barreau.

   ⭐ CE QUE ÇA CHANGE, COMPTÉ SUR LE CORPUS RÉEL (3 831 mots distincts des
   couches, `layers/*.layer.json`) :
       seuil 10, à T2 ... **435** mots abrégés (122 anglais · 317 français)
       seuil 16, à T1 ... **3** mots abrégés (**0 anglais** · 3 français)
   ⭐⭐ *« On aura moins d'emmerdes »* : 435 → 3, et zéro en anglais, la langue
   par défaut du Seuil. La mesure dit ce qu'il avait prévu.

   ⚠️ 15 OU 16 ? LE SEUL ARBITRAGE DE CE LOT, ET IL EST DIT PLUTÔT QUE MASQUÉ.
   La méthode du 19/08 prenait « un cran sous le dernier qui passe », ce qui
   donnerait 15 ici. ⛔ Mais 15 abrégerait « Prestidigitation » (16 car.), donc
   annulerait la raison même du passage à T1. **16 est retenu parce qu'il sert
   la raison d'Eric ; un mot de lui le renverse.**

   🔴 ET LA LIMITE DE LA MÉTHODE, MESURÉE, PARCE QU'ELLE NE SE VOIT PAS :
   **un compte de caractères n'est pas une largeur.** « supplémentaires » fait
   15 caractères et 80 px — il SORT ; « Prestidigitation » en fait 16 et 73 —
   il TIENT. Aucun seuil en caractères ne peut séparer ces deux-là. Le repli
   (`overflow-wrap: break-word`, shell.css) rattrape le cas : le mot se coupe
   au lieu de sortir de sa case, et la case garde ses 48 px — vérifié sur les
   neuf pires mots du corpus, aux deux corps. ⏳ Mesurer le mot au lieu de le
   compter demanderait une mesure au rendu ; personne ne l'a demandée.

   ⛔ ET SEULEMENT LE MOT QUI DÉPASSE. « Shocking Grasp » a une espace où se
   couper : la ligne se replie, les deux mots restent entiers. Abréger ce qui
   tient déjà, ce serait la deuxième abréviation qui casse.
   ⚠️ ÇA NE VAUT QUE DANS LA CASE. Le panneau d'info, le bilan et la fiche
   reçoivent le nom ENTIER : ils ont la place, et c'est là qu'on lit vraiment.
   L'abrégé est une contrainte de vitrine, pas une renomination. */
const ABREGE_MAX = 16;
/* ⭐ EXPORTÉ POUR ÊTRE MESURABLE, et c'est la loi du dépôt (« on teste la
   fonction, pas la page ») : la règle d'abrégé est de l'arithmétique de
   chaîne — elle se vérifie sur le mot-témoin sans un nœud de DOM.
   `tests/jeton-corps.test.mjs` la tient. */
export function abrege(mot) {
  return String(mot == null ? "" : mot)
    .split(" ")
    .map((m) => (m.length > ABREGE_MAX ? `${m.slice(0, ABREGE_MAX - 1)}.` : m))
    .join(" ");
}

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/** UN CHEVRON DE PAGINATION — le MÊME objet qu'au tambour, pas un cousin.
 *  🔴 NORMES.md §6 : *« un seul objet, deux rôles … ⛔ Ne pas en fabriquer
 *  deux »*. On reprend donc les classes d'Équipement telles quelles
 *  (`grille-fleche`, dans une `grille-gouttiere`, sous elle un
 *  `grille-compte`) : le dessin, la cible tactile `--touch` et l'encre
 *  discrète sont déjà décidés là-bas, et les redéclarer serait deux réglages
 *  à tenir d'accord. */
function chevron(signe, annonce, onClick) {
  const b = el("button", "grille-fleche", [text(signe)]);
  b.type = "button";
  b.setAttribute("aria-label", annonce);
  b.addEventListener("click", onClick);
  return b;
}

/* ⛔ IL N'Y A PAS DE FANTÔME QUI SUIT LE DOIGT, ET C'EST UN GARDE QUI L'A
   DÉCIDÉ. La première écriture en posait un — une pastille flottante placée à
   chaque image par `element.style.left/top`. Le garde 7 des jetons interdit le
   style EN LIGNE dans tout `ui/` (« le décor va dans la feuille : un style en
   ligne échappe aux jetons, aux voiles et aux thèmes »), et son attaque montre
   que même `setProperty("--x", …)` est refusé : l'exception du moteur de dés
   n'est pas une porte dérobée.
   ⭐ CE QU'ON PERD EST PLUS PETIT QU'IL N'Y PARAÎT : sous un pouce, un fantôme
   est de toute façon caché par le doigt. Le retour visuel qui compte est
   ailleurs — le jeton pâlit (`data-glisse`), et le créneau SOUS le doigt
   s'allume (`data-vise`). Les deux sont des attributs, donc de la feuille.
   ⏳ Si Eric juge le geste trop sec à l'usage, le fantôme se rediscutera avec
   une exception ARGUMENTÉE au garde — pas en le contournant. */

/** Le créneau sous le POINT VISÉ, ou `null`. ⚠️ `elementFromPoint` et non une
 *  comparaison de rectangles : les créneaux peuvent défiler avec la scène, et
 *  un rectangle mémorisé au début du geste mentirait dès le premier pixel. */
function creneauSous(x, y) {
  if (typeof document.elementFromPoint !== "function") return null;
  const cible = document.elementFromPoint(x, y);
  return cible && typeof cible.closest === "function" ? cible.closest("[data-creneau]") : null;
}

/** ARME UN JETON pour les deux gestes.
 *  `onTap()` — relâché sans avoir bougé ; `onDepot(cheminDuCreneau)` — relâché
 *  sur un créneau. Un glisser relâché dans le vide ne fait RIEN, et c'est
 *  volontaire : annuler doit être possible en cours de geste.
 *
 *
 *  ⭐ EXPORTÉE AU LOT 79 (les dés) — LE GESTE EST UN, LES ÉCRANS SONT DEUX.
 *  Le plateau d'Abilities (croquis B, « DRAG AND DROP » entre les six dés
 *  gardés et les six caractéristiques) n'a ni chemins de plan ni actions du
 *  carnet : il pose `assignAbilityRoll`. Il ne peut donc pas emprunter
 *  `renderChoixGlisses` — mais il DOIT emprunter le geste, sans quoi il en
 *  existerait deux, qui divergeraient (la loi que `popup.mjs` énonce pour la
 *  fermeture : « à coder UNE fois, pas trois »). Ce qui se partage est le
 *  seuil, le ciblage et la visée ; la FORME reste à
 *  chaque écran. */
/* ══ LES TROIS RAPPELS DU FANTÔME — ajoutés le 2026-08-16 ════════════════
   Eric, en voyant le geste : *« je veux voir l'image du dé qui se déplace »*.
   Le lot 79 avait volontairement refusé le fantôme (voir la note plus haut) :
   il aurait fallu poser une position à chaque image, donc un style EN LIGNE,
   que le garde 7 des jetons interdit dans tout `ui/`.

   ⭐ CE QUE CES TROIS RAPPELS CHANGENT : l'organe ne DESSINE toujours rien —
   il DIT quand le jeton se lève, où va le doigt, et quand il se pose. Qui
   veut un fantôme le dessine chez lui, et c'est à cet écran-là d'argumenter
   son exception au garde, pas à l'organe partagé.
   ⛔ Ils sont facultatifs : sans eux, pas un octet ne change de comportement,
   et les douze cas du garde le prouvent. */

/* ══ LE QUATRIÈME RAPPEL — `viseur`, et il ne peint RIEN ══════════════════
   Eric, 2026-08-16 (le soir) : *« le fantôme du dé doit apparaître au-dessus
   et à gauche de mon doigt. Et c'est ce même fantôme que je dois placer dans
   la cible, pas mon doigt »*.

   🔴 LA SECONDE PHRASE EST LA VRAIE DEMANDE, et elle ne se règle pas dans la
   feuille. Décaler le fantôme est une affaire de peinture ; mais tant que
   `elementFromPoint` interroge le DOIGT, le joueur poserait son dé sur une
   cible pendant que le geste en désignerait une autre, 40 px plus bas à
   droite. Un décor qui ment sur ce qu'il fait est pire que pas de décor.

   ⭐ CE QUE `viseur` EST, ET CE QU'IL N'EST PAS. Il ne dit pas « où est le
   fantôme » — l'organe ignore toujours qu'il existe un fantôme, et c'est la
   loi de ce fichier. Il répond à une question que l'organe se pose déjà :
   **où ce geste vise-t-il ?** Par défaut, là où le doigt touche ; un écran
   qui déporte son fantôme répond autrement. Le seuil, le maintien et le
   la visée, eux, continuent de se mesurer AU DOIGT — c'est le doigt qui
   bouge, pas la visée.
   ⚠️ CONSÉQUENCE À CONNAÎTRE : un point visé qui sort de la fenêtre (bord
   haut ou gauche) ne rencontre plus rien, et `elementFromPoint` rend `null`.
   Une bande de la largeur du décalage devient donc invisable en haut à
   gauche de l'écran. Aucun de nos créneaux n'y vit — le collecteur est en
   bas — mais un écran qui en mettrait un là le paierait sans message. */
export function armerJeton(jeton, { onTap, onDepot, onLever, onBouger, onPoser, viseur, onHorsCible }) {
  jeton.addEventListener("pointerdown", (ev) => {
    if (jeton.disabled) return;
    /* ⛔ Le bouton par défaut d'un clic droit n'arme rien. */
    if (ev.button !== 0 && ev.pointerType === "mouse") return;
    const x0 = ev.clientX, y0 = ev.clientY;
    let glisse = false;
    let vise = null;
    /* 🧊 LE JETON EST TOUJOURS SOULEVÉ. Il attendait 350 ms là où une grille
       défilait sous lui ; plus aucune ne défile (voir la tête du fichier). */
    /* 🔴 LA CAPTURE NE SE PREND PLUS ICI — voir « L'INCIDENT DU 22/08 » en tête
       de ce fichier. Elle est descendue dans `bouge`, à l'instant où le glisser
       est DÉCIDÉ. La prendre à l'appui annulait le défilement natif d'iOS avant
       que `touch-action: pan-y` ait eu sa chance. */

    /* 🔴 CE QUI EMPÊCHE LA GRILLE DE DÉFILER SOUS UN JETON SOULEVÉ, et c'est
       la SEULE chose qui le peut. `touch-action` est une déclaration prise à
       l'appui : elle ne se renégocie pas en cours de geste. Une fois le jeton
       soulevé, il ne reste donc que le refus explicite du défilement, sur
       l'événement TACTILE (le pointeur, lui, ne le porte pas).
       ⚠️ L'écouteur est posé DÈS L'APPUI, avant même le soulèvement : un
       navigateur décide de défiler au PREMIER `touchmove`, et un écouteur
       arrivé après cette décision n'a plus rien à refuser. Il ne retient
       qu'une fois soulevé — tant que le jeton dort, le doigt défile. */
    const retenir = (e) => {
      if (typeof e.preventDefault === "function") e.preventDefault();
    };

    /* Le point que ce geste DÉSIGNE — le doigt, sauf si l'écran a déporté ce
       qu'il fait suivre au doigt (voir `viseur` en tête de fonction). */
    const ouVise = (e) => (viseur ? viseur(e.clientX, e.clientY) : [e.clientX, e.clientY]);

    const viser = (creneau) => {
      if (vise === creneau) return;
      if (vise) vise.dataset.vise = "false";
      vise = creneau;
      if (vise) vise.dataset.vise = "true";
    };

    const bouge = (e) => {
      if (!glisse && Math.hypot(e.clientX - x0, e.clientY - y0) < SEUIL_GLISSER) return;
      if (!glisse) {
        glisse = true;
        /* ⭐ LA CAPTURE SE PREND ICI, ET NULLE PART AVANT. Elle garde les
           événements sur CE jeton même si le doigt sort de sa boîte — sans
           elle, `pointerup` se perdrait au premier pixel hors cadre. Mais elle
           n'a de raison d'être qu'une fois le glisser COMMENCÉ : avant, il n'y
           a rien à retenir, et la prendre coûtait le défilement (22/08).
           ⚠️ RIEN N'EST PERDU ENTRE 0 ET 6 PX, et ce n'est pas un pari : un
           pointeur TACTILE est capturé IMPLICITEMENT par sa cible (spécification
           Pointer Events, « implicit pointer capture »), donc les `pointermove`
           du doigt reviennent ici de toute façon. Pour la souris, il n'y a pas
           de capture implicite — mais parcourir six pixels sans quitter un
           jeton d'au moins 44 px n'est pas un cas qu'on ait à couvrir, et la
           souris ne fait pas défiler une liste au `touch-action`.
           ⚠️ FACULTATIVE, ET POUR DEUX RAISONS RÉELLES : un pointeur peut avoir
           cessé d'exister entre l'événement et cet appel (le navigateur jette
           alors `NotFoundError`), et le geste doit rester ÉPROUVABLE hors
           navigateur — sans quoi le seul juge de cet organe serait l'œil. */
        if (typeof jeton.setPointerCapture === "function") {
          try { jeton.setPointerCapture(e.pointerId); } catch { /* pointeur déjà fini */ }
        }
        jeton.dataset.glisse = "true";
        if (onLever) onLever(e.clientX, e.clientY);
      }
      if (onBouger) onBouger(e.clientX, e.clientY);
      viser(creneauSous(...ouVise(e)));
    };

    const fini = (e) => {
      jeton.removeEventListener("pointermove", bouge);
      jeton.removeEventListener("pointerup", fini);
      jeton.removeEventListener("pointercancel", fini);
      jeton.removeEventListener("touchmove", retenir);
      delete jeton.dataset.glisse;
      /* ⚠️ LE FANTÔME SE RANGE AVANT TOUTE DÉCISION, et sans condition : un
         geste annulé, renoncé ou relâché dans le vide doit le faire
         disparaître aussi. Un fantôme qui survit à son geste est pire que
         pas de fantôme du tout. */
      if (glisse && onPoser) onPoser();
      /* ⭐ LE DÉPÔT VISE OÙ LE GESTE VISAIT, pas où le doigt s'est levé —
         sinon le créneau allumé pendant tout le glisser ne serait pas celui
         qui reçoit, et le retour visuel deviendrait un mensonge à la
         dernière milliseconde. */
      const cible = glisse ? creneauSous(...ouVise(e)) : null;
      viser(null);
      /* ⭐ LE TAP PORTE SON OUTIL. Eric, 2026-08-16 : *« tap pour info, drag
         and drop to select ; sur desktop clic droit info, gauche select »* —
         le même appui court ne veut donc PAS dire la même chose au doigt et
         à la souris. C'est l'appelant qui tranche (voir `onInfo`), et il ne
         peut trancher que s'il sait avec quoi on a touché. */
      if (!glisse) { onTap(ev.pointerType); return; }   // sous le seuil : un tap
      if (e.type === "pointercancel") return;
      if (cible) { onDepot(cible.dataset.creneau); return; }
      /* ⭐ LÂCHÉ HORS DE TOUTE CIBLE. Pour un jeton du vivier, c'est un
         non-geste : il retourne d'où il vient, et rien ne bouge (c'est le
         comportement d'origine, et il est juste). Pour le contenu d'un
         RÉCEPTEUR, c'est au contraire le geste d'annulation d'Eric — il faut
         donc pouvoir le distinguer, et seul l'appelant le sait. */
      if (onHorsCible) onHorsCible();
    };

    /* ⚠️ `passive: false` EST LE FOND DE L'AFFAIRE : un écouteur `touchmove`
       est passif PAR DÉFAUT sur mobile, et un écouteur passif n'a pas le droit
       de refuser le défilement — son `preventDefault` est ignoré, en silence.
       Le déclarer est la moitié du mécanisme.

       🔴 IL EST POSÉ POUR TOUT LE MONDE DEPUIS LE 2026-08-19, et sans condition
       depuis le 20 — Eric, sur iPad : *« quand je redéplace vers le haut, ça
       fait scroller mon affichage »*. Le verrou reposait sur la SEULE
       déclaration `touch-action: none` de la feuille ; là où elle manquait (le
       récepteur rempli), rien ne retenait le défilement.
       ⭐ DEUX ORGANES INDÉPENDANTS PLUTÔT QU'UN : une garantie qui tient par une
       seule déclaration se perd au premier sélecteur oublié. */
    jeton.addEventListener("touchmove", retenir, { passive: false });

    jeton.addEventListener("pointermove", bouge);
    jeton.addEventListener("pointerup", fini);
    jeton.addEventListener("pointercancel", fini);
  });
}

/** L'ÉCRAN DE CHOIX À CRÉNEAUX — même entrée que `renderSlotQcm` (carnet.mjs),
 *  autre forme. ⛔ Il ne le REMPLACE pas : le QCM sert encore l'espèce, sa
 *  bourse captive et le don d'origine. Deux formes, un seul contrat.
 *
 *  `slots` : ce que `planSlots` rend — chemin, index, options, `selected`,
 *  verrou. `onAction` reçoit exactement les mêmes actions que le QCM, donc le
 *  moteur ne voit aucune différence entre un choix tapé, glissé ou coché.
 *
 *  🧊 `grille` A DISPARU (2026-08-20) : il n'existait que pour donner au
 *  vivier une fenêtre défilante, et Eric a retiré l'ascenseur. Les trente
 *  sorts de niveau 1 défilent maintenant avec la page. */
/* ══ LE FANTÔME — Eric, 2026-08-19 : *« il faut un fantôme identique à
   l'objet »* ═══════════════════════════════════════════════════════════════

   ⭐ IDENTIQUE VEUT DIRE CLONE, ET C'EST LITTÉRAL. Redessiner un fantôme
   « qui ressemble » au jeton, c'est deux dessins à tenir d'accord : le jour où
   le jeton change de police ou de liseré, le fantôme ment. `cloneNode(true)`
   ne peut pas diverger.

   ⚠️ IL EST INERTE : `aria-hidden` et `pointer-events: none`. Un lecteur
   d'écran annoncerait deux fois le même mot, et un fantôme cliquable
   intercepterait le dépôt qu'il accompagne.

   📌 LA DEMI-TAILLE EST LUE UNE FOIS, à la prise — pas à chaque `pointermove`.
   Mesurer par image force un recalcul de mise en page pendant le seul moment
   de l'écran où il faut être fluide (la leçon du fantôme des dés). */
let fantomeGlisse = null;
let fantomeDemi = [0, 0];

function fantomeRanger() {
  if (fantomeGlisse) { fantomeGlisse.remove(); fantomeGlisse = null; }
}

/* ⚠️ LA DEMI-TAILLE EST CONNUE, PAS MESURÉE — et c'est le précédent du dépôt,
   pas une commodité : le fantôme des dés (`abilities-step.mjs`) porte lui aussi
   sa cote en dur, avec sa raison écrite — *« lire getBoundingClientRect() à
   chaque pointermove force un recalcul de mise en page par image, pendant le
   seul moment de l'écran où il faut être fluide »*.
   🔴 ET MESURER CASSAIT LA SUITE, ce qui était le bon signal : le stub DOM
   refuse `getBoundingClientRect()` sans géométrie déclarée — *« ce stub ne
   fabrique pas de mise en page »*. Un décor qui exige une mise en page pour
   exister n'a rien à faire dans un chemin que les tests traversent.
   📌 Les deux cotes sont celles du gabarit : `--touch` (44) en hauteur, et la
   colonne minimale de la grille (9rem ≈ 144) en largeur. */
/* ⛔ LES DEUX CONSTANTES SONT PARTIES — lot 125, et elles portaient DEUX
   fautes à elles seules.
     · `FANTOME_L = 144` citait `--glisse-l, 9rem`, un jeton **retiré** du
       dépôt. La feuille peint le fantôme à `--glisse-case`, c'est-à-dire
       **87** : la demi-largeur était donc fausse de `72 − 43,5 = 28,5 blg`,
       et le fantôme flottait d'autant à GAUCHE du doigt. À l'échelle 1 c'est
       ce décalage qu'on mesurait.
     · Et une cote recopiée à côté d'une feuille qui en dit une autre est le
       défaut que §1 ter interdit : **elle se déduit, elle ne s'écrit pas.**
   ⭐ ELLE SE MESURE DONC SUR LA COPIE ELLE-MÊME, une fois montée : `offsetWidth`
   rend la MISE EN PAGE (des blg), exactement l'unité dans laquelle le
   `translate` ci-dessous travaille. Le jour où Eric bouge `--glisse-case`, le
   fantôme suit sans qu'on y revienne.
   ⚠️ Repli à zéro quand il n'y a pas de mise en page (le stub DOM des tests) :
   le fantôme se pose alors par son coin plutôt que par son centre — un décor
   décalé vaut mieux qu'un geste qui jette. */

function fantomeLever(jeton, x, y) {
  fantomeRanger();
  if (!document.body || typeof jeton.cloneNode !== "function") return;
  const copie = jeton.cloneNode(true);
  copie.className = `${jeton.className} glisse-fantome`;
  copie.disabled = true;
  copie.setAttribute("aria-hidden", "true");
  fantomeGlisse = copie;
  /* 🔴 DANS `.app`, PAS SUR `<body>` — corrigé le 2026-08-30 au soir.
     Le zoom du builder vit sur `.app` (shell.css), et `.app` est un enfant de
     `<body>` : un fantôme posé sur le corps ÉCHAPPE donc à l'échelle. Mesuré
     au cran 3 : l'organe sous le doigt se peignait à 261 px et son fantôme à
     87 — trois fois trop petit, pendant le seul geste où l'œil compare les
     deux. « TOUT LE BUILDER SUIT LE ZOOM » était faux ici, et aucun test ne
     pouvait le dire.
     ⚠️ Le repli sur `<body>` reste, pour le seul cas où `.app` n'existe pas
     (bancs, stub DOM) : un fantôme mal placé vaut mieux qu'un geste qui jette. */
  (document.querySelector(".app") || document.body).append(copie);
  /* Mesurée APRÈS le montage : avant, la copie n'a pas de mise en page. */
  fantomeDemi = [(copie.offsetWidth || 0) / 2, (copie.offsetHeight || 0) / 2];
  fantomeSuivre(x, y);
}

/** 🔴 LE DOIGT PARLE EN PIXELS PEINTS, LE FANTÔME EN BLG — lot 125.
 *
 *  ⛔ LE DÉFAUT, ET IL GRANDISSAIT AVEC L'ÉCRAN. Le fantôme est monté DANS
 *  `.app`, qui porte le `zoom` : un `translate(N px)` écrit là est donc peint
 *  à `N × zoom`. Les coordonnées d'un pointeur, elles, arrivent en pixels de
 *  FENÊTRE. Les mélanger donnait, mesuré :
 *
 *      écart = x × (z − 1) − 28,5 × z
 *
 *  — nul au cran 1 à la demi-largeur près, et **+493 / +996 px** à l'échelle
 *  2,107, l'écart croissant avec la distance à l'origine. C'est la famille
 *  exacte que `facteurZoom` a été écrit pour fermer (TRAPS : *« les mélanger
 *  donne un résultat faux × le cran »*), et c'était le dernier site du dépôt
 *  qui la portait encore.
 *
 *  ⭐ ON DIVISE DONC AVANT DE POSER, et on mesure le facteur sur la RACINE
 *  D'ÉCHELLE (`facteurZoomCourant`), jamais sur le fantôme : `facteurZoom(n)`
 *  ne peut pas convertir `n` lui-même — la note d'`echelle.mjs` a coûté une
 *  nuit à l'écrire.
 *  ⚠️ Sans `.app` (bancs, stub), le facteur vaut 1 et l'expression retombe
 *  exactement sur celle d'avant ce lot. */
function fantomeSuivre(x, y) {
  if (!fantomeGlisse) return;
  const z = facteurZoomCourant() || 1;
  fantomeGlisse.style.transform =
    `translate(${x / z - fantomeDemi[0]}px, ${y / z - fantomeDemi[1]}px)`;
}

export function renderChoixGlisses({ plan, slots, titre, mot, labelOf, refKind, onAction, consigne, onInfo, reutilisable, unite, parPage, rangee: rangeeStyle }) {
  if (!plan || !Array.isArray(slots) || slots.length === 0) return null;
  const act = onAction || (() => {});
  /* 🔴 UNE RANGÉE DE SORTS SE RANGE PAR TROIS — Eric, 2026-08-29 : *« je veux
     qu'ils respectent la règle des rangées de 3, max 5 rangées superposées sur
     TOUS les écrans »*, et *« [les cantrips] doivent continuer à se nommer
     cantrips, mais les règles de rangement sont les mêmes que les sorts »*.
     ⚠️ MESURÉ FAUX AVANT : l'écran Cantrips n'est PAS paginé (il tient en une
     page), donc il n'a pas de `.grille-rang` — et la règle des QUATRE, écrite
     pour les collecteurs de skills, l'attrapait : 4-4-4-3 à 1440. Deux écrans
     de sorts se rangeaient différemment selon qu'ils débordaient ou non.
     ⭐ LA NATURE SE DIT, ELLE NE SE DEVINE PAS : `refKind` est déjà la donnée
     qui dit « ce sont des sorts » — le cadre la porte, le style la lit. */
  const bloc = el("section", "choix-glisse");
  /* 🔴 LE RÉGIME DE RANGEMENT SE DIT, IL NE SE DÉDUIT PAS — et il tient en UN
     mot, lu par le style. Trois régimes coexistent (Eric, 2026-08-29) :
       · `sorts`  → trois par rangée, cinq rangées (15 = LISTE_PAR_PAGE) ;
       · `caracs` → les six sur une seule ligne ;
       · `skills` → quatre par rangée, la ligne courte centrée.
     ⛔ POURQUOI UN ATTRIBUT ET PAS TROIS CLASSES QUI S'EXCLUENT : la version
     précédente écrivait chaque régime en `:not()` des deux autres. Elle s'est
     cassée TROIS fois de suite — un `:not()` de plus change la spécificité,
     donc un régime se mettait à battre un autre par accident (les six caracs
     repassées au socle et rangées 3 + 3). Trois valeurs d'un même attribut ont
     la MÊME spécificité et ne peuvent pas se battre : une seule est vraie. */
  bloc.dataset.rangs = rangeeStyle === "caracs" ? "caracs"
    : refKind === "spell" ? "sorts" : "skills";
  /* 📏 ET LA RANGÉE LA PLUS DENSE SE DÉCLARE — précision du 29/08 au soir.
     La cote cédée divisait par la LOI des collecteurs (4) même quand l'écran
     n'a qu'UN créneau : à 360, Identity rendait des cases de 78 et la tête
     « ALIGNMENT » cassait en deux pour neuf pixels — un prix payé à une
     rangée qui n'existe pas. La rangée la plus dense d'un écran est
     max(3 jetons, ses collecteurs RÉELS plafonnés à la loi) ; l'émetteur la
     connaît, le style la lit. Les six caracs gardent leur mot. */
  /* ⛔ EN ATTRIBUT, JAMAIS EN STYLE EN LIGNE (garde 7) : trois valeurs d'un
     même attribut, même spécificité, lues par listes.css. */
  bloc.dataset.dense = String(rangeeStyle === "caracs" ? 6
    : Math.max(3, Math.min(bloc.dataset.rangs === "sorts" ? 3 : 4,
        Array.isArray(slots) ? slots.length : 1)));
  bloc.dataset.status = plan.status;
  /* ⛔ ON NE NOMME PAS DEUX FOIS (§1 quinquies) — un appelant dont la DALLE
     porte déjà le nom de l'écran passe `titre: null`, et l'organe se tait.
     Les appels existants ne changent pas d'un pixel (lot 77). */
  if (titre) bloc.append(el("h3", null, [text(titre)]));
  /* 🔴 LE COMPTE NE PARAÎT QUE S'IL COMPTE QUELQUE CHOSE — Eric, 2026-08-26 :
     *« dégage les 1 of 1 chosen »*, puis, quand j'avais tout retiré : *« on les
     remet quand c'est utile, PAS LÀ »*.

     ⛔ CE QUE J'AVAIS FAIT ET QUI ÉTAIT TROP : je l'avais supprimé partout, et
     j'avais même écrit dans ce fichier qu'il ne fallait surtout pas le
     remettre pour les choix multiples. Eric a tranché l'inverse, et il a
     raison — la note est réécrite dans son sens, elle ne reste pas debout à
     côté de sa décision.

     ⭐ LE CRITÈRE EST « EST-CE QUE ÇA APPREND QUELQUE CHOSE ? » : à UN créneau,
     « 0 of 1 chosen » n'apprend rien. Le collecteur est sous les yeux du
     joueur — rempli, il porte le doré et le relief ; vide, son liseré
     pointillé et un tiret. **Compter une case que l'on VOIT, c'est dire deux
     fois la même chose**, et ici c'est une ligne entière pour zéro information.
     ⭐⭐ À PLUSIEURS, IL APPREND VRAIMENT : « 2 of 4 chosen » sur quatre
     créneaux se lit d'un coup d'œil là où il faudrait sinon compter les cases
     pleines — et le QCM de classe en a 2, 3 ou 4 selon la classe.

     📌 `unite` reste ce qu'il était (2026-08-20) : deux écrans, deux économies
     — on CHOISIT des sorts, on DÉPENSE des points, et « 3 of 6 chosen » sur une
     bourse dirait au joueur qu'il lui reste trois choix quand il lui reste deux
     points. ⛔ L'organe ne le devine pas : l'appelant le dit. */
  if (plan.expected > 1) {
    bloc.append(el("p", "choix-glisse-compte",
      [text(`${plan.answered} of ${plan.expected} ${unite || "chosen"}`)]));
  }

  const poser = (valeur, chemin) => act(refKind
    ? { kind: "choose", path: chemin, ref: { kind: refKind, id: valeur } }
    : { kind: "set", path: chemin, value: valeur });

  /* ── LE VIVIER : une pastille par option ──────────────────────────────
     ⭐ Une option DÉJÀ POSÉE est `disabled`, pas marquée « enfoncée » : elle
     n'est pas un interrupteur à deux états, elle est ailleurs. C'est aussi ce
     qui la tient hors du garde `aria-pressed` — un bouton à état devrait
     annoncer le sien, celui-ci n'en a pas. */
  /* ⚠️ `selected` EST UN TABLEAU, PAS UNE VALEUR — lu dans `decisions[]`, pas
     supposé : `catalogueCursor` fait déjà `plan.selected[0]`, et `renderPicker`
     reçoit le tableau entier. Le traiter comme un scalaire passait un objet à
     `query()`, qui a jeté « l'id doit être une chaîne ». Une forme se lit. */
  const choisiDe = (slot) => (Array.isArray(slot.selected) ? slot.selected[0] : slot.selected) || null;
  const posees = new Set(slots.map(choisiDe).filter(Boolean));
  const vivier = el("ul", "glisse-vivier");
  /* 🧊 IL N'Y A PLUS DE SECOND DÉFILEMENT ICI — Eric, 2026-08-20 : *« il ne
     faut plus d'ascenseurs couplés avec des actions drag and drop »*. Le
     vivier déclarait `data-scroller="grille"` parce qu'il en portait un ; il
     n'en porte plus, donc il ne déclare plus rien.
     ⚠️ LA SUITE DE CETTE PHRASE A CHANGÉ LE 2026-08-26, et c'est ce lot-ci :
     elle disait *« la liste défile avec la page »*. Une liste de jetons ne
     défile plus du tout — elle PAGINE (NORMES.md §5). *« On lit un texte de
     haut en bas ; on CHOISIT parmi des jetons, et un jeton hors écran est
     introuvable »* (§5 bis). */
  const options = slots[0].options || [];
  /** UN JETON DU VIVIER, AVEC SON GESTE ARMÉ.
   *  ⭐ EXTRAIT POUR LA PAGINATION, ET C'EST LA SEULE RAISON : tourner une page
   *  remplace les `li` du vivier, donc il faut savoir en refabriquer un — armé,
   *  pas seulement dessiné. Une page tournée dont les jetons ne répondent plus
   *  au doigt serait pire qu'une liste sans fin. */
  const faireJeton = (id) => {
    const item = el("li", null);
    const jeton = el("button", "glisse-jeton", [text(abrege(labelOf ? labelOf(id) : id))]);
    jeton.type = "button";
    jeton.dataset.valeur = id;
    /* 🔴 UN JETON DE QUANTITÉ NE S'ÉPUISE PAS — Eric, 2026-08-19 : *« je suis
       bloqué, les +1 sont épuisés, ils devraient être illimités »*.
       ⭐ LA RÈGLE D'ORIGINE RESTE JUSTE POUR CE QU'ELLE VISAIT : un lignage, un
       sort mineur, une compétence ne se prennent qu'une fois — le jeton posé
       est AILLEURS, donc éteint. Mais « +1 » n'est pas un objet unique, c'est
       une VALEUR : on peut en poser sur plusieurs récepteurs. Épuiser une
       valeur après un usage bloquait l'écran, et c'est ce qui est arrivé. Le
       vivier dit donc lui-même s'il se consomme. */
    jeton.disabled = reutilisable ? false : posees.has(id);
    armerJeton(jeton, {
      onLever: (x, y) => fantomeLever(jeton, x, y),
      onBouger: (x, y) => fantomeSuivre(x, y),
      onPoser: () => fantomeRanger(),
      /* ══ LE TAP, ET IL DIT DEUX CHOSES DIFFÉRENTES ═══════════════════════
         Décision d'Eric, 2026-08-16 (le soir) : *« j'avais prévu tap pour
         info, drag and drop to select ; sur desktop clic droit info, gauche
         select »*. Elle referme la question laissée ouverte au §7.3 du
         mandat, et elle est cohérente avec chaque appareil :
         · AU DOIGT, l'appui court est le geste d'inspection (le croquis
           l'écrit sous la grille : « Tap on cantrip for info »), et poser
           demande le glisser ;
         · À LA SOURIS, le clic gauche POSE (il n'y a pas d'ambiguïté à lever,
           le pointeur est précis) et le clic droit inspecte.
         ⛔ ET CE N'EST QUE POUR LES ÉCRANS QUI ONT UNE INFO À DONNER : sans
         `onInfo`, le tap pose, au doigt comme à la souris — l'écran des
         compétences (étape 2) ne change pas d'un geste. */
      onTap: (type) => {
        if (onInfo && type !== "mouse") { onInfo(id); return; }
        /* LE TAP QUI POSE : le premier créneau libre. S'il n'y en a plus, le
           geste ne fait rien — remplacer un choix au hasard serait pire que
           ne rien faire, et le joueur a un créneau à vider sous les yeux. */
        const libre = slots.find((s) => !choisiDe(s));
        if (libre) poser(id, libre.path);
      },
      onDepot: (chemin) => poser(id, chemin)
    });
    /* LE CLIC DROIT — l'autre moitié de la même décision. `preventDefault`
       parce qu'un menu contextuel de navigateur par-dessus la fiche n'est
       pas une réponse à « qu'est-ce que ce sort ? ». */
    if (onInfo) {
      jeton.addEventListener("contextmenu", (ev) => {
        if (typeof ev.preventDefault === "function") ev.preventDefault();
        onInfo(id);
      });
    }
    item.append(jeton);
    return item;
  };

  /* ══ LA PAGINATION — NORMES.md §5, portée du produit ENTIER ═════════════
     🔴 ELLE EST ICI ET PAS DANS LES QUATRE ÉCRANS. Species, Class, Inheritance
     et Identity ne fabriquent pas leur vivier : ils remettent un plan à cet
     organe, qui en tire les jetons. Paginer chez eux, ce serait quatre copies
     de la même arithmétique et quatre jeux de chevrons — exactement ce que
     `tests/listes.test.mjs` existe pour empêcher (*« le premier de ces écrans à
     se construire pouvait écrire 12 ou 20 »*). Un seul organe, quatre écrans
     servis, et le cinquième — les langues de l'Héritage, rendues par la
     coquille — servi sans qu'on ait eu à y toucher.

     ⛔ ET LE NOMBRE NE SE RECOPIE PAS : `pageDeListe` porte le défaut au socle
     (`normes.mjs`). Cet organe n'a aucune raison de dévier, donc il ne passe
     aucun nombre. */
  const clefDePage = slots[0].path;
  let page = pageDuVivier.get(clefDePage) || 0;
  /* ⛔ LE COMPTE D'OBJETS EST CELUI DE LA LISTE ENTIÈRE, PAS DE LA PAGE : c'est
     ce qui attend le joueur, pas ce qu'il a sous les yeux — et il vient de la
     MÊME source que les jetons. Écriture d'Équipement, au mot près : le total
     à gauche, la page à droite. */
  const totalDesObjets = el("span", "grille-compte", [text(String(options.length))]);
  const compteDesPages = el("span", "grille-compte");

  function remplirVivier() {
    /* ⚖️ `parPage` : la déviation DÉCLARÉE de NORMES §5 — l'appelant qui ne
       peut pas offrir cinq rangées passe SON nombre, et le défaut du socle
       reste seul partout ailleurs. */
    const vue = parPage ? pageDeListe(options, page, parPage) : pageDeListe(options, page);
    page = vue.page;
    pageDuVivier.set(clefDePage, page);
    /* ⛔ ON NE REMPLACE PAS SOI-MÊME : `tests/socle.test.mjs` tient une liste
       NOIRE — `innerHTML`, `replaceChildren`, `removeChild` — et `socle.mjs`
       est le seul remplaçant du dépôt. Le vivier ne défile plus depuis le
       2026-08-20, donc il n'a aucune position à conserver ; ce n'est pas une
       raison d'ouvrir la porte que ce garde ferme. */
    swapContent(vivier, vue.objets.map((id) => faireJeton(id)));
    compteDesPages.textContent = `${vue.page + 1}/${vue.pages}`;
    return vue;
  }
  const vue = remplirVivier();

  /* ⏳ LES CHEVRONS S'EFFACENT QUAND IL N'Y A QU'UNE PAGE — et ce point n'est
     PAS tranché par Eric (NORMES.md §5, *« les flèches quand il n'y a qu'une
     page : disparaissent-elles ? »*). Le choix le plus SOBRE est pris ici, et
     il est dit plutôt que masqué : deux flèches qui ne mènent nulle part sont
     deux cibles tactiles mortes, et surtout elles coûtent 96 px de largeur à
     une rangée qui n'en a que 20 de reste. ⭐ Sa conséquence mesurée : sept des
     neuf viviers du personnage-témoin ne changent pas d'un pixel.
     🔴 UN MOT D'ERIC LE RENVERSE — il suffit de rendre la rangée toujours. */
  if (vue.pages > 1) {
    const gauche = el("div", "grille-gouttiere");
    gauche.append(chevron("‹", "Previous page", () => tournerPage(-1)), totalDesObjets);
    const droite = el("div", "grille-gouttiere");
    droite.append(chevron("›", "Next page", () => tournerPage(1)), compteDesPages);
    const rang = el("div", "grille-rang");
    rang.append(gauche, vivier, droite);
    bloc.append(rang);
  } else {
    bloc.append(vivier);
  }

  /* ⭐ TOURNER UNE PAGE NE PASSE PAS PAR `onAction`, ET C'EST LA MÊME RAISON
     QU'AU TAMBOUR : la coquille répond à toute action par un `refresh()` qui
     reconstruit la carte entière. Une page tournée qui dispatcherait ferait
     démonter le vivier sous le doigt. On se met à jour soi-même ; le carnet
     n'a rien à savoir d'un numéro de page — ce n'est pas une décision de
     personnage. */
  function tournerPage(sens) {
    page += sens;
    remplirVivier();
  }

  /* ── LES CRÉNEAUX : les cibles du glisser, et le seul endroit qui vide ──
     🔴 `rangee: "caracs"` — Eric, 2026-08-29 : *« tous les collecteurs avec
     les 6 caracs : STR DEX CON INT WIS CHA, règle spécifique, là on met tout
     sur une ligne »*. L'appelant le DIT, le style ne le devine pas : compter
     six créneaux aurait rangé sur une ligne n'importe quel écran qui en porte
     six, et une exception se NOMME (loi de cette feuille). */
  const rangee = el("div", "glisse-creneaux"
    + (rangeeStyle === "caracs" ? " glisse-creneaux--caracs" : ""));
  for (const slot of slots) {
    const creneau = el("button", "glisse-creneau");
    creneau.type = "button";
    creneau.dataset.creneau = slot.path;
    const choisi = choisiDe(slot);
    creneau.dataset.creneau = slot.path;
    creneau.dataset.rempli = choisi ? "true" : "false";
    /* 🔴 VERT POSÉ, ROUGE INVALIDE — Eric, 2026-08-19 : *« quand un objet est
       posé dans son contenant il devient vert, un objet non valide est
       rouge »*. L'invalidité est PRONONCÉE PAR LE CARNET (`slot.lock`), jamais
       devinée ici : un écran qui jugerait tout seul ce qui est valide serait un
       second juge, et les deux divergeraient. */
    creneau.dataset.invalide = slot.lock ? "true" : "false";
    /* ⭐ UN CRÉNEAU PEUT SE NOMMER LUI-MÊME (2026-08-19). Numéroter convient
       quand les créneaux sont interchangeables — trois sorts mineurs, deux
       compétences de classe. Mais la bourse d'espèce a des récepteurs qui SONT
       des compétences nommées : « Skill 1 » y perdait l'information qu'on
       vise. Un `mot` posé sur le créneau gagne donc sur la numérotation. */
    /* 🔴 ET L'INDEX NE SE POSE QUE S'IL Y A DE QUOI COMPTER — 26/08. Un
       créneau unique s'appelait « Gender 1 » : ⛔ **un « 1 » qui n'est jamais
       suivi d'un « 2 » ne numérote rien** — il occupe une ligne pour ne rien
       distinguer, et cette ligne est exactement celle qui faisait déborder le
       collecteur de son gabarit. */
    const nom = slot.mot || (slots.length > 1
      ? `${mot || "Choice"} ${slot.index + 1}`
      : (mot || "Choice"));
    creneau.append(el("span", "glisse-creneau-nom", [text(nom)]));
    creneau.append(el("span", "glisse-creneau-valeur", [
      /* Le récepteur abrège comme le vivier : c'est la MÊME case, et un nom
         qui déborderait ici déborderait de la réponse, pas de la question. */
      /* 🔴 VIDE, LA CASE DIT CE QU'ELLE ATTEND — Eric, 2026-08-26 : *« drop it
         here, en T1, dans le collecteur ; ça disparaît quand c'est rempli »*.

         ⭐ ET ÇA VIENT JUSTE APRÈS LE RETRAIT DU POINTILLÉ, ce qui n'est pas un
         hasard : tant qu'un contour tireté entourait la case, le tiret suffisait
         — la BOÎTE disait « dépose ici », le tiret disait « rien encore ». Le
         contour parti, il ne restait qu'un tiret pour porter les deux messages,
         et un tiret ne dit pas ce qu'on attend de vous.
         ⭐⭐ Le mot le fait, et il ne coûte rien de plus : il occupe la ligne
         que le tiret occupait déjà, dans le même corps.
         ⚠️ IL S'EFFACE AU REMPLISSAGE, c'est la seconde moitié de la consigne —
         une consigne qui reste après avoir été suivie devient du bruit, et pire,
         elle ferait douter de ce qui est posé. */
      text(choisi ? abrege(labelOf ? labelOf(choisi) : choisi) : "drop here")
    ]));
    /* 🔴 ON N'ANNULE PLUS EN TAPANT — Eric, 2026-08-19, et sa raison est une
       PRÉVISION, pas un goût : *« clic annule : non, car si on implémente le
       clic point A / clic point B = A va sur B, ça va foutre la merde »*. Il a
       raison : le jour où le tap sert à DÉSIGNER une cible, un tap qui vide
       aussi rendrait le même geste ambigu selon l'état de la case. On ne
       construit pas une porte qu'il faudra murer.

       ⭐ ON ANNULE EN RESSORTANT L'OBJET : glisser le contenu d'un récepteur
       hors de lui le rend au vivier. C'est le geste inverse du dépôt, donc
       personne n'a à l'apprendre — et Eric le note comme un défaut GLOBAL du
       site, pas comme une demande locale.
       ⚠️ « Hors de lui » et pas « sur le vivier » : viser une zone précise pour
       jeter est plus dur que de lâcher n'importe où. */
    if (choisi) {
      creneau.setAttribute("aria-label", `${nom} — drag out to clear`);
      armerJeton(creneau, {
        onLever: (x, y) => fantomeLever(creneau, x, y),
        onBouger: (x, y) => fantomeSuivre(x, y),
        onPoser: () => fantomeRanger(),
        onTap: () => {},
        onDepot: (chemin) => {
          /* Lâché AILLEURS : on vide. Lâché sur un autre récepteur : on
             déplace — poser puis vider, dans cet ordre, pour qu'aucune image
             ne montre la valeur nulle part. */
          if (chemin && chemin !== slot.path) poser(choisi, chemin);
          act({ kind: "clear", path: slot.path });
        },
        onHorsCible: () => act({ kind: "clear", path: slot.path })
      });
    } else {
      creneau.setAttribute("aria-label", `${nom} — empty`);
    }
    rangee.append(creneau);
  }
  bloc.append(rangee);
  /* Tout posé, rien d'invalide : le bloc le DIT (⏳ la phrase d'Eric sur ce
     point est arrivée coupée — « quand tout le drop down est valide… » — donc
     le bloc porte l'état et l'écran en fera ce qu'Eric décidera). */
  /* 🔴 DÉPASSÉ = ROUGE, ET C'EST LE CARNET QUI LE DIT — Eric, 2026-08-19, sur
     capture : trois « +1 » posés sur un budget de DEUX, compteur « 3 of 2 », et
     tout en vert. Le rouge existait et ne se levait jamais : il attendait un
     `lock`, que rien ne produit ici.

     ⭐ L'ÉCRAN NE JUGE TOUJOURS RIEN. Le plan publie `answered` et `expected` ;
     comparer deux nombres qu'on lui donne n'est pas prononcer une règle, c'est
     lire celle qu'il a déjà prononcée. Un écran qui déciderait lui-même du
     budget serait un second juge — celui-ci ne fait que cesser d'ignorer le
     premier.

     ⛔ ET DÉPASSÉ N'EST PAS COMPLET : un `Done` vert sur un budget explosé
     inviterait à valider une faute. */
  /* 🚨 ET LE VERROU DU NOYAU COMPTE AUTANT QUE LE NOMBRE — Eric, 2026-08-29 :
     *« SB3 Wizard : blocage des boutons oui mais PAS DE GENDARME putain ! »*
     ⚠️ MESURÉ : `answered > expected` compare des RÉPONSES. Sur une bourse, on
     peut remplir deux collecteurs (2 de 2 répondus, donc « pas trop ») en
     dépensant cinq points pour deux — le budget explose, l'écran reste calme.
     Le noyau, lui, l'avait dit : il posait `plan.lock`. Personne ne l'écoutait.
     ⭐ MÊME LOI QU'AU PIED (le `Done` désarmé sous verrou, corrigé le même
     jour) : quand le noyau refuse, l'écran le DIT — le rouge signale, et le mot
     dit lequel. Un blocage sans explication laisse le joueur deviner. */
  const trop = Boolean(plan.lock)
    || (Number.isInteger(plan.answered) && Number.isInteger(plan.expected)
      && plan.answered > plan.expected);
  bloc.dataset.trop = String(trop);
  /* 🟢 « TOUT POSÉ » EST LE VERDICT DU PLAN, PAS LE COMPTE DES CASES — Eric,
     lot 123, 2026-09-02 : *« le liseré autour des collecteurs ne passe pas de
     bleu à vert quand j'ai dépensé tout le budget »*.

     ⛔ CE QUI ÉTAIT ÉCRIT : `slots.every(choisiDe)` — « complet » y voulait
     dire TOUTES LES CASES REMPLIES. NORMES §2 ter dit *« tout posé »*,
     c'est-à-dire **le choix est fini**. Les deux se confondent tant qu'il y a
     autant de points que de cases, et divergent dès qu'il y en a moins.
     📏 MESURÉ : Elestu, 2 points pour TROIS collecteurs. `+2` sur Delve →
     la consigne dit « 2 of 2 points spent », le `Done` du pied est vert, et
     `data-complet` rend **`false`** : Delve reste bleu `rgb(95,144,199)`, les
     deux autres transparents. Même chose sur l'Elfe avec `+1` puis `+1`.
     ⭐ LE VERT ÉTAIT STRUCTURELLEMENT INATTEIGNABLE sur toute bourse captive :
     on ne remplit jamais trois cases avec deux points. Ce n'était donc pas un
     réglage manquant, c'était une condition qu'aucun personnage ne pouvait
     satisfaire.

     ⭐ ET LA VÉRITÉ ÉTAIT DÉJÀ LÀ, DEUX LIGNES PLUS HAUT : `plan.answered` et
     `plan.expected`, que `trop` lisait déjà pour rougir. L'écran ne se met pas
     à juger — il finit de lire le seul juge, au lieu de compter des cases.
     C'est mot pour mot le test que `budgetDepense` (species-step) porte depuis
     le 27/08 pour la porte du SB : `answered === expected`, refusé sous verrou.
     ⚠️ D'où la porte VERTE au-dessus de collecteurs BLEUS : deux organes du
     même écran répondaient à deux questions différentes.

     ⛔ TROIS REFUS SURVIVENT, et chacun a payé son incident :
       · `!trop` — un budget explosé ne devient jamais vert (19/08, « 3 of 2 ») ;
       · `!s.lock` — une mauvaise pose garde le rouge, elle ne se laisse pas
         recouvrir par un vert d'ensemble (NORMES §2 ter) ;
       · `attendu > 0` — même garde que `budgetDepense` : un plan qui n'attend
         rien ne se déclare pas satisfait, sinon un champ vide naîtrait vert.
     ⚠️ ET LE REPLI RESTE LE COMPTE DES CASES pour un plan qui ne publie aucun
     nombre utilisable — il n'y a alors rien d'autre à lire, et c'est
     exactement ce que faisait la ligne d'avant. */
  const attendu = Number(plan.expected);
  const chiffre = Number.isFinite(attendu) && attendu > 0;
  const fini = chiffre ? Number(plan.answered) === attendu : slots.every((s) => choisiDe(s));
  bloc.dataset.complet = String(!trop && fini && slots.every((s) => !s.lock));

  /* Le mot du gendarme REMPLACE la consigne : une consigne qui explique
     comment faire, sous un refus, dit la mauvaise chose au mauvais moment. */
  const motDuPied = plan.lock ? refusalWord(plan.lock) : consigne;
  if (motDuPied) bloc.append(el("p", "glisse-consigne", [text(motDuPied)]));
  return bloc;
}
