/* ══ X5 — LA FICHE RECIPE & CRAFT — lot 259 ═══════════════════════════════════
   ⚖️ LE CROQUIS QUI FAIT FOI : `Croquis/2026-09-23-X5-recipe-and-craft.jpg`, rangé
   au dépôt (`fh-phb/croquis/`) et au vault le 24/09.
   📐 LE PLAN COTÉ : `FH-WEB/FHPC/Plan-ecran-X5/X5_gen.py` → recopié octet pour
   octet dans `x5-disposition.mjs`. ⛔ Aucune cote ne s'écrit ici.
   🧮 LE MOTEUR : `craft.mjs` (lot 258) — les pouvoirs d'une base, le prix d'un
   assemblage, la limite. ⛔ Aucune règle de jeu ne s'écrit ici non plus.

   ⭐ CE QUE CET ÉCRAN EST, EN UNE PHRASE : une COQUILLE fixe — deux dropdowns en
   tête, puis STATUS, le panneau, le jeton, SEND TO et les deux boutons — autour
   d'un CORPS qui change avec le type de craft.
     ① CRAFT WEAPON · CRAFT ARMOR → base + BONUS + POWER 1·2    ✅ ce lot
     ② CRAFT WONDROUS            → une famille → sa variante     ⏳ pas de croquis
     ③ SCRIBE SCROLL             → classe, niveau, status        ⏳ pas de croquis
   ⚖️ Eric, 24/09 : *« on fait armes et armures de A à Z déjà »*. ⛔ Les deux
   autres familles ne sont pas ébauchées ici — le plan RÉSERVE leur place et dit
   ce qu'elle coûte (132 blg), il ne les invente pas.

   ⚖️ ET COMME X1 ET X2, ELLE RECOUVRE LA DALLE SANS ÉCRIRE DANS LE BELT — la loi
   du rang X : 375 × 500 posée à y = 60. ⛔ `x5` n'entre donc pas dans `FENETRE_DE`,
   et c'est son ABSENCE de cette table qui le garantit. */
import * as D from "./x5-disposition.mjs?v=809";
import { pouvoirsDe, coteDe, encorePossibles, PALIERS, PLAFOND_QTE } from "./craft.mjs?v=809";

const px = (v) => `${Math.round(v * 100) / 100}px`;
function elx(balise, classe, texte) {
  const n = document.createElement(balise);
  if (classe) n.className = classe;
  if (texte !== undefined) n.textContent = texte;
  return n;
}

/** ⭐ UNE SEULE FONCTION ÉCRIT LES COTES, et elle les LIT toutes dans la table.
 *  ⛔ Pas un nombre en dur : la table est générée, et une cote qui change change
 *  au vault puis se recopie. Le jour où le générateur bouge, cette feuille suit
 *  sans qu'on y touche. */
export function feuilleDesCotesX5() {
  /* 🔴 LA DALLE PORTE SA LARGEUR, ET JE L'AVAIS OUBLIÉE. Les organes sont posés en
     ABSOLU : sans `width` sur leur hôte, ils débordent à droite et le panneau se
     coupe. ⛔ Neuf gardes verts ne l'ont pas vu — ils vérifient les cotes des
     ORGANES, pas celle de ce qui les contient. Il a fallu regarder l'image.
     ⭐ Et c'est la cote de la table, pas un 375 écrit à la main. */
  const regles = [`.x5{position:relative;flex:0 0 auto;`
    + `width:${px(D.DALLE.l)};height:${px(D.DALLE.h)}}`];
  for (const o of D.ORGANES) {
    const b = o.cible || o;
    regles.push(
      `.x5 [data-organe="${o.nom}"]{position:absolute;left:${px(b.x)};top:${px(b.y)};`
      + `width:${px(b.l)};height:${px(b.h)}}`);
  }
  /* ⚖️ LA RANGÉE DES POUVOIRS DISPARAÎT quand la base n'en offre aucun — Eric,
     24/09 : « oui voilà ». ⛔ Elle ne se grise pas : une option grisée promet
     qu'un jour elle s'ouvrira, une option absente dit que cette base n'est pas de
     cette famille-là. Et tout ce qui la suit remonte de sa hauteur. */
  const suivent = D.ORGANES.filter((o) => (o.cible || o).y > hauteurDe("POWER 1"));
  regles.push(`.x5[data-pouvoirs="aucun"] [data-organe^="POWER"]{display:none}`);
  for (const o of suivent) {
    const b = o.cible || o;
    regles.push(`.x5[data-pouvoirs="aucun"] [data-organe="${o.nom}"]{top:${px(b.y - D.H_RANGEE)}}`);
  }
  return regles.join("\n");
}
function hauteurDe(nom) {
  const o = D.ORGANES.find((x) => x.nom === nom);
  return o ? (o.cible || o).y : Infinity;
}

/** Un dropdown de la table : sa boîte porte son nom d'organe, son contenu le mot. */
function dropdown(nom, mot, options, surChoix, { muet = false, aucunPermis = false } = {}) {
  const b = elx("button", "x5-drop", "");
  b.type = "button";
  b.dataset.organe = nom;
  b.append(elx("span", "x5-drop-mot", mot || "—"), elx("span", "x5-drop-chevron", "▾"));
  b.setAttribute("aria-label", `${nom.toLowerCase()} — ${mot || "none"}`);
  /* ⛔ UN CONTRÔLE QUI N'A RIEN À OFFRIR NE SE TAIT PAS, IL DISPARAÎT — mais quand
     il reste seul choix possible, il se dit INERTE plutôt que de promettre un
     menu vide. C'est le défaut de `data-glissable` du lot Wares : un attribut qui
     annonçait un geste que personne n'écoutait. */
  /* 🔴 « PLUS D'UNE OPTION » ÉTAIT FAUX POUR UN POUVOIR. Un pouvoir admet toujours
     « aucun » : avec UN seul pouvoir offert, le joueur a DEUX choix — le prendre ou
     non. 📏 Le cas est réel : une Longsword qui porte déjà un Legendary n'a plus
     que `Weapon of Warning` (Uncommon) sous la limite, et l'ancienne règle rendait
     le dropdown inerte — le joueur ne pouvait pas le prendre.
     ⭐ Un TYPE ou un STATUS, eux, n'ont pas de « aucun » : il leur faut deux
     valeurs pour qu'il y ait un choix. */
  const plancher = aucunPermis ? 1 : 2;
  const utile = !muet && options && options.length >= plancher;
  b.disabled = !utile;
  if (utile) b.addEventListener("click", () => surChoix && surChoix(b, options));
  return b;
}

/** ⚖️ LE PANNEAU — et ses DEUX RÉGIMES selon la pile.
 *  Eric, 24/09 : *« colonne de gauche inutile en SRD car pas de crafting time ·
 *  pour FH il y a un crafting time »*. ⛔ En SRD la colonne gauche n'est pas
 *  grisée ni à zéro : elle N'EXISTE PAS. Un `0` se lirait « ça ne prend aucun
 *  temps » ; son absence dit « cette pile ne connaît pas cette règle ».
 *  ⭐ Et `coteDe` rend déjà `temps` et `dc` à `null` en SRD — l'écran n'a donc
 *  aucune décision à prendre : il dessine ce que le moteur lui donne.
 *
 *  🔴 J'AVAIS ÉCRIT CETTE PHRASE ET FAIT LE CONTRAIRE. Le code testait
 *  `if (fh && cote.legal && cote.temps)` : DEUX écrivains pour une seule règle —
 *  le moteur qui rend `null`, et l'écran qui redemande `fh`. ⛔ Et l'épreuve
 *  rouge l'a montré : en retirant le `fh &&`, le garde est RESTÉ VERT, parce que
 *  l'autre protection tenait encore. Un témoin qui ne coupe qu'un chemin sur deux
 *  n'accuse plus rien.
 *  ⭐ Le `fh` est donc parti d'ici. La règle vit à UN endroit — `craft.mjs` — et
 *  cet écran dessine `cote.temps` quand il existe, sans savoir pourquoi. */
function panneau(cote) {
  const p = elx("section", "x5-panneau");
  p.dataset.organe = "PANNEAU";
  if (cote.legal && cote.temps) {
    const g = elx("div", "x5-panneau-prereq");
    g.append(elx("h4", "x5-panneau-titre", "Prerequisites"));
    g.append(ligne("Crafting time", cote.temps), ligne("Crafting roll", `DC ${cote.dc}`));
    const roll = elx("button", "x5-roll", "ROLL");
    roll.type = "button";
    g.append(roll);
    p.append(g);
  }
  const argent = elx("div", "x5-panneau-argent");
  if (!cote.legal) {
    /* ⚖️ « au moins le prix sera juste » — quand il n'y a pas de prix juste à
       donner, on le DIT, ⛔ on n'affiche pas un zéro plausible. */
    argent.append(elx("p", "x5-panneau-refus", motDuRefus(cote.raison)));
  } else {
    argent.append(
      ligne("Base item cost", or(cote.coutBase)),
      ligne("Crafting cost", or(cote.craftUnitaire - cote.coutBase / 2)),
      ligne("Unit price", or(cote.craftUnitaire)),
      ligne("Qty · Total", `×${cote.qte} · ${or(cote.craftTotal)}`));
  }
  p.append(argent);
  return p;
}
function ligne(clef, valeur) {
  const l = elx("div", "x5-ligne");
  l.append(elx("span", "x5-ligne-clef", clef), elx("span", "x5-ligne-valeur", valeur));
  return l;
}
/** ⛔ Jamais de décimale fantôme : 0,5 GP s'écrit « 5 SP », pas « 0.5 GP ». */
function or(n) {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1) return `${Math.round(n).toLocaleString("en-US")} GP`;
  if (n >= 0.1) return `${Math.round(n * 10)} SP`;
  return `${Math.round(n * 100)} CP`;
}
function motDuRefus(raison) {
  return {
    "au-dela-de-la-limite": "Beyond what can be forged — remove a power.",
    "rarete-illisible": "This property has no readable rarity.",
    "sans-propriete": "Choose a bonus or a power first.",
  }[raison] || "Not craftable.";
}

/** ⚖️ LA FICHE X5.
 *  @param {object} o
 *   · `base` — le RECORD de l'objet de base (⛔ pas une vue : `craft.mjs` est
 *     strict, et c'est ce qui a coûté la diagonale du blueprint au lot 256).
 *   · `itemsMagiques` — les records magiques de la pile, d'où les pouvoirs se
 *     dérivent. ⛔ L'écran ne connaît AUCUN nom de pouvoir.
 *   · `choix` — `{ bonus, pouvoirs: [], qte, destination }`, l'état courant.
 *   · `fh` — la pile porte-t-elle Fate's Hand ? décide de la colonne gauche.
 *   · `surChoix(quoi, options)` · `surAnnuler()` · `surEnvoyer(cote)`.
 *  @returns {{ noeud: HTMLElement, cote: object }} */
export function construireX5(o = {}) {
  const { base = null, itemsMagiques = [], choix = {}, fh = true,
    surChoix = null, surAnnuler = null, surEnvoyer = null } = o;

  const dispos = base ? pouvoirsDe(base, itemsMagiques) : [];
  const pris = choix.pouvoirs || [];
  const cote = coteDe({
    base, bonus: choix.bonus, qte: choix.qte,
    pouvoirs: pris.map((p) => p && p.data && p.data.rarity), fh,
  });

  const n = elx("section", "x5");
  n.dataset.objet = "x5";
  /* ⭐ L'ATTRIBUT QUI FAIT DISPARAÎTRE LA RANGÉE — un seul écrivain, lu par la
     feuille. ⛔ Pas un `style.display` posé organe par organe : la feuille tient
     aussi la remontée de tout ce qui suit. */
  if (!dispos.length) n.dataset.pouvoirs = "aucun";

  const type = base && base.data && base.data.weapon_range ? "Weapon" : "Armor";
  n.append(
    dropdown("TYPE", type, ["Weapon", "Armor", "Wondrous", "Scroll"], surChoix),
    dropdown("ITEM", (base && base.data && base.data.name) || "—", null, surChoix),
    dropdown("BONUS", choix.bonus ? bonusEnMot(choix.bonus) : "—",
      ["Uncommon", "Rare", "Very Rare"], surChoix));

  /* ⚖️ LES DEUX DROPDOWNS PORTENT CHACUN LA LISTE ENTIÈRE — Eric, 24/09 : « il
     faudra 2 dropdown à 10 pouvoirs, au cas où tu imaginais 5+5 ». ⛔ Ce n'est
     pas un partage : deux CHOIX dans un même catalogue.
     ⭐ Et `encorePossibles` retire ce qui ferait dépasser la limite — ce n'est pas
     une règle anti-doublon, c'est la limite de l'échelle. Prendre `Defender`
     (Legendary) ne laisse que les Uncommon pour le second. */
  for (const [i, nom] of [[0, "POWER 1"], [1, "POWER 2"]]) {
    const autres = [choix.bonus, ...pris.filter((_, k) => k !== i)
      .map((p) => p && p.data && p.data.rarity)].filter(Boolean);
    const offerts = encorePossibles(autres, dispos);
    const mot = pris[i] ? pris[i].data.name : "—";
    n.append(dropdown(nom, mot, offerts, surChoix, { aucunPermis: true }));
  }

  /* ⛔ AUCUN STYLE EN LIGNE : le filet est un organe comme les autres, et c'est
     `feuilleDesCotesX5()` qui le pose — elle lit la table, elle. Un `style.top`
     écrit ici serait une cote de plus, hors du plan, que la régénération ne
     suivrait pas. 🔴 Le garde « aucun style EN LIGNE dans ui/ » me l'a dit avant
     que je le voie, et il avait raison. */
  for (const f of D.ORGANES.filter((x) => x.nom.startsWith("FILET"))) {
    const t = elx("div", "x5-filet");
    t.dataset.organe = f.nom;
    t.setAttribute("aria-hidden", "true");
    n.append(t);
  }

  n.append(dropdown("STATUS", choix.status || "Crafting",
    ["Crafting", "Buying", "Found"], surChoix));
  n.append(panneau(cote));

  const sendTo = dropdown("SEND TO", choix.destination || "Backpack", null, surChoix);
  n.append(sendTo);

  const cancel = elx("button", "x5-porte", "Cancel");
  cancel.type = "button"; cancel.dataset.organe = "CANCEL";
  if (surAnnuler) cancel.addEventListener("click", surAnnuler);
  const send = elx("button", "x5-porte", "Send");
  send.type = "button"; send.dataset.organe = "SEND";
  /* ⛔ ON N'ENVOIE PAS CE QUI N'EXISTE PAS : un assemblage hors limite n'a pas de
     prix juste, donc pas de tuile à produire. Le bouton le dit en étant inerte,
     et le panneau dit POURQUOI juste au-dessus. */
  send.disabled = !cote.legal;
  if (surEnvoyer) send.addEventListener("click", () => surEnvoyer(cote));
  n.append(cancel, send);

  return { noeud: n, cote };
}

/** ⚖️ `+1` / `+2` / `+3` À L'ÉCRAN, jamais la rareté qui les porte.
 *  ⭐ Eric, 24/09 : *« en SRD tu ne parleras pas de PP »* — et la rareté d'un
 *  bonus est le même genre de plomberie : le joueur choisit « +2 », pas « Rare ».
 *  Le moteur, lui, ne connaît que des paliers. */
export const BONUS_EN_MOT = Object.freeze({ Uncommon: "+1", Rare: "+2", "Very Rare": "+3" });
function bonusEnMot(rarete) { return BONUS_EN_MOT[rarete] || rarete; }

export { PLAFOND_QTE, PALIERS };
