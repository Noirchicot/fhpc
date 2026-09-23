/* ══ LE JETON D'UN OBJET POSSÉDÉ — son corps et ses quatre marques ═══════════
   ⛔ MODULE FEUILLE : aucun import, aucune cote, aucune couleur. Il ne sait pas
   sur quel écran il est posé, et c'est la condition pour qu'il y en ait deux.

   🔴 POURQUOI IL EXISTE, ET C'EST UNE LEÇON PAYÉE. Eric, 17/09, sur l'interrupteur
   du menu que j'étais en train de recopier au lieu de le reprendre : *« t'es pas
   foutu de récupérer le bouton du menu et de le mettre ici, bordel ! »*. Le même
   piège attendait ici : le sac (lot 214) allait redessiner la tuile de R.
   ⭐ LA DOCTRINE, APPLIQUÉE POUR LA TROISIÈME FOIS *(l'interrupteur, les chevrons
   de Destiny, ce jeton)* : un organe que DEUX écrans portent descend dans un
   module feuille, et il prend un nom NEUTRE. `gear-objet` disait l'écran qui
   l'avait porté le premier ; `jeton-nom` dit ce que c'est.

   ⚖️ CE QU'IL DESSINE — le croquis d'Eric du 17/09, et rien d'autre :
     · le NOM, sur trois lignes au plus ;
     · une BANDE de quatre marques qu'il ne touche jamais — verrou à gauche,
       quantité encadrée au centre, cercle d'encre à droite, et le rond violet
       qui remplit le centre de ce cercle.
   ⛔ LES COTES VIVENT DANS `tokens.css` (`--jeton-marque`, `--jeton-bande`) et
   la feuille les lit. Ce module ne pose AUCUN nombre. */

/** Les trois états, dans l'ordre où le croquis les lit : verrou, porté, harmonisé.
 *  ⭐ La table voyage avec l'organe — personne n'a à se rappeler que `harmonise`
 *  lit `attuned`. */
const MARQUES = Object.freeze([
  ["verrou", "locked"], ["equipe", "equipped"], ["harmonise", "attuned"]
]);

function el(balise, classe, texte) {
  const n = document.createElement(balise);
  if (classe) n.className = classe;
  if (texte !== undefined) n.textContent = texte;
  return n;
}

/** Le corps d'un jeton posé : le nom, puis la bande des marques.
 *  @param {{nom:string, qte?:number, equipped?:boolean, attuned?:boolean, locked?:boolean}} pose
 *  @returns {HTMLElement[]} les nœuds, dans l'ordre — l'appelant les append où il veut.
 *
 *  ⚖️ LA QUANTITÉ EST UNE MARQUE, PLUS UN MORCEAU DU NOM — Eric, 17/09 : *« la
 *  quantité encadrée ou pas, avec un x99 en T0 »*. ⛔ Elle suivait le nom sur sa
 *  ligne et lui mangeait des caractères : un nom long perdait sa fin pour afficher
 *  « ×2 ». ⭐ Et elle reste MUETTE au lecteur d'écran — le nom accessible de la
 *  case la dit déjà, une fois et en toutes lettres (`motDuJeton`). */
export function corpsDuJeton(pose) {
  const noeuds = [el("span", "jeton-nom", pose.nom)];
  /* ⚖️ LA DIAGONALE DE LA RECETTE — Eric, 2026-09-23 : *« une diagonale de bas
     en haut, moitié inférieure droite bleue »*.
     ⛔ CE N'EST PAS UNE CINQUIÈME MARQUE : les quatre marques vivent dans la
     bande haute de 12 (`jeton-quatre-marques-de-la-bande`), et ce fond n'y
     entre pas. Il ne déplace pas le nom et ne prend aucune des quatre places.
     ⭐ ET IL EST DESSINÉ ICI, dans l'organe, pas dans les écrans qui l'appellent :
     ils portent le MÊME jeton, et deux copies divergeraient à la première marque
     ajoutée (doctrine du lot 214).
     🔴 ILS SONT TROIS, ET CE COMMENTAIRE EN DISAIT DEUX — « R et le sac ». Wares
     appelle `corpsDuJeton` comme eux (`wares-ecran.mjs`), et c'est justement lui
     qui ne posait pas `recette` : les kits du catalogue n'ont porté aucune
     diagonale entre le lot qui l'a créée et le lot 256, sans qu'aucun garde
     rougisse. ⛔ UNE LISTE PAR NOM EST INCOMPLÈTE PAR CONSTRUCTION — et celle-ci
     vivait dans la phrase qui expliquait de ne pas se répéter. La liste qui fait
     foi est `grep -l corpsDuJeton ui/builder/*.mjs`, pas celle-ci ; si tu ajoutes
     un quatrième écran, c'est LUI qui doit apprendre la pose.
     ⛔ MUET AU LECTEUR D'ÉCRAN : `motDuJeton` dit déjà « recipe » en toutes
     lettres — une couleur que rien ne prononce est une information réservée
     aux voyants. */
  if (pose.recette === true) {
    const fond = el("span", "jeton-recette");
    fond.setAttribute("aria-hidden", "true");
    /* ⛔ AVANT LE NOM, PAS APRÈS : un fond posé ensuite le recouvrirait. L'ordre
       du DOM suffit, et il évite un `z-index` — qui aurait fallu accorder avec
       ceux des quatre marques. */
    noeuds.unshift(fond);
  }
  const marques = el("span", "jeton-marques");
  if (pose.qte > 1) {
    const q = el("span", "jeton-qte", `×${pose.qte}`);
    q.setAttribute("aria-hidden", "true");
    marques.append(q);
  }
  for (const [marque, clef] of MARQUES) {
    const m = el("span", "jeton-marque");
    m.dataset.marque = marque;
    m.dataset.etat = pose[clef] === true ? "oui" : "non";
    m.setAttribute("aria-hidden", "true");
    marques.append(m);
  }
  noeuds.push(marques);
  return noeuds;
}

/** Ce que le lecteur d'écran entend d'un jeton posé, à la suite du nom de sa place.
 *  ⭐ LES TROIS ÉTATS SE DISENT, pas seulement le port : une marque visible que rien
 *  ne prononce est une information réservée aux voyants. */
export function motDuJeton(pose) {
  return `${pose.nom}${pose.qte > 1 ? ` ×${pose.qte}` : ""}`
    + `${pose.recette ? ", recipe" : ""}`
    + `${pose.equipped ? ", equipped" : ""}`
    + `${pose.attuned ? ", attuned" : ""}`
    + `${pose.locked ? ", locked" : ""}`;
}
