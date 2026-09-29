/* ══ LA POUBELLE — L'ORGANE, SANS SON ÉCRAN — lot 351 ═══════════════════════
   ⚖️ Eric, 29/09, à « Delete a book : comment choisit-on le livre à effacer ? » :
   *« tout simplement, pas de bouton delete a book, juste une poubelle à côté comme
   My Characters »*. Et pour `My characters`, le même jour : *« la poubelle tout à
   droite »* de chaque ligne, **40 × 40**.
   ⭐ UN SEUL ORGANE POUR LES DEUX ÉCRANS : `Layers` la pose au lot 351, `My
   characters` au lot 352. Elle descend donc ici, feuille SANS IMPORT — le geste des
   lots 191 (`interrupteurs.mjs`) et 213 (`interrupteur-organe.mjs`) : un second
   écran la prend sans traîner le premier derrière lui. ⛔ Deux copies d'un même
   dessin sont deux écrivains pour une seule loi.

   📐 SA COTE EST CELLE DU CARRÉ DU RELIEF : dessin **40 × 40**, cible **44 × 44**
   (`--touch` ne cède jamais) — la géométrie de `button.porte-carree` (lot 311), le
   retrait du relief sur les QUATRE côtés. Son habit est celui de la famille : elle
   entre dans le patron PAR LA LISTE (`shell.css`, et l'inventaire
   `tests/bouton-inventaire.test.mjs`).
   🔴 SON LISERÉ EST ROUGE : elle DÉFAIT (§6, les trois verbes — `Cancel`, `Delete`,
   `Remove` portent le rouge de ce qui coûte). ⛔ Aucune couleur n'est écrite ici :
   la feuille la pose.
   ✏️ ELLE EST DESSINÉE, JAMAIS UN GLYPHE (la loi du livre et de l'interrupteur) :
   un couvercle, sa poignée, la cuve et deux traits, en SVG au trait (`currentColor`),
   le dessin du plan v10. `aria-hidden` sur le dessin : le bouton porte son NOM
   (`aria-label`), et c'est ce nom que le lecteur d'écran lit.
   ⛔ ELLE N'EFFACE RIEN ELLE-MÊME : elle émet un geste, et c'est l'écran qui pose la
   question (« Delete this book? ») avant que la coquille n'efface.
   ⏳ ELLE SAIT ÊTRE ÉTEINTE (`eteinte`) — présente, `disabled`, `data-reserve` : la forme
   d'une place réservée (`menu-reglage-impossible-reste-visible`), et c'est l'écran qui pose
   le mot « soon » sous elle. Lot 351 : Eric, 29/09, « La poubelle d'un livre efface son contenu de son lieu de stockage. Ce lieu de stockage est
   décidé par le bouton vault. » Tant qu'aucun livre ne vit dans
   ce stockage, `Layers` la pose éteinte. Le geste reste câblé : un bouton `disabled` ne
   l'émet pas, et le jour où elle s'allume, la question l'attend. */

/* ⛔ SES HELPERS SONT À ELLE — l'idiome des feuilles sans import (voir la tête de
   `interrupteur-organe.mjs`). */
const NS = "http://www.w3.org/2000/svg";
function svg(doc, nom, attrs = {}, enfants = []) {
  const n = doc.createElementNS(NS, nom);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  for (const e of enfants) n.append(e);
  return n;
}

/** Le dessin de la poubelle — le trait du plan v10 (couvercle, poignée, cuve, deux
 *  traits), dans une boîte de 24. */
export const TRAIT_DE_LA_POUBELLE = "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6";

/** LA POUBELLE — un bouton carré, dessiné, qui émet et n'efface pas.
 *  @param {{mot: string, onClick: () => void, eteinte?: boolean}} p `mot` = son nom
 *    accessible (« Delete Player's Handbook (2024) ») — ⛔ jamais vide : un bouton sans
 *    nom est un bouton muet pour un lecteur d'écran. `eteinte` : présente, jamais tapée. */
export function poubelle({ mot, onClick, eteinte = false }) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "poubelle";
  b.setAttribute("aria-label", mot);
  b.title = mot;
  if (eteinte) {
    b.disabled = true;
    b.dataset.reserve = "true";
  }
  if (typeof document.createElementNS === "function") {
    b.append(svg(document, "svg", { class: "poubelle-dessin", viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false" }, [
      svg(document, "path", { d: TRAIT_DE_LA_POUBELLE })
    ]));
  }
  if (typeof onClick === "function") b.addEventListener("click", onClick);
  return b;
}
