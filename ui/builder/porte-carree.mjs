/* ══ LA PORTE CARRÉE — les trois portes à image du pied d'Équipement — lot 311, 2026-09-27 ══
   ⚖️ Eric, 27/09, mot pour mot : *« Parfait je valide les 3. Dans les 3 écrans. Tu gardes le
   bouton send toujours centré. Tu dégages le livre qui n'a pas d'utilité dans équipement. Tu
   places les 3 carrés répartis équitablement à gauche de send »*, puis *« Quand on est sur
   l'écran en question le bouton est grisé »*. NORMES `equipement-portes-carrees`.

   ⛔ MODULE FEUILLE : aucun import, aucune cote, aucune couleur. Il ne sait pas sur quel écran
   il est posé, et c'est la condition pour que les trois écrans d'Équipement (Gear, le sac,
   Wares) portent LE MÊME organe. Sa matière (le relief, l'image en masque, le mot T0 italique)
   vit au socle, dans `shell.css` (`.porte-carree`) ; ses images dans `tokens.css`
   (`--porte-image-*`) ; ses cotes au plan de chaque écran (sorte `porte-carree`).
   ⭐ LA DOCTRINE DU JETON (`jeton-objet.mjs`), APPLIQUÉE UNE FOIS DE PLUS : un organe que
   plusieurs écrans portent descend dans un module feuille, sous un nom neutre.

   ⚖️ LE CARRÉ DE L'ÉCRAN COURANT (Gear sur Gear, Pack sur le sac, Wares sur Wares) ne mène nulle
   part : il est GRISÉ — `disabled`, donc l'état désarmé des portes du socle (`:disabled` :
   liseré retiré, voile `--organe-eteint`) — et il porte `aria-current="page"`. ⛔ Il ne reçoit
   AUCUN écouteur : un clic sur l'écran où l'on est serait un clic qui ment. ⛔ Et il n'est pas
   retiré : Eric veut les trois, partout, au même endroit. */

/** Les trois carrés, DANS L'ORDRE DU PIED — le même sur les trois écrans.
 *  · `id` : la porte (`data-porte`), celle que l'écran publie par `surPorte` — la même clef
 *    que l'ancien bouton à mot, donc le même geste ;
 *  · `mot` : ce qui est écrit sur l'image (Eric, 27/09 : `Backpack`, trop large, devient `Pack`) ;
 *  · `nom` : le nom accessible — l'écran où la porte mène. */
export const PORTES_CARREES = Object.freeze([
  Object.freeze({ id: "backpack", mot: "Pack", nom: "Backpack" }),
  Object.freeze({ id: "wares", mot: "Wares", nom: "Wares" }),
  Object.freeze({ id: "gear", mot: "Gear", nom: "Gear" }),
]);

function el(balise, classe, texte) {
  const n = document.createElement(balise);
  if (classe) n.className = classe;
  if (texte !== undefined) n.textContent = texte;
  return n;
}

/** UNE porte carrée.
 *  @param {{id:string, mot:string, nom:string}} porte  une entrée de `PORTES_CARREES`
 *  @param {{courant?:string, surPorte?:(id:string)=>void}} [options]
 *  @returns {HTMLButtonElement} */
export function porteCarree(porte, options = {}) {
  const b = el("button", "porte-carree");
  b.type = "button";
  b.dataset.porte = porte.id;
  b.setAttribute("aria-label", porte.nom);
  /* l'image est un FILIGRANE peint en masque : on ne la lit pas, le mot et le nom suffisent */
  const image = el("span", "porte-carree-image");
  image.setAttribute("aria-hidden", "true");
  b.append(image, el("span", "porte-carree-mot", porte.mot));
  if (porte.id === options.courant) {
    b.disabled = true;
    b.setAttribute("aria-current", "page");
  } else {
    b.addEventListener("click", () => options.surPorte && options.surPorte(porte.id));
  }
  return b;
}

/** LE GROUPE DES TROIS, dans l'ordre du pied. ⭐ La grille du pied (`shell.css`) le pose dans
 *  la cellule de gauche et le répartit ; l'écran n'a qu'à le mettre avant `Send`.
 *  @param {{courant?:string, surPorte?:(id:string)=>void}} [options]
 *  @returns {HTMLElement} */
export function portesCarrees(options = {}) {
  const g = el("div", "portes-carrees");
  for (const porte of PORTES_CARREES) g.append(porteCarree(porte, options));
  return g;
}
