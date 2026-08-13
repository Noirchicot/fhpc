/* ══ LE COMPOSANT DE CONFIRMATION — la PREMIÈRE boîte de dialogue du
   builder (lot 46, commande §2b). Le builder n'en avait AUCUNE avant ce
   lot — celle-ci sera copiée par les suivants, elle naît donc RÉUTILISABLE :
   zéro connaissance d'un verbe de document, zéro chemin, zéro règle de jeu.
   Elle ne sait que trois choses : un titre, une liste de choses PERDUES
   (nommées — jamais un compte, jamais « êtes-vous sûr ? »), et deux
   callbacks vides de sens pour elle.

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
 */
export function renderConfirmDialog({ title, items, confirmLabel, cancelLabel, onConfirm, onCancel }) {
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

  actions.append(cancel, confirm);
  wrap.append(actions);
  return wrap;
}
