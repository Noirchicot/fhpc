/* ══ LES COLLECTIONS DE FONDS — LOT 134 ═══════════════════════════════════
   Eric, 2026-09-02 : *« On a déjà deux collections jour nuit, nous en aurons
   une 3e. Tu vas les stocker pour qu'on puisse les changer dans le menu. »*

   ⛔ CE QUE CE LOT N'A PAS FAIT, ET C'EST LE POINT DE DÉPART : écraser
   `bg-day.jpg` / `bg-night.jpg`. Le brief rédigé ailleurs disait de servir la
   paire neuve SUR ces deux noms — ce qui aurait détruit la collection du
   18/08, c'est-à-dire précisément ce qu'Eric veut pouvoir rappeler. La paire
   neuve entre donc À CÔTÉ.

   ══ LES DEUX AXES, ET ILS NE SE MÉLANGENT JAMAIS ═════════════════════════
   · LA COLLECTION — quelle PAIRE d'images sert. Un choix de JOUEUR, gardé
     dans son navigateur, réglé depuis le Menu.
   · LE THÈME — laquelle des DEUX images de cette paire s'affiche. Un fait de
     l'APPAREIL (`prefers-color-scheme`), que ce module ne lit même pas.

   ⭐ LE CÂBLAGE QUI TIENT CETTE SÉPARATION : ce module repose `--bg-jour` et
   `--bg-nuit` sur `:root`. `tokens.css` garde l'aiguillage de thème pour lui
   (`--bg-image: var(--bg-jour)`, et `var(--bg-nuit)` dans le bloc sombre) —
   une media query, en CSS pur. Une bascule de thème pendant que la page est
   ouverte se fait donc TOUTE SEULE, sans que ce module soit rappelé, et sans
   un seul écouteur `matchMedia` à tenir.

   ══ 🔴 AJOUTER UNE COLLECTION EST UNE OPÉRATION DE DONNÉES ═══════════════
   Deux JPEG dans `assets/`, une entrée dans `collections` et deux dans
   `fichiers` de `assets/backgrounds.measured.json`. ⛔ AUCUNE LIGNE DE CODE :
   ni ici, ni dans `tokens.css`, ni dans le Menu, ni dans le garde — qui
   boucle sur ce même fichier et adopte la collection neuve tout seul.

   ⛔ ET C'EST POURQUOI LE REGISTRE EST LE FICHIER DE MESURE LUI-MÊME, pas un
   second fichier à côté : une liste de collections d'un côté et des mesures
   de l'autre finiraient par diverger en silence — une paire déclarée sans
   mesure, ou mesurée sans être déclarée. Une seule source, un seul geste.

   ⚠️ CE N'EST PAS UNE DONNÉE DE PERSONNAGE — même loi que `tutoriel.mjs` et
   `vue.mjs` : deux joueurs qui ouvrent le même personnage n'ont pas le même
   décor. La préférence vit dans le navigateur, jamais dans `fh-char/1` ; la
   loger au document la ferait voyager avec un export, ce qui repeindrait le
   builder de celui qui importe. */

import { versionQuery } from "./version.mjs?v=591";

const CLEF_FOND = "fhpc.fond";

/** ⚠️ `localStorage` peut JETER (mode privé, quota, iframe cloisonnée). Un
 *  décor n'est jamais une raison de faire tomber le builder : on retombe sur
 *  le défaut, et on le dit ici plutôt que de laisser un `try` muet.
 *  ⛔ MÊME MÉCANISME QUE `vue.mjs`, pas un second : deux façons de garder une
 *  préférence dans le même produit, c'est une de trop. La seule différence
 *  est le TYPE gardé — un id de collection, pas un booléen. */
function lire(clef) {
  try {
    const valeur = window.localStorage.getItem(clef);
    return typeof valeur === "string" && valeur !== "" ? valeur : null;
  } catch (_) { return null; }
}
function ecrire(clef, valeur) {
  try { window.localStorage.setItem(clef, valeur); } catch (_) { /* sans mémoire, tant pis */ }
}

/** L'id de collection que le JOUEUR a demandé — `null` s'il n'a jamais
 *  choisi. ⛔ Ce n'est PAS « la collection servie » : un id gardé peut
 *  désigner une collection retirée du registre depuis. C'est
 *  `collectionServie` qui tranche, et lui seul. */
export function fondVoulu() { return lire(CLEF_FOND); }
export function setFondVoulu(id) { ecrire(CLEF_FOND, String(id)); }

/** Les collections du registre, dans l'ordre où il les déclare — l'ordre du
 *  Menu, donc. Rend `[]` sur un registre absent ou malformé : sans registre,
 *  `tokens.css` sert déjà le défaut, il n'y a rien à réparer. */
export function collections(registre) {
  const liste = registre && Array.isArray(registre.collections) ? registre.collections : [];
  return liste.filter((c) => c && typeof c.id === "string" && typeof c.jour === "string" && typeof c.nuit === "string");
}

/** 🔴 LA COLLECTION RÉELLEMENT SERVIE, et la seule fonction autorisée à le
 *  dire. Trois cas, nommés plutôt que déduits :
 *    · l'id demandé existe    → c'est lui ;
 *    · l'id demandé n'existe plus (collection retirée, mémoire d'une autre
 *      version du site) → le DÉFAUT du registre, jamais un écran sans fond ;
 *    · aucun défaut nommé     → la première déclarée.
 *  ⚠️ Un id inconnu ne se corrige PAS dans `localStorage` au passage : effacer
 *  le choix d'Eric parce qu'une version intermédiaire ne porte pas sa
 *  collection le lui ferait perdre pour de bon. On sert le défaut, on garde
 *  ce qu'il a demandé. */
export function collectionServie(registre, idVoulu) {
  const liste = collections(registre);
  if (liste.length === 0) return null;
  const demandee = liste.find((c) => c.id === idVoulu);
  if (demandee) return demandee;
  const parDefaut = liste.find((c) => c.id === (registre && registre.defaut));
  return parDefaut || liste[0];
}

/** Les deux URL d'une collection, versionnées comme tout le reste du graphe
 *  (lot 75) : la version est lue dans l'URL de CE module, jamais dans une
 *  constante. `moduleUrl` est un paramètre pour que les tests puissent
 *  mesurer les deux cas — avec et sans query. */
export function urlsDeLaCollection(collection, moduleUrl = import.meta.url) {
  const v = versionQuery(moduleUrl);
  return {
    jour: `url("./assets/${collection.jour}${v}")`,
    nuit: `url("./assets/${collection.nuit}${v}")`
  };
}

/* ══ 🎨 LES ENCRES D'UNE COLLECTION — lot 136, 2026-09-02 ══════════════════
   Eric : *« Les backgrounds ont aussi leurs couleurs de texte et boutons
   associés bien sûr. »*

   ⭐ C'EST UNE EXTENSION DU REGISTRE, PAS UN THÈME DE PLUS. Une collection
   déclare ses encres À CÔTÉ de ses images, dans le même fichier de données —
   donc ajouter une quatrième collection, encres comprises, reste une
   OPÉRATION DE DONNÉES. C'est la promesse que le lot 135 a vérifiée, et elle
   ne se casse pas ici.

   🔴 ET C'EST UN DÉFAUT, PAS UNE DICTATURE : une collection qui ne déclare
   RIEN sert la palette de `tokens.css`, telle quelle. Les trois axes restent
   séparés et aucun ne connaît les autres :

     la COLLECTION  → quelle paire, et quelles encres   (ce module)
     le THÈME       → laquelle des deux                 (media query, CSS pur)
     la NORME       → la palette quand rien n'est dit   (`tokens.css`)

   ⛔ POURQUOI UNE FEUILLE, ET PAS `racine.style.setProperty` COMME LES IMAGES.
   C'est exactement le piège que le garde « 2 quinquies » nomme pour
   `--bg-image` : **une propriété posée EN LIGNE bat la media query pour
   toujours**. Une encre écrite en ligne figerait le thème au chargement — la
   bascule système de 19 h ne repeindrait plus le texte. La feuille, elle,
   PORTE la media query : le thème continue de basculer tout seul, sans un
   écouteur à tenir.

   ⚠️ ET PAS NON PLUS UNE PAIRE `--text-jour` / `--text-nuit` DANS `tokens.css`
   — c'eût été le câblage jumeau de celui des images, et c'est celui que
   j'aurais choisi : il oblige à réécrire la déclaration de chaque encre de la
   palette, donc à toucher un fichier qu'un autre lot lit à la ligne près
   (`tests/double-affichage.test.mjs` lit `--text` sous sa forme littérale).
   ⏳ Le jour où `tokens.css` n'a plus qu'un écrivain, cette feuille s'y replie.
   C'est une dette, elle est dite ici pour être payée — même porte, même
   raison que `fiche.css` (lot 77) et `listes.css` (26/08).

   🔴 LE CONTRAT DE CONTRASTE NE CÈDE PAS, ET C'EST L'ENCRE QUI CÈDE. Le
   registre impose déjà à toute collection les mêmes extrêmes en place
   (142–169 le jour, 74–102 la nuit) pour que la matrice de `shell.css` reste
   valide sans être réécrite ; les encres entrent sous la MÊME loi, et
   `tests/decor.test.mjs` refait la matrice pour chacune. Mesuré en
   construisant ce lot : le bleu de nuit proposé pour `slate` rendait 4,49:1
   sur dalle majeure, sous les 4,5 — c'est LUI qui a bougé (#5590c4), ni le
   voile ni le jeton. */

/** 🔴 LES SEULS JETONS QU'UNE COLLECTION PEUT REPEINDRE — et c'est une liste
 *  BLANCHE, délibérément : le registre est une donnée, et une donnée ne doit
 *  jamais pouvoir écrire du CSS arbitraire dans la page. Un nom hors liste est
 *  ignoré en silence ; le garde, lui, le NOMME.
 *  ⛔ `--surface` n'y est PAS : c'est le VERRE, pas une encre. Le bouger
 *  changerait les trois voiles d'un coup (`--dalle-simple`, `--dalle-inter`)
 *  et la matrice entière — ce n'est pas « la couleur du texte et des boutons »
 *  qu'Eric a demandée, c'est le socle sur lequel elle se mesure.
 *  ⭐ C'EST LA MÊME LISTE QUE LA MATRICE, et un garde tient les deux ensemble
 *  (`tests/decor.test.mjs`) : une encre repeignable que la matrice ne mesure
 *  pas serait une encre qui entre sans passer le contraste. */
export const ENCRES_ADMISES = Object.freeze([
  "text", "text-soft", "text-muted", "border-strong", "accent"
]);

/** Une couleur d'encre : six chiffres hexadécimaux, rien d'autre. ⛔ Pas de
 *  `color-mix`, pas de `var()`, pas de mot-clef — le garde calcule un
 *  contraste sur ces valeurs, et il ne sait le faire que sur du RGB. Une
 *  valeur qu'il ne peut pas mesurer ne doit pas pouvoir entrer. */
const HEXA = /^#[0-9a-f]{6}$/i;

/** Les encres RETENUES d'une collection — `null` si elle n'en déclare aucune
 *  de valide, ce qui veut dire « la palette de `tokens.css` », le défaut.
 *  ⚠️ Le filtre est SILENCIEUX ici et BRUYANT dans le garde : au navigateur,
 *  une encre malformée doit rendre la palette normale plutôt que casser le
 *  décor ; au dépôt, elle doit faire rougir. Les deux ne sont pas en
 *  contradiction — ils répondent à deux questions différentes. */
export function encresDeLaCollection(collection) {
  const declare = collection && collection.encres;
  if (!declare || typeof declare !== "object") return null;
  const retenu = {};
  for (const theme of ["jour", "nuit"]) {
    const bloc = declare[theme];
    if (!bloc || typeof bloc !== "object") continue;
    for (const jeton of ENCRES_ADMISES) {
      const valeur = bloc[jeton];
      if (typeof valeur === "string" && HEXA.test(valeur)) {
        if (!retenu[theme]) retenu[theme] = {};
        retenu[theme][jeton] = valeur;
      }
    }
  }
  return retenu.jour || retenu.nuit ? retenu : null;
}

/** Le TEXTE de la feuille — pur, donc testable sans navigateur. C'est la
 *  seule fonction du module qui connaisse la forme du CSS. */
export function feuilleDesEncres(encres) {
  if (!encres) return "";
  const lignes = (paire) => ENCRES_ADMISES
    .filter((jeton) => paire[jeton])
    .map((jeton) => `  --${jeton}: ${paire[jeton]};`)
    .join("\n");
  const morceaux = [];
  if (encres.jour) morceaux.push(`:root {\n${lignes(encres.jour)}\n}`);
  /* ⭐ LA MEDIA QUERY EST DANS LA FEUILLE, ET C'EST TOUT LE MÉCANISME : le
     thème continue de basculer en CSS pur, sans que ce module soit rappelé. */
  if (encres.nuit) morceaux.push(`@media (prefers-color-scheme: dark) {\n  :root {\n${lignes(encres.nuit).replace(/^ {2}/gm, "    ")}\n  }\n}`);
  return morceaux.join("\n");
}

/** Pose (ou retire) les encres de la collection servie.
 *  ⛔ UNE SEULE FEUILLE, RETROUVÉE PAR SON ATTRIBUT, jamais une de plus par
 *  changement de collection : le joueur qui essaie les trois fonds empilerait
 *  trois feuilles, et la dernière gagnerait — jusqu'au jour où il revient sur
 *  la première, qui perdrait contre elle-même.
 *  ⭐ ET UNE COLLECTION SANS ENCRES VIDE LA FEUILLE plutôt que de la laisser :
 *  revenir au fond par défaut doit rendre la palette par défaut. */
export function appliquerEncres(collection, doc) {
  const d = doc || (typeof document !== "undefined" ? document : null);
  if (!d || !d.head || typeof d.createElement !== "function") return;
  let feuille = d.head.querySelector('style[data-fhpc="encres"]');
  if (!feuille) {
    feuille = d.createElement("style");
    feuille.setAttribute("data-fhpc", "encres");
    d.head.append(feuille);
  }
  feuille.textContent = feuilleDesEncres(encresDeLaCollection(collection));
}

/** Pose la paire sur `:root`. ⛔ NE TOUCHE PAS `--bg-image` : c'est le jeton
 *  du THÈME, et il appartient à `tokens.css`. Écrire l'image finale ici
 *  figerait le thème au moment du chargement — une bascule système en cours
 *  de session ne changerait plus rien.
 *  ⭐ ET LES ENCRES SUIVENT LA MÊME PORTE : un seul appelant pour un seul
 *  geste (« servir cette collection »), sinon un site du dépôt reposerait les
 *  images sans reposer les encres, et le texte resterait celui d'avant. */
export function appliquerCollection(collection, racine, doc) {
  if (!collection || !racine || !racine.style) return;
  const { jour, nuit } = urlsDeLaCollection(collection);
  racine.style.setProperty("--bg-jour", jour);
  racine.style.setProperty("--bg-nuit", nuit);
  appliquerEncres(collection, doc);
}

/** Le registre, chargé depuis `assets/`. Rend `null` si le fichier manque ou
 *  ne se lit pas : le builder sert alors la collection écrite dans
 *  `tokens.css` et le Menu n'affiche pas le réglage — ⛔ jamais une liste
 *  vide présentée comme un choix. */
export async function chargerRegistre({ base = "." } = {}) {
  try {
    const reponse = await fetch(`${base}/assets/backgrounds.measured.json${versionQuery(import.meta.url)}`);
    if (!reponse || !reponse.ok) return null;
    return await reponse.json();
  } catch (_) { return null; }
}
