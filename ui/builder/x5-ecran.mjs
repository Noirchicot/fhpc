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
import * as D from "./x5-disposition.mjs?v=812";
import { pouvoirsDe, coteDe, encorePossibles, basesDe, bonusDe, PALIERS, PLAFOND_QTE } from "./craft.mjs?v=812";
import { DESTINATIONS } from "./gear-ecran.mjs?v=812";
import { habilleEnParchemin } from "./parchemin.mjs?v=812";

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
  /* ⭐ LOT 262 — X5 ENTRE DANS LA BOÎTE PARTAGÉE, et n'écrit plus que ce qui lui est
     PROPRE. Le lot 259 lui donnait `position` et `width: 375` : la largeur manquait
     alors, faute de famille. Maintenant que `.x5` est dans `FAMILLE_DE_LA_DALLE`, la
     boîte de `shell.css` porte `position`, `width` (par `--panneau-l`, 375) et le
     reste — ⛔ les réécrire ici, ce serait deux écrivains pour une loi, et le garde
     « la boîte de la dalle est déclarée plus d'une fois » m'a arrêté.
     ⭐ Reste ce qu'aucune autre fiche ne dit : une hauteur de PLAN FIXE, comme X0. */
  const regles = [`.x5[data-objet="x5"]{flex:0 0 auto;height:${px(D.DALLE.h)}}`];
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

/** ⭐ UN VRAI MENU, NATIF — le même organe que le `SEND TO` de X2.
 *  🔴 LE LOT 259 DESSINAIT DES BOUTONS QUI NE S'OUVRAIENT SUR RIEN : `surChoix` était
 *  appelé, et personne ne répondait. Un contrôle qui promet un menu qu'il n'ouvre pas
 *  est pire qu'un contrôle absent. ⭐ Un `<select>` natif s'ouvre au doigt comme à la
 *  souris, et iOS le rend dans son propre menu — la capture d'Eric du 24/09 le montre
 *  sur le `SEND TO` de X2.
 *  @param options `{ valeur, mot }[]` · `aucun` : le mot de l'option vide, si elle
 *  existe (un pouvoir admet toujours « aucun »). */
function menu(nom, valeur, options, surChoix, { aucun = null } = {}) {
  const s = elx("select", "x5-drop");
  s.dataset.organe = nom;
  s.setAttribute("aria-label", nom.toLowerCase());
  const toutes = [...(aucun ? [{ valeur: "", mot: aucun }] : []), ...(options || [])];
  for (const o of toutes) {
    const opt = elx("option", null, o.mot);
    opt.value = o.valeur;
    if (o.inactif) opt.disabled = true;
    if (o.valeur === (valeur ?? "")) opt.selected = true;
    s.append(opt);
  }
  /* 🔴 « PLUS D'UNE OPTION » ÉTAIT FAUX POUR UN POUVOIR (lot 261) : il admet toujours
     « aucun », donc un seul pouvoir offert, c'est DEUX choix. Le plancher vient
     désormais des options RÉELLES, l'option vide comprise. */
  const choisissables = toutes.filter((o) => !o.inactif);
  s.disabled = choisissables.length < 2;
  if (surChoix) s.addEventListener("change", () => surChoix(nom, s.value));
  return s;
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
function panneau(cote, status = "Crafting") {
  const p = elx("section", "x5-panneau");
  p.dataset.organe = "PANNEAU";
  const argent = elx("div", "x5-panneau-argent");

  /* ⚖️ LES TROIS RÉGIMES DU CROQUIS — `STATUS` décide de ce que le panneau montre.
     C'est l'idée la plus économe du dessin : une seule fiche sert les trois façons
     d'obtenir un objet. */
  if (status === "Found") {
    /* ⚖️ Le croquis, mot pour mot : « you found it, it's a gift or you stole it — it's
       free ». ⛔ Aucun champ : un « 0 GP » dirait « ça coûte zéro », la phrase dit
       « la question du prix ne se pose pas ». */
    argent.append(elx("p", "x5-panneau-libre", "You found it, it's a gift, or you stole it — it's free."));
    p.append(argent);
    return p;
  }
  if (!cote.legal) {
    /* ⚖️ « au moins le prix sera juste » — quand il n'y a pas de prix juste à donner,
       on le DIT, ⛔ on n'affiche pas un zéro plausible. */
    argent.append(elx("p", "x5-panneau-refus", motDuRefus(cote.raison)));
    p.append(argent);
    return p;
  }
  if (status === "Buying") {
    /* ⚖️ Le croquis : « price · qty · total », et rien d'autre. Le prix d'ACHAT est la
       valeur de vente — ⛔ pas le coût de fabrication, qui en est la moitié. */
    argent.append(
      ligne("Price", or(cote.venteUnitaire)),
      ligne("Qty · Total", `×${cote.qte} · ${or(cote.venteTotale)}`));
    p.append(argent);
    return p;
  }
  /* Crafting — la colonne gauche n'existe qu'en pile Fate's Hand : `coteDe` rend
     `temps: null` en SRD, et c'est LUI qui le décide (un seul écrivain, lot 259). */
  if (cote.temps) {
    const g = elx("div", "x5-panneau-prereq");
    g.append(elx("h4", "x5-panneau-titre", "Prerequisites"));
    g.append(ligne("Crafting time", cote.temps), ligne("Crafting roll", `DC ${cote.dc}`));
    const roll = elx("button", "x5-roll", "ROLL");
    roll.type = "button";
    g.append(roll);
    p.append(g);
  }
  argent.append(
    ligne("Base item cost", or(cote.coutBase)),
    ligne("Crafting cost", or(cote.craftUnitaire - cote.coutBase / 2)),
    ligne("Unit price", or(cote.craftUnitaire)),
    ligne("Qty · Total", `×${cote.qte} · ${or(cote.craftTotal)}`));
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
 *   · `plan` — le RECORD du plan d'où l'on vient (`Weapon, +1, +2, or +3`…). C'est
 *     LUI qui dit quelles bases et quels bonus s'offrent — ⛔ rien n'est listé ici.
 *   · `bases`, `itemsMagiques` — des RECORDS (⛔ pas des vues : `craft.mjs` est strict).
 *   · `choix` — `{ base, bonus, pouvoirs: [nom], qte, status, destination }`,
 *     l'état courant, TENU PAR L'APPELANT : cet écran ne garde rien, il redessine.
 *   · `fh` — la pile porte-t-elle Fate's Hand ? décide de la colonne gauche.
 *   · `surChoix(organe, valeur)` · `surAnnuler()` · `surEnvoyer(cote)`.
 *  @returns {{ noeud: HTMLElement, cote: object }} */
export function construireX5(o = {}) {
  const { plan = null, bases = [], itemsMagiques = [], choix = {}, fh = true,
    surChoix = null, surAnnuler = null, surEnvoyer = null } = o;

  const offertesBases = plan ? basesDe(plan, bases) : bases;
  const base = offertesBases.find((b) => b.data.name === choix.base) || offertesBases[0] || null;
  const bonus = plan ? bonusDe(plan) : [];
  const bonusChoisi = bonus.find((b) => b.rarete === choix.bonus) || null;
  const dispos = base ? pouvoirsDe(base, itemsMagiques) : [];
  const parNom = new Map(dispos.map((r) => [r.data.name, r]));
  const pris = (choix.pouvoirs || []).map((n) => parNom.get(n)).filter(Boolean);
  const status = choix.status || "Crafting";

  const cote = coteDe({
    base, bonus: bonusChoisi && bonusChoisi.rarete, qte: choix.qte,
    pouvoirs: pris.map((p) => p.data.rarity), fh,
  });

  const n = elx("section", "x5");
  n.dataset.objet = "x5";
  n.dataset.ecran = "X5";
  n.setAttribute("role", "group");
  n.setAttribute("aria-label", "Recipe and craft");
  n.dataset.status = status.toLowerCase();
  /* ⭐ LA FICHE PORTE SA FEUILLE, comme X1 et X2 — ⛔ pas une feuille posée par le
     pilote, qui pourrait survivre à la fiche ou manquer quand elle s'ouvre. */
  const feuille = elx("style");
  feuille.setAttribute("data-fhpc", "x5");
  feuille.textContent = feuilleDesCotesX5();
  n.append(feuille);
  /* ⭐ ET LE PARCHEMIN DE LA FAMILLE — le même organe que X0, X1 et X2 : « la fiche ne
     sait pas dessiner une feuille, elle sait qu'elle en porte une ». */
  n.append(habilleEnParchemin(n, () => D.MARGE));
  if (!dispos.length) n.dataset.pouvoirs = "aucun";

  /* ⚖️ LE TYPE EST CELUI DU PLAN — on vient de `Weapon, +1…` ou d'`Armor, +1…`, et
     ce choix-là est déjà fait. ⛔ Un menu qui proposerait « Scroll » depuis une arme
     mentirait sur ce qu'X5 sait faire aujourd'hui. */
  const type = plan && plan.data && plan.data.category === "armor" ? "Armor" : "Weapon";
  n.append(
    menu("TYPE", type, [{ valeur: type, mot: type }], null),
    menu("ITEM", base && base.data.name,
      offertesBases.map((b) => ({ valeur: b.data.name, mot: b.data.name })), surChoix),
    /* ⭐ Le mot affiché est « +1 », la valeur est la RARETÉ — lue dans le plan. */
    menu("BONUS", bonusChoisi && bonusChoisi.rarete,
      bonus.map((b) => ({ valeur: b.rarete, mot: b.mot })), surChoix, { aucun: "—" }));

  /* ⚖️ LES DEUX POUVOIRS PORTENT CHACUN LA LISTE ENTIÈRE — Eric, 24/09 : « 2 dropdown à
     10 pouvoirs, au cas où tu imaginais 5+5 ». ⭐ `encorePossibles` retire ce qui ferait
     dépasser la limite, bonus compris — ⛔ ce n'est pas une règle anti-doublon. Le
     pouvoir déjà pris par l'AUTRE case est retiré, lui, parce qu'un objet ne porte
     pas deux fois la même propriété. */
  for (const [i, nom] of [[0, "POWER 1"], [1, "POWER 2"]]) {
    const autres = pris.filter((_, k) => k !== i);
    const socle = [bonusChoisi && bonusChoisi.rarete, ...autres.map((p) => p.data.rarity)].filter(Boolean);
    const offerts = encorePossibles(socle, dispos).filter((r) => !autres.includes(r));
    n.append(menu(nom, pris[i] ? pris[i].data.name : "",
      offerts.map((r) => ({ valeur: r.data.name, mot: r.data.name })), surChoix, { aucun: "—" }));
  }

  for (const f of D.ORGANES.filter((x) => x.nom.startsWith("FILET"))) {
    const t = elx("div", "x5-filet");
    t.dataset.organe = f.nom;
    t.setAttribute("aria-hidden", "true");
    n.append(t);
  }

  n.append(menu("STATUS", status,
    ["Crafting", "Buying", "Found"].map((v) => ({ valeur: v, mot: v })), surChoix));
  n.append(panneau(cote, status));

  n.append(menu("SEND TO", choix.destination || "backpack",
    DESTINATIONS.filter((d) => d.valeur !== "craft")
      .map((d) => ({ valeur: d.valeur, mot: d.mot, inactif: !d.actif })), surChoix));

  const cancel = elx("button", "x5-porte", "Cancel");
  cancel.type = "button"; cancel.dataset.organe = "CANCEL";
  if (surAnnuler) cancel.addEventListener("click", surAnnuler);
  const send = elx("button", "x5-porte", "Send");
  send.type = "button"; send.dataset.organe = "SEND";
  /* ⏳ `SEND` ATTEND UNE DÉCISION, ET IL LE DIT. Un objet composé — `Longsword +1
     Flame Tongue` — n'existe comme record NULLE PART : le poser dans la fiche touche
     le format de sauvegarde, et ce n'est pas un écran qui le décide. ⛔ Le bouton est
     inerte, et son nom accessible dit pourquoi — un bouton qui ne fait rien en
     silence est pire qu'un bouton absent. */
  send.disabled = true;
  send.title = "Crafted items cannot be saved to the sheet yet";
  send.setAttribute("aria-label", "Send — not available yet: crafted items cannot be saved to the sheet");
  n.append(cancel, send);

  return { noeud: n, cote };
}

export { PLAFOND_QTE, PALIERS };
