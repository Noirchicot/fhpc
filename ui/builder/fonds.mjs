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

import { versionQuery } from "./version.mjs?v=447";

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

/** Pose la paire sur `:root`. ⛔ NE TOUCHE PAS `--bg-image` : c'est le jeton
 *  du THÈME, et il appartient à `tokens.css`. Écrire l'image finale ici
 *  figerait le thème au moment du chargement — une bascule système en cours
 *  de session ne changerait plus rien. */
export function appliquerCollection(collection, racine) {
  if (!collection || !racine || !racine.style) return;
  const { jour, nuit } = urlsDeLaCollection(collection);
  racine.style.setProperty("--bg-jour", jour);
  racine.style.setProperty("--bg-nuit", nuit);
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
