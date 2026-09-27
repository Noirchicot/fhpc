/* ══ LE COLLECTEUR D'ENVOI ET SON `Send to` — les deux organes du pied du sac et de Wares — lot 315 ══
   ⚖️ Eric, 2026-09-27, mot pour mot : *« Le drag and drop de wares ne fonctionne tj pas »* ·
   *« Harmonise le pied de page pack et wares, prends pack comme modèles, déplace encumbrance sous
   l'or dans wares »*. NORMES `equipement-wares-pied-comme-pack` et `equipement-wares-collecteur-garde-l-objet`.

   ⛔ MODULE FEUILLE : aucun import, aucune cote, aucune couleur — la doctrine de `jeton-objet.mjs` et
   de `porte-carree.mjs`, appliquée une fois de plus. Il ne sait pas sur quel écran il est posé : il
   rend un NŒUD, et chaque écran y branche SES gestes (le sac son glisser, Wares son tap vers X2).
   ⭐ CE QU'IL RÉPARE : Wares fabriquait son propre collecteur (`.wares-collecteur`, un mot et rien
   d'autre) et son propre `select.wares-send-vers`, plus petit. Deux habits pour un même organe
   divergent au premier réglage — et celui de Wares ne savait pas RETENIR un objet : le dépôt
   partait au Tally sans que rien ne change à l'écran (📏 mesuré en ligne à la v854/v855).
   Son habit vit au socle, une fois : `.gear-collecteur`, `.gear-nom`, `.jeton-nom`, `.gear-qte`,
   `.sac-destination`, `.pipeline-dropdown` (`shell.css`).
   ⏳ DETTE DE NOM, NOMMÉE ET NON PAYÉE ICI : `gear-collecteur` et `sac-destination` disent encore
   l'écran qui les a portés le premier. Renommer, c'est toucher la feuille de trois écrans et
   quatre gardes — un lot à lui. */

function el(balise, classe, texte) {
  const n = document.createElement(balise);
  if (classe) n.className = classe;
  if (texte !== undefined) n.textContent = texte;
  return n;
}

/** Le collecteur d'envoi — UN jeton (loi du 29/08), et il ne retient qu'UN objet
 *  (Eric, 16/09 : *« un item dans le collecteur, pas 2 ; si on veut plus c'est un Tally »*).
 *  @param {object} o
 *   · `retenu`     — `{ nom, qte? }` ou `null` : ce qu'il porte ;
 *   · `creneau`    — le nom de créneau que `glisser.mjs` lit (`data-creneau`) ;
 *   · `resteCible` — plein, reste-t-il une cible ? ⭐ Le sac dit non (un second dépôt ne fait
 *                    rien), Wares dit oui : un second dépôt REMPLACE le premier (lot 315).
 *  @returns {HTMLElement} le nœud, sans aucun geste — l'écran les pose. */
export function collecteurDEnvoi({ retenu = null, creneau = "collecteur", resteCible = false } = {}) {
  const c = el("div", "gear-collecteur");
  c.dataset.organe = "collecteur";
  if (!retenu || resteCible) { c.dataset.creneau = creneau; c.dataset.vise = "false"; }
  c.dataset.compte = String(retenu ? 1 : 0);
  if (!retenu) {
    c.append(el("span", "gear-nom", "Send collector"));
    c.setAttribute("aria-label", "Send collector — empty");
    return c;
  }
  /* ⚖️ PLEIN, IL PORTE L'OBJET LUI-MÊME — Eric, 16/09 au soir : *« lorsqu'un token va dans le
     collecteur, il ne doit pas rester à sa place initiale »*. ⛔ MAIS PAS SA BANDE : *« il n'y a
     pas de token dans le collecteur, juste le nom »*. */
  c.dataset.occupe = "oui";
  const objet = el("span", "jeton-nom", retenu.nom);
  if (retenu.qte > 1) objet.append(" ", el("span", "gear-qte", `×${retenu.qte}`));
  c.append(objet);
  c.setAttribute("aria-label", `Send collector — ${retenu.nom}`);
  return c;
}

/** Le dropdown `Send to` — l'organe du §8 (`.pipeline-dropdown`) dans sa boîte, qui porte la cote
 *  du plan (`data-organe="send-vers"`). ⛔ On ne peut rien écrire DANS un `<select>` natif : la
 *  boîte porte l'organe, le select la remplit.
 *  @param {object} o
 *   · `destinations` — `[{ valeur, mot, actif? }]` ; ⛔ `actif: false` se montre et ne se choisit pas ;
 *   · `destination`  — la valeur choisie ;
 *   · `surDestination(valeur)` — le geste. */
export function destinationDEnvoi({ destinations = [], destination = null, surDestination = null, organe = "send-vers" } = {}) {
  const boite = el("div", "sac-destination");
  boite.dataset.organe = organe;
  /* ⚖️ LOT 318 — L'ÉTIQUETTE « destination », SUR LES TROIS ÉCRANS. Eric, 27/09 : « Oui harmonise les
     étiquettes de destination · Pour les 3 · Même typo même taille couleur etc ». ⭐ C'est celle que
     Gear portait seul depuis le 16/09 (« collé au haut, en T1, en italique, couleur un peu moins
     blanc flashy ») ; elle vit maintenant ICI, dans l'organe que Gear, Pack et Wares importent —
     une seule fabrique, donc une seule typo. ⛔ Elle ne se lit pas : le select porte le nom. */
  const mot = el("span", "destination-mot", "destination");
  mot.setAttribute("aria-hidden", "true");
  const s = el("select", "pipeline-dropdown");
  s.setAttribute("aria-label", "Send to");
  for (const d of destinations) {
    const opt = el("option", null, d.mot);
    opt.value = d.valeur;
    if (d.actif === false) opt.disabled = true;
    if (d.valeur === destination) opt.selected = true;
    s.append(opt);
  }
  s.addEventListener("change", () => surDestination && surDestination(s.value));
  boite.append(mot, s);
  return boite;
}
