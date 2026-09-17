/* ══ L'INTERRUPTEUR — L'ORGANE, SANS SON ÉCRAN — lot 213 ═══════════════════
   ⛔ CE MODULE N'IMPORTE RIEN, ET C'EST SA RAISON D'ÊTRE. Il descend de
   `layers-ecran.mjs` — qui importe `universe-step.mjs`, qui importe la moitié
   du builder — pour qu'un SECOND écran puisse le prendre sans traîner tout
   `Layers` derrière lui. C'est exactement le geste du lot 191 avec la table
   des couches (`interrupteurs.mjs`) : la feuille descend, l'écran réexporte,
   et les lecteurs d'origine ne changent pas d'adresse.

   ⚖️ POURQUOI MAINTENANT — Eric, 17/09 au soir, en voyant la fiche X1 :
   *« bouton du menu, la base de laquelle tu dois partir ! »*, puis
   *« t'es pas foutu de récupérer le bouton du menu et de le mettre ici ! »*.
   ⛔ J'avais RECOPIÉ ses formules dans une classe à moi (`.x1-bascule`) au
   lieu de prendre l'organe. Deux copies d'un même dessin sont deux écrivains
   pour une seule loi — la faute que `shell.css` a déjà payée le 16/09 avec le
   patron des boutons, et qui se répare par la SUPPRESSION du second écrivain.

   ⭐ DEUX FABRIQUES, UNE SEULE MATIÈRE :
     · `pisteDInterrupteur` rend la PISTE et son POUCE — le dessin, seul ;
     · `interrupteur` rend la LIGNE du tableau de commande (mot, note, piste),
       et c'est elle que `Layers` et `Universe` appellent, inchangée.
   La fiche X1 prend la première : elle compose sa propre ligne (un titre à
   gauche, l'état dessous), et le dessin reste celui du menu, au pixel près. */

/* ⛔ SES DEUX HELPERS SONT À LUI — `el` et `text` sont recopiés de son écran
   d'origine, cinq lignes chacun, comme les porte déjà `abilities-step`,
   `background-step` et les autres. C'est l'idiome du dépôt : une feuille sans
   import ne va pas chercher un utilitaire à trois fichiers de distance. */
function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/** La piste et son pouce — ⛔ AUCUNE COULEUR ICI : la feuille lit `data-on`,
 *  posé par l'HÔTE (la ligne du menu, le bouton de la fiche). C'est ce qui
 *  rend l'organe portable sans le dupliquer. */
export function pisteDInterrupteur() {
  return el("span", "interrupteur-piste", [el("span", "interrupteur-pouce")]);
}

/* ══ L'INTERRUPTEUR — Eric, 2026-09-08 ════════════════════════════════════
   *« Il faut créer ce putain de switch on/off rouge-vert, qui prend peu de
   place — genre on en met un par ligne. »*

   ⭐ UN SEUL ORGANE POUR LES DEUX ESPÈCES QU'ON AVAIT. Le Menu portait DEUX
   dessins pour « allumé / éteint » : la piste-et-pouce de `.bascule-ligne`
   (les règles) et le mot-dans-une-boîte de `.universe-bascule` (tutoriel,
   double vue) — `A-TRANCHER §C26 ②` les nommait tous les deux et demandait
   qu'ils prennent le rouge et le vert. Ils prennent la même forme, et c'est
   celle-ci : une LIGNE, le mot à gauche, la piste à droite.

   🔴 LE ROUGE À GAUCHE, LE VERT À DROITE — Eric, 06/09 : *« le cercle à gauche
   = rouge, à droite = vert »*. La couleur DIT l'état, la position le REDIT, et
   `aria-checked` le dit une troisième fois — trois canaux, comme la loi des
   jetons. ⛔ Aucune couleur n'est écrite ici : la feuille lit `data-on`.

   ⚖️ `role="switch"` ET PAS `aria-pressed` : un interrupteur est un état vrai
   ou faux, pas un bouton qu'on enfonce. Le rôle promet exactement ce que
   l'organe fait — cliquer inverse — et rien de plus (⛔ pas de `radio`, qui
   promettrait des flèches que rien n'implémente, voir `carnet.mjs`).

   📏 PETIT, PARCE QU'ERIC LE VEUT PETIT : piste 36 × 20, pouce 16. La LIGNE,
   elle, garde `--touch` 44 — on vise la ligne au pouce, pas la piste.

   ⭐ LOT 188 — IL A DÉMÉNAGÉ ICI depuis `universe-step.mjs`, sans changer de
   forme, et il gagne une NOTE facultative : la ligne sous le mot, celle du
   dessin d'Eric (*« langues, rituels sombres »*). Un interrupteur sans note
   (Tutorials, Double view) rend exactement ce qu'il rendait. */
export function interrupteur({ label, note, on, disabled, onChange }) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "interrupteur";
  btn.setAttribute("role", "switch");
  btn.setAttribute("aria-checked", String(Boolean(on)));
  btn.dataset.on = String(Boolean(on));
  if (disabled) btn.disabled = true;
  const mot = el("span", "interrupteur-mot", [text(label)]);
  if (note) mot.append(el("span", "interrupteur-note", [text(note)]));
  btn.append(mot);
  btn.append(el("span", "interrupteur-piste", [el("span", "interrupteur-pouce")]));
  btn.addEventListener("click", () => onChange(!on));
  return btn;
}
