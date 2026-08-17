/* ══ LE PANNEAU DE LORE — lot 82 ═════════════════════════════════════════
   📐 Croquis A d'Eric (2026-08-15), annoté en toutes lettres sous le bouton :
   *« lore sends to full page description either FH or SRD »*, et la page
   dessinée porte en tête *« return to character creation »*.

   ⭐ CE QUE CE FICHIER RÉPARE, ET IL ATTENDAIT DEPUIS LE LOT 77 : `LORE`
   était `disabled`. `catalogue.mjs` écrivait déjà pourquoi — *« il demande le
   panneau plein écran, un organe partagé par trois écrans qui a son propre
   lot. Il reste `disabled` : un bouton qui ne répond pas est pire qu'un
   bouton qui s'annonce éteint. »* Voici le lot.

   ── CE QU'IL SAIT FAIRE, ET RIEN D'AUTRE ────────────────────────────────
   Il rend un nœud : un titre, la prose, un retour. Il ne connaît ni la
   coquille ni les verbes du moteur (contrat d'écran, SOCLE.md) — on lui
   passe un `query` et un `onAction`, il rend et il signale.

   ⛔ IL N'EST PAS UN POPUP. `popup.mjs` implémente l'invariant III.4 — *« un
   popup se ferme en CLIQUANT DEHORS »* — et son en-tête prévient lui-même de
   ne pas le confondre avec la fermeture d'une dalle majeure. Le lore n'est ni
   l'un ni l'autre : c'est une PAGE, elle occupe la scène, et on en revient
   par un geste nommé. Un texte de deux cents mots qui disparaît parce que le
   pouce a effleuré le bord serait insupportable à lire.

   ⭐ ET IL SERT LES DEUX ÉCRANS À FICHE. Les douze classes portent leur lore
   dans la même couche que les douze espèces (`fh-lore-en`, 24 records) ; le
   bouton est dessiné une fois par `renderFicheActions`, pour les deux. Écrire
   ce panneau côté Species seul le ferait recopier côté Class le jour d'après
   — la loi du dépôt, et elle a déjà coûté. */

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/** Le texte de lore d'un record, ou `null`.
 *
 *  ⛔ AUCUN REPLI INVENTÉ. Si la couche `fh-lore-en` n'est pas montée — un
 *  personnage SRD pur, exactement le cas que la loi §0.12 protège — il n'y a
 *  pas de lore, et le panneau doit le DIRE au lieu d'afficher une page vide
 *  ou un texte fabriqué. C'est la même règle que la fiche : « jamais un tiret
 *  inventé pour remplir ». */
export function loreDe(query, kind, id) {
  const view = query({ kind, id });
  const lore = view && view.record && view.record.data && view.record.data.lore;
  return lore && typeof lore.text === "string" && lore.text.length > 0 ? lore : null;
}

/** LE PANNEAU. `onAction` reçoit `{ kind: "lore", ref: null }` au retour —
 *  c'est la coquille qui possède l'état, jamais ce module (SOCLE.md : « l'état
 *  d'un panneau vit dans `state`, jamais dans le DOM »). */
export function renderLorePanel({ query, kind, id, onAction }) {
  const act = typeof onAction === "function" ? onAction : () => {};
  const view = query({ kind, id });
  const nom = view && view.record ? view.record.name : id;
  const lore = loreDe(query, kind, id);

  const page = el("section", "lore-page");
  page.dataset.lore = kind;

  /* ⭐ LE RETOUR EST EN TÊTE, PAS EN PIED, et c'est le croquis qui le place :
     *« return to character creation »* est écrit tout en haut de la page
     dessinée. La raison tient à la lecture — au bas d'un texte de deux cents
     mots, le retour serait à trouver après avoir tout fait défiler ; en tête,
     il est là au moment où on décide d'arrêter de lire. */
  const retour = el("button", "lore-retour", [text("← Back to character creation")]);
  retour.type = "button";
  retour.addEventListener("click", () => act({ kind: "lore", ref: null }));
  page.append(retour);

  page.append(el("h2", "lore-titre", [text(nom)]));

  if (!lore) {
    /* La phrase nomme la COUCHE, pas un incident : c'est une pile SRD pure,
       un état légitime du produit, pas une panne. */
    page.append(el("p", "lore-vide", [text(
      "No Fate's Hand lore is mounted for this entry — the fh-lore-en layer is not in this character's stack."
    )]));
    return page;
  }

  /* ⛔ LE TEXTE EST DÉCOUPÉ EN PARAGRAPHES, PAS RENDU D'UN BLOC. La couche
     porte des sauts de ligne doubles ; les écraser rendrait deux cents mots
     en un seul pavé. Et le découpage se fait sur la DONNÉE, jamais par du
     HTML injecté — aucun `innerHTML` ne traverse ce dépôt. */
  const corps = el("div", "lore-corps");
  for (const para of lore.text.split(/\n{2,}/)) {
    const t = para.trim();
    if (t.length > 0) corps.append(el("p", null, [text(t)]));
  }
  page.append(corps);

  return page;
}
