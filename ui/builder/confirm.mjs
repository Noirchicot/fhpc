/* ══ LE COMPOSANT DE CONFIRMATION — la PREMIÈRE boîte de dialogue du
   builder (lot 46, commande §2b). Le builder n'en avait AUCUNE avant ce
   lot — celle-ci sera copiée par les suivants, elle naît donc RÉUTILISABLE :
   zéro connaissance d'un verbe de document, zéro chemin, zéro règle de jeu.
   Elle ne sait que trois choses : un titre, une liste de choses PERDUES
   (nommées — jamais un compte, jamais « êtes-vous sûr ? »), et deux
   callbacks vides de sens pour elle.

   ⭐ LOT 192 — ET UNE TROISIÈME VOIE, FACULTATIVE. Eric, 10/09 : *« il faut
   que la version FH reste sauvegardée, donc ça duplique le perso. Au moins
   poser la question : voulez-vous garder une sauvegarde de la version
   FH ? »*. Une confirmation qui coupe un jeu de règles a donc parfois trois
   sorties, pas deux : garder, couper, ou GARDER UNE COPIE PUIS couper. Le
   composant reste aussi ignorant qu'avant — `troisiemeVoie` est un libellé et
   un callback sans argument, posé AU-DESSUS de la paire annuler · confirmer
   (regardé au navigateur le 10/09 : au milieu de la rangée, son libellé long
   faisait plier la paire en trois lignes ragées ; sur sa propre ligne, pleine
   largeur, la paire reste une paire) ; c'est l'appelant
   (`renderConfirmationPile`, universe-step.mjs) qui sait que ce clic
   sauvegarde puis éteint. ⛔ Pas un `confirm()` du navigateur, pas une
   seconde boîte : la même, avec une voie de plus quand l'appelant en donne une.

   MÊME LOI QUE `renderPicker` (`carnet.mjs`, tête de fichier) : « ce module
   ne connaît AUCUN verbe : onSelect/onClear reçoivent la valeur brute,
   c'est L'APPELANT qui choisit choose/set/clear ». Ici pareil —
   `onConfirm`/`onCancel` sont appelés SANS ARGUMENT, l'appelant décide ce
   que confirmer ou annuler DÉCLENCHENT (un `resetSkills`, demain autre
   chose). Ce fichier ne lit ni `decisions[]` ni `document` — voir
   INVENTAIRE-LOT-46.md, « où j'ai mis ce composant et pourquoi » : il vit
   à CÔTÉ de `carnet.mjs`, pas dedans, parce que `carnet.mjs` ne connaît que
   des composants qui LISENT LE CARNET (`planAt`/`decisions[]`) — celui-ci
   ne lit rien du tout, c'est une boîte de dialogue générique, une famille
   différente. */

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/**
 * @param {object} opts
 * @param {string} opts.title           ce qui va se passer, en une phrase — jamais « êtes-vous sûr ? »
 * @param {string[]} [opts.items]       les choses perdues, NOMMÉES (ex: ["Arcana", "Investigation"])
 * @param {string} [opts.confirmLabel]  "Confirm" par défaut
 * @param {string} [opts.cancelLabel]   "Cancel" par défaut
 * @param {() => void} [opts.onConfirm]
 * @param {() => void} [opts.onCancel]
 * @param {{label: string, onClick?: () => void}} [opts.troisiemeVoie]
 *        une troisième sortie, sur sa ligne au-dessus de la paire — absente,
 *        la boîte rend exactement ce qu'elle rendait avant le lot 192
 */
export function renderConfirmDialog({ title, items, confirmLabel, cancelLabel, onConfirm, onCancel, troisiemeVoie }) {
  const wrap = el("div", "confirm-dialog");
  wrap.setAttribute("role", "alertdialog");
  wrap.append(el("p", "confirm-dialog-title", [text(title)]));

  if (Array.isArray(items) && items.length > 0) {
    const list = el("ul", "confirm-dialog-items");
    for (const item of items) list.append(el("li", null, [text(item)]));
    wrap.append(list);
  }

  const actions = el("div", "confirm-dialog-actions");
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "confirm-dialog-cancel";
  cancel.textContent = cancelLabel || "Cancel";
  cancel.addEventListener("click", () => { if (onCancel) onCancel(); });

  const confirm = document.createElement("button");
  confirm.type = "button";
  confirm.className = "confirm-dialog-confirm";
  confirm.textContent = confirmLabel || "Confirm";
  confirm.addEventListener("click", () => { if (onConfirm) onConfirm(); });

  /* La troisième voie se pose AVANT la paire, sur sa propre ligne (la feuille
     lui donne toute la largeur) : elle n'est ni l'annulation (elle finit par
     confirmer) ni la confirmation nue (elle fait quelque chose avant), et
     l'ordre du DOM est l'ordre visuel — le clavier la rencontre là où l'œil
     la voit. Un libellé sans texte n'est pas une voie : on ne rend pas un
     bouton muet. */
  if (troisiemeVoie && typeof troisiemeVoie.label === "string" && troisiemeVoie.label !== "") {
    const voie = document.createElement("button");
    voie.type = "button";
    voie.className = "confirm-dialog-troisieme-voie";
    voie.textContent = troisiemeVoie.label;
    voie.addEventListener("click", () => { if (troisiemeVoie.onClick) troisiemeVoie.onClick(); });
    actions.append(voie);
  }
  actions.append(cancel, confirm);
  wrap.append(actions);
  return wrap;
}
