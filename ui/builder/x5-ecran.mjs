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
     ② CRAFT WONDROUS            → une famille → sa variante     ✅ lot 277 (le schéma d'Eric du 25/09)
     ③ SCRIBE SCROLL             → classe, niveau, un sort       ✅ lot 285 (la dictée d'Eric du 26/09,
                                                                    `x5-parchemin.mjs`)
   ⚖️ Eric, 24/09 : *« on fait armes et armures de A à Z déjà »*. ⛔ Les deux
   autres familles ne sont pas ébauchées ici — le plan RÉSERVE leur place et dit
   ce qu'elle coûte (132 blg), il ne les invente pas.

   ⚖️ ET COMME X1 ET X2, ELLE RECOUVRE LA DALLE SANS ÉCRIRE DANS LE BELT — la loi
   du rang X : 375 × 500 posée à y = 60. ⛔ `x5` n'entre donc pas dans `FENETRE_DE`,
   et c'est son ABSENCE de cette table qui le garantit. */
import * as D from "./x5-disposition.mjs?v=846";
import { pouvoirsDe, coteDe, encorePossibles, basesDe, bonusDe, enPieces, prixSaisi, prixEnPO, PLAFOND_QTE,
  coteDUneVariante, recordDUneVariante, estMunition, LOT_MUNITION } from "./craft.mjs?v=846";
import { DESTINATIONS, montantDeLaBourse, popupDeLaBourse, reglesDeLaBourse } from "./gear-ecran.mjs?v=846";
import { corpsDuJeton } from "./jeton-objet.mjs?v=846";
import { nomCrafte, variantesDe } from "../../src/build/objet-crafte.mjs?v=846";
/* ⭐ LOT 285 — la famille PARCHEMIN vit dans son module ; la coquille lui PRÊTE ses pièces
   (`construireX5` plus bas) plutôt que de les exporter : ⛔ pas d'import en boucle. */
import { construireX5Parchemin, estFicheParchemin } from "./x5-parchemin.mjs?v=846";

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
    /* ⭐ LOT 285 — UNE REDÉCLARATION SE RANGE SOUS SA FAMILLE. Le parchemin pose QTY, JETON, la
       bourse et le pied à SES cotes (même nom qu'un commun, `famille: "parchemin"`) : sa règle ne
       vaut que sous `[data-famille="parchemin"]`. ⛔ Sans cette portée, la dernière écrite
       gagnerait partout — l'arme prendrait le pied du parchemin. */
    const portee = o.famille && D.ORGANES.some((x) => x !== o && x.nom === o.nom && !x.famille)
      ? `[data-famille="${o.famille}"]` : "";
    regles.push(
      `.x5${portee} [data-organe="${organeDe(o.nom)}"]{position:absolute;left:${px(b.x)};top:${px(b.y)};`
      + `width:${px(b.l)};height:${px(b.h)}}`);
  }
  /* ⭐ LE POPUP DE LA BOURSE, avec LES RÈGLES DE R — centré sur la bourse, serré dans la
     dalle. ⛔ Aucune cote écrite ici : `reglesDeLaBourse` est l'unique écrivain. */
  regles.push(...reglesDeLaBourse(".x5", D.ORGANES.find((x) => x.nom === "PURSE"), D.DALLE, 0));
  /* ⚖️ LA RANGÉE DES POUVOIRS DISPARAÎT quand la base n'en offre aucun — Eric,
     24/09 : « oui voilà ». ⛔ Elle ne se grise pas : une option grisée promet
     qu'un jour elle s'ouvrira, une option absente dit que cette base n'est pas de
     cette famille-là. Et tout ce qui la suit remonte de sa hauteur. */
  /* ⭐ LOT 285 — seuls les COMMUNS remontent : une famille qui a ses propres cotes (le
     parchemin) n'a pas de rangée des pouvoirs à perdre. */
  const suivent = D.ORGANES.filter((o) => !o.famille && (o.cible || o).y > hauteurDe("POWER 1"));
  regles.push(`.x5[data-pouvoirs="aucun"] [data-organe^="POWER"]{display:none}`);
  for (const o of suivent) {
    const b = o.cible || o;
    regles.push(`.x5[data-pouvoirs="aucun"] [data-organe="${organeDe(o.nom)}"]{top:${px(b.y - D.H_RANGEE)}}`);
  }
  return regles.join("\n");
}
/* ⭐ LA BOURSE ET SON MONTANT GARDENT LE NOM D'ORGANE DE R (`purse`, `montant`) : c'est lui
   qui porte l'image (`.gear-bouton[data-organe="purse"]`) et la peau du voyant. ⛔ Un nom neuf
   aurait demandé une seconde règle d'image — un second écrivain pour la même bourse. */
const CLEF_DOM = { PURSE: "purse", MONTANT: "montant" };
function organeDe(nom) { return CLEF_DOM[nom] || nom; }

/** ⭐ LOT 285 — CE QU'UNE FICHE POSE : ses organes, et les communs qu'elle ne redéclare pas —
 *  parmi ceux qu'elle GARDE (`COMMUNS_DE`), si la table en nomme. ⛔ Le même calcul que
 *  `organes_de` dans le générateur : la bijection plan ↔ écran (garde 2) passe par lui. */
export function organesDeLaFamille(famille) {
  const siens = D.ORGANES.filter((o) => o.famille === famille);
  const noms = new Set(siens.map((o) => o.nom));
  const garde = (D.COMMUNS_DE || {})[famille];
  const communs = D.ORGANES.filter((o) => !o.famille && !noms.has(o.nom) && (!garde || garde.includes(o.nom)));
  return [...communs, ...siens];
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

/** ⚖️ L'ENCART — lot 270, la dictée d'Eric du 25/09, deux colonnes de taille égale :
 *    colonne 1 : `Crafting · Cost` / un trait rouge / la base · Enchanting · Total
 *    colonne 2 : `Crafting time` / `Qty N · Total` et le total ENCADRÉ
 *  ⚖️ « pas de jets pour produire les regular magic items (SRD comme FH) » : ⛔ plus de
 *  ROLL, plus de DC. Le temps reste — c'est une durée, pas un jet.
 *  ⚖️ Le total encadré EST le prix qu'on tape (réponse 1 : « oui »).
 *  ⭐ LOT 280 — le temps est donné dans LES DEUX piles (le SRD a sa table, p. 206 ; le
 *  « SRD vide » du 24/09 reposait sur une erreur) : l'écran dessine ce que le moteur donne, sans
 *  redemander la pile (la faute du lot 259, un second écrivain pour une seule règle). */
function encart(cote, status, base, prix, surPrix, alerte, type) {
  const e = elx("section", "x5-encart");
  e.dataset.organe = "ENCART";
  if (!cote.legal) {
    /* ⚖️ « au moins le prix sera juste » — quand il n'y a pas de prix juste, on le DIT. */
    e.dataset.regime = "refus";
    e.append(elx("p", "x5-encart-refus", motDuRefus(cote.raison)));
  } else if (status === "Buying") {
    /* ⚖️ Eric, 25/09 (retouche) : « pour l'achat tu auras uniquement le prix et la quantité
       (tous deux modifiables) ». ⭐ Le prix d'ACHAT se tape (l'unitaire) ; la quantité est le
       menu QTY au-dessus ; le total en découle. ⛔ Ni coût de fabrication, ni temps. */
    e.dataset.regime = "buying";
    const unite = prix ?? cote.venteUnitaire;
    const c1 = elx("div", "x5-encart-col");
    c1.append(champ("Price", unite, prix !== null, surPrix));
    const c2 = elx("div", "x5-encart-col x5-encart-droite");
    c2.append(ligne(`Qty ${cote.qte} · Total`, or(unite * cote.paiements)));
    e.append(c1, c2);
  } else {
    e.dataset.regime = "crafting";
    /* ⭐ La colonne 1 dit ce que COÛTE la fabrication : la moitié de la base, la moitié de la
       part magique (Eric, 25/09 : « crafting cost of the base item : 200 »). */
    const partBase = cote.coutBase / 2;
    const partMagie = cote.magie / 2;
    const unite = partBase + partMagie;
    const c1 = elx("div", "x5-encart-col x5-encart-couts");
    const t = elx("div", "x5-encart-tete");
    t.append(elx("span", null, "Crafting"), elx("span", null, "Cost"));
    /* ⚖️ LOT 277 — une variante n'a pas de base à fabriquer (Eric : « Enchanting · rareté
       de la variante · temps · Total ») : ⛔ pas de ligne « Base item » à zéro. */
    c1.append(t,
      ...(base ? [ligne(base.data.name, or(partBase))] : []),
      ligne("Enchanting", or(partMagie)),
      ligne("Total", or(unite)));
    const c2 = elx("div", "x5-encart-col x5-encart-droite");
    /* ⚖️ LOT 280 — le temps du barème SRFH, dans les deux piles. ⛔ Vide s'il manque. */
    c2.append(ligne("Crafting time", cote.temps || ""));
    /* ⚖️ LA RARETÉ — Eric, 25/09 : « il faut citer la rareté — crafting time 3 days (FH) ·
       rare weapon ». ⭐ La catégorie AFFICHÉE du craft (le palier SRD inférieur, jamais un
       demi-cran — Eric, 24/09), et le type lu dans le plan. */
    /* ⭐ LOT 277 — une variante porte SA rareté, lue dans le record (`cote.rarete`) :
       ⛔ la déduire du prix dirait « Uncommon » d'une potion Rare, vendue à moitié. */
    /* ⭐ LOT 280 — un assemblage porte la sienne, rabattue par le moteur au palier SRFH le
       plus proche (`cote.categorie`) : ⛔ l'écran ne reclasse rien. */
    const rarete = cote.rarete || cote.categorie;
    c2.append(elx("p", "x5-encart-rarete", rarete ? `${rarete} ${type.toLowerCase()}` : ""));
    c2.append(champ(`Qty ${cote.qte} · Total`, prix ?? unite * cote.paiements, prix !== null, surPrix));
    e.append(c1, c2);
  }
  /* ⭐ LE REFUS DE L'APPELANT VIT DANS L'ENCART — ⛔ pas un organe de plus. */
  if (alerte) {
    const a = elx("p", "x5-encart-refus", alerte);
    a.setAttribute("role", "alert");
    e.append(a);
  }
  return e;
}

/** ⭐ LE TOTAL QUI SE TAPE (lots 269 → 270). Il porte le total en vigueur (calculé, ou
 *  tapé) ; le joueur le remplace, et `change` le rend à l'appelant (⛔ pas `input` : un
 *  repeint à chaque frappe volerait le focus). Vide = retour au total calculé.
 *  ⭐ `data-manuel` dit si le total est celui du joueur — la feuille le souligne. */
function champ(clef, valeur, manuel, surPrix) {
  const l = elx("label", "x5-ligne x5-ligne-champ");
  const c = elx("input", "x5-prix");
  c.type = "text";
  c.inputMode = "decimal";
  c.value = or(valeur);
  c.dataset.manuel = manuel ? "oui" : "non";
  c.setAttribute("aria-label", `${clef} — type a total to change it, empty it to go back`);
  if (surPrix) c.addEventListener("change", () => surPrix(c.value));
  else c.disabled = true;
  l.append(elx("span", "x5-ligne-clef", clef), c);
  return l;
}

function ligne(clef, valeur) {
  const l = elx("div", "x5-ligne");
  l.append(elx("span", "x5-ligne-clef", clef), elx("span", "x5-ligne-valeur", valeur));
  return l;
}
/** ⛔ Jamais de décimale fantôme : 0,5 GP s'écrit « 5 SP », pas « 0.5 GP ». */
function or(n) {
  if (!Number.isFinite(n)) return "—";
  /* ⭐ LOT 269 — l'arrondi est celui de `enPieces`, qui dit aussi ce que la bourse
     PAIE : l'écran ne peut plus afficher un prix et en facturer un autre. */
  const c = enPieces(n);
  if (!c) return "0 CP";
  if (c.gp) return `${c.gp.toLocaleString("en-US")} GP`;
  if (c.sp) return `${c.sp} SP`;
  return `${c.cp} CP`;
}

/** ⚖️ CE QUE `SEND` PAIE, SELON LE STATUT — les trois régimes du croquis :
 *  `Crafting` paie le coût de fabrication, `Buying` le prix d'achat, `Found` rien. */
export function montantDuStatut(cote, status = "Crafting", prix = null) {
  if (!cote || !cote.legal || status === "Found") return 0;
  /* ⚖️ LOT 270 — en Crafting, « le Total encadré » EST ce qu'on tape (Eric, 25/09 : « oui ») :
     un prix tapé est le TOTAL. ⚖️ LOT 271 — en Buying, c'est le PRIX qui se tape (« le prix et
     la quantité, tous deux modifiables ») : le total est prix × paiements. */
  if (prix !== null && prix !== undefined) return status === "Buying" ? prix * cote.paiements : prix;
  return status === "Buying" ? cote.venteTotale : cote.craftTotal;
}
function motDuRefus(raison) {
  return {
    "au-dela-de-la-limite": "Beyond Legendary+ — no crafter can make this. Remove a power.",
    "rarete-illisible": "This property has no readable rarity.",
    "sans-propriete": "Choose a bonus or a power first.",
  }[raison] || "Not craftable.";
}

/** ⚖️ LA FICHE X5 — BLUEPRINT (lot 270, la dictée d'Eric du 25/09).
 *  @param {object} o
 *   · `plan` — le RECORD du plan d'où l'on vient. C'est LUI qui dit quelles bases et
 *     quels bonus s'offrent — ⛔ rien n'est listé ici.
 *   · `bases`, `itemsMagiques` — des RECORDS (⛔ pas des vues : `craft.mjs` est strict).
 *   · `choix` — `{ base, bonus, pouvoirs: [nom], qte, status, destination, prix }`,
 *     l'état courant, TENU PAR L'APPELANT : cet écran ne garde rien, il redessine.
 *   · `fh` — ⛔ plus lu depuis le lot 280 : prix et temps sont les mêmes dans les deux piles
 *   · `surChoix(organe, valeur)` · `surAnnuler()` · `surEnvoyer(envoi)` · `surJeton(apercu)`
 *     — `envoi` = `{ base, bonus, pouvoirs, cote, status, destination, cout }` ;
 *     `apercu` = `{ nom, base, bonus, pouvoirs, cote, status }`, des RECORDS.
 *   · `alerte` — la phrase d'un refus de l'appelant (« Not enough coin… »).
 *  ⛔ AUCUN ASCENSEUR, AUCUN `?` (Eric, 25/09) : tout tient dans la dalle (le générateur
 *  le vérifie), et la fiche ne porte pas de bouton d'aide.
 *  @returns {{ noeud: HTMLElement, cote: object }} */
export function construireX5(o = {}) {
  /* ⭐ LOT 277 — DEUX FAMILLES, UNE COQUILLE. Le plan dit la sienne : s'il porte des
     variantes (`variantesDe`), c'est la famille à VARIANTE. ⛔ Aucun nom testé. */
  if (o.plan && variantesDe(o.plan.data).length >= 2) return construireX5Variante(o);
  /* ⭐ LOT 285 — LA TROISIÈME : le PARCHEMIN, reconnu à la table de son plan. La coquille lui
     prête ses pièces communes — ⛔ elles ne sont écrites qu'ici. */
  if (estFicheParchemin(o)) return construireX5Parchemin(o, { menu, laBourse, lePied, or, feuilleDesCotesX5 });
  const { plan = null, bases = [], itemsMagiques = [], choix = {}, fh = true,
    surChoix = null, surAnnuler = null, surEnvoyer = null, surJeton = null, alerte = "",
    bourse = null, bourseOuverte = false, surBourse = null, surFermerBourse = null, surMonnaie = null } = o;

  const offertesBases = plan ? basesDe(plan, bases) : bases;
  const base = offertesBases.find((b) => b.data.name === choix.base) || offertesBases[0] || null;
  const bonus = plan ? bonusDe(plan) : [];
  const bonusChoisi = bonus.find((b) => b.rarete === choix.bonus) || null;
  const dispos = base ? pouvoirsDe(base, itemsMagiques) : [];
  const parNom = new Map(dispos.map((r) => [r.data.name, r]));
  const pris = (choix.pouvoirs || []).map((n) => parNom.get(n)).filter(Boolean);
  const status = choix.status || "Crafting";
  /* ⚖️ LOT 283 — UNE MUNITION S'OUVRE SUR UN LOT DE DIX (Eric, 24/09 : « pour les projectiles
     on a décidé 10 mais on ne paye qu'une fois le montant ») ; le joueur peut descendre. */
  const qteParDefaut = estMunition(base) ? LOT_MUNITION : 1;
  const qte = Math.max(1, Math.min(PLAFOND_QTE, Math.floor(Number(choix.qte)) || qteParDefaut));

  const cote = coteDe({
    base, bonus: bonusChoisi && bonusChoisi.rarete, qte,
    pouvoirs: pris.map((p) => p.data.rarity),
  });

  const n = elx("section", "x5");
  n.dataset.objet = "x5";
  n.dataset.ecran = "X5";
  n.setAttribute("role", "group");
  n.setAttribute("aria-label", "Blueprint");
  n.dataset.status = status.toLowerCase();
  /* ⭐ LA FICHE PORTE SA FEUILLE, comme X1 et X2. */
  const feuille = elx("style");
  feuille.setAttribute("data-fhpc", "x5");
  feuille.textContent = feuilleDesCotesX5();
  n.append(feuille);
  /* ⚖️ LOT 273 — la fiche est une DALLE (Eric, 25/09 : « plus joli que le parchemin ») :
     la feuille la peint, par la règle de famille des fiches X. ⛔ Rien à monter ici. */
  if (!dispos.length) n.dataset.pouvoirs = "aucun";

  /* ⚖️ LE TITRE — Eric, 25/09 : « le titre c'est Blueprint ». */
  const titre = elx("h2", "x5-titre", "Blueprint");
  titre.dataset.organe = "TITRE";
  n.append(titre);

  /* ⚖️ LE TYPE EST CELUI DU PLAN — ⛔ un menu qui proposerait « Scroll » depuis une arme
     mentirait sur ce qu'X5 sait faire aujourd'hui. */
  const type = plan && plan.data && plan.data.category === "armor" ? "Armor" : "Weapon";
  n.append(
    menu("TYPE", type, [{ valeur: type, mot: type }], null),
    menu("ITEM", base && base.data.name,
      offertesBases.map((b) => ({ valeur: b.data.name, mot: b.data.name })), surChoix),
    /* ⭐ Le mot affiché est « +1 », la valeur est la RARETÉ — lue dans le plan. */
    menu("BONUS", bonusChoisi && bonusChoisi.rarete,
      bonus.map((b) => ({ valeur: b.rarete, mot: b.mot })), surChoix, { aucun: "—" }));

  /* ⚖️ LES DEUX POUVOIRS PORTENT CHACUN LA LISTE ENTIÈRE — « 2 dropdown à 10 pouvoirs ».
     ⭐ `encorePossibles` retire ce qui ferait dépasser la limite ; le pouvoir déjà pris par
     l'AUTRE case est retiré, un objet ne porte pas deux fois la même propriété. */
  for (const [i, nom] of [[0, "POWER 1"], [1, "POWER 2"]]) {
    const autres = pris.filter((_, k) => k !== i);
    const socle = [bonusChoisi && bonusChoisi.rarete, ...autres.map((p) => p.data.rarity)].filter(Boolean);
    const offerts = encorePossibles(socle, dispos).filter((r) => !autres.includes(r));
    n.append(menu(nom, pris[i] ? pris[i].data.name : "",
      offerts.map((r) => ({ valeur: r.data.name, mot: r.data.name })), surChoix, { aucun: "—" }));
  }

  /* ⚖️ LA 4ᵉ LIGNE — « Crafting / Qty, plus petits, les deux dropdowns centrés ».
     ⚖️ La quantité s'arrête à 10 : « je ne veux pas qu'une tuile puisse sortir du craft avec
     plus de 10 » (Eric, 24/09). */
  n.append(
    menu("STATUS", status, ["Crafting", "Buying", "Found"].map((v) => ({ valeur: v, mot: v })), surChoix),
    menu("QTY", String(qte), Array.from({ length: PLAFOND_QTE }, (_, k) => ({ valeur: String(k + 1), mot: String(k + 1) })), surChoix));

  const prix = prixSaisi(choix.prix);
  /* ⚖️ Eric, 25/09 (retouche) : « en free, pas d'encart ». ⭐ La phrase bleue dit le reste, et
     « la partie inférieure est identique » : les organes sont posés en absolu, rien ne remonte.
     ⛔ Sauf un refus de l'appelant, qui doit se lire quelque part. */
  if (status !== "Found" || alerte) {
    n.append(encart(cote, status, base, prix, surChoix ? (v) => surChoix("PRIX", v) : null, alerte, type));
  }

  /* ⚖️ LA PHRASE SOUS L'ENCART — Eric, 25/09 : « une petite phrase explique que la somme sera
     débitée en cliquant sur Send », puis « le texte en bleu explique un peu quand même ».
     ⭐ Le bleu de la maison pour un texte qui guide : `--info` en T1 (« T1 texte police bleue,
     c'est l'aiguilleur »). */
  n.append(phraseDuStatut(status));

  /* ⚖️ LE JETON DE L'OBJET — centré, cliquable : il ouvre une fiche X1 en APERÇU (Eric,
     25/09 : « une fiche X1 avec uniquement un back, options de lock, attune, wear grisées »).
     ⭐ Son nom vient de `nomCrafte`, la fonction du moteur : le jeton, la fiche et la ligne
     posée par `Send` disent le MÊME nom. ⭐ Et son corps est celui de tous les jetons. */
  const nomDuJeton = nomCrafte({ base: base ? base.data.name : "", bonus: bonusChoisi ? bonusChoisi.mot : null,
    pouvoirs: pris.map((p) => p.data.name) });
  const jeton = elx("button", "wares-jeton x5-jeton");
  jeton.type = "button";
  jeton.dataset.organe = "JETON";
  jeton.setAttribute("aria-label", `${nomDuJeton} — preview`);
  jeton.append(...corpsDuJeton({ nom: nomDuJeton }));
  if (surJeton && base) {
    jeton.addEventListener("click", () => surJeton({ nom: nomDuJeton, base, bonus: bonusChoisi, pouvoirs: pris, cote, status }));
  } else jeton.disabled = true;
  n.append(jeton);

  /* ⚖️ LA BOURSE À DROITE DU JETON — Eric, 25/09 : « on peut mettre l'item bourse à droite du
     token (idem celui de gear) ». ⭐ L'ORGANE DE R, importé : le bouton à l'image, le montant
     posé dessus (`montantDeLaBourse`), le popup (`popupDeLaBourse`). ⛔ Rien de redessiné. */
  n.append(...laBourse({ bourse, bourseOuverte, surBourse, surFermerBourse, surMonnaie }));

  const destination = choix.destination || "backpack";
  /* ⭐ `SEND` POSE L'OBJET DANS LA FICHE (lot 265). Il s'arme quand l'assemblage est LÉGAL
     et porte au moins un bonus ou un pouvoir — ⛔ une base nue n'est pas un craft. Il ne
     paie ni n'écrit rien lui-même : il rend ce qui a été composé, et le montant. */
  const destOk = DESTINATIONS.some((d) => d.valeur === destination && d.actif && d.valeur !== "craft");
  const compose = Boolean(bonusChoisi) || pris.length > 0;
  const pret = Boolean(surEnvoyer) && Boolean(base) && cote.legal && compose && destOk;
  n.append(...lePied({ destination, surChoix, surAnnuler, pret,
    pourquoi: !compose ? "choose a bonus or a power first"
      : !cote.legal ? "this assembly is not craftable" : "not available here",
    envoyer: () => surEnvoyer({
      base, bonus: bonusChoisi, pouvoirs: pris, cote, status, destination,
      cout: enPieces(montantDuStatut(cote, status, prix)),
    }) }));

  return { noeud: n, cote };
}

/* ══ LES PIÈCES COMMUNES AUX DEUX FAMILLES (lot 277) — ⛔ un seul écrivain chacune ══ */

/** ⚖️ LA PHRASE SOUS L'ENCART — Eric, 25/09 : « une petite phrase explique que la somme sera
 *  débitée en cliquant sur Send », puis « le texte en bleu explique un peu quand même ». */
function phraseDuStatut(status) {
  const phrase = elx("p", "x5-phrase", {
    Found: "You found it, it's a gift, or you stole it: it's free. Tap Send to put it in your equipment.",
    Buying: "Tap Send: the price × the quantity is taken from your purse, and the item goes to your equipment.",
  }[status] || "Tap Send: the total is taken from your purse, and the crafted item goes to your equipment.");
  phrase.dataset.organe = "PHRASE";
  return phrase;
}

/** ⚖️ LA BOURSE À DROITE DU JETON — l'organe de R, importé (image, montant, popup). */
function laBourse({ bourse, bourseOuverte, surBourse, surFermerBourse, surMonnaie }) {
  const purse = elx("button", "gear-bouton");
  purse.type = "button";
  purse.dataset.organe = "purse";
  purse.setAttribute("aria-label", "Purse");
  if (surBourse) purse.addEventListener("click", surBourse);
  const out = [purse, montantDeLaBourse({ bourse })];
  if (bourseOuverte) out.push(popupDeLaBourse({ bourse, surFermerBourse, surMonnaie }));
  return out;
}

const MOT_SEND = D.ORGANES.find((o) => o.nom === "SEND").mot;

/** ⚖️ LE PIED — Cancel (gauche) · Send to (centré) · Craft & Send (droite). `pret` arme `Send`,
 *  `pourquoi` dit pourquoi il ne l'est pas. */
function lePied({ destination, surChoix, surAnnuler, pret, pourquoi, envoyer }) {
  const cancel = elx("button", "x5-porte", "Cancel");
  cancel.type = "button"; cancel.dataset.organe = "CANCEL";
  if (surAnnuler) cancel.addEventListener("click", surAnnuler);
  /* ⚖️ LOT 302 — « Craft & / Send », sur deux lignes (Eric, 26/09) : c'est ce bouton qui CRÉE
     l'objet — avant lui, le contenu du collecteur n'est pas un item (lot 300). ⭐ Le MOT est
     celui du plan (`X5_gen.py`), ⛔ pas un littéral ici : un seul écrivain. */
  const send = elx("button", "x5-porte", MOT_SEND);
  send.type = "button"; send.dataset.organe = "SEND";
  send.disabled = !pret;
  if (pret) {
    send.setAttribute("aria-label", "Craft & Send — create the item and put it in the character's equipment");
    send.addEventListener("click", envoyer);
  } else {
    send.title = `Craft & Send — ${pourquoi}`;
    send.setAttribute("aria-label", `Craft & Send — not available: ${pourquoi}`);
  }
  return [cancel,
    menu("SEND TO", destination,
      DESTINATIONS.filter((d) => d.valeur !== "craft")
        .map((d) => ({ valeur: d.valeur, mot: d.mot, inactif: !d.actif })), surChoix),
    send];
}

/* ══ LOT 277 — LA FAMILLE À VARIANTE ═══════════════════════════════════════════════
   ⚖️ Eric, 2026-09-25, le schéma puis « oui c'est ça » :
        Blueprint
        Ioun Stone ▾
        Variant ▾  (Awareness · Protection · …)
        Crafting        Qty
        ┌ encart : Enchanting · rareté de la variante · temps · Total ┐
        [ token ]        [ bourse ]
        Cancel     Send to     Send
   ⭐ C'EST LA MÊME COQUILLE : les organes communs sont ceux de la famille à base, posés par
   la même table ; seuls `PLAN` et `VARIANT` changent, sur les rangées TYPE et ITEM · BONUS,
   et la rangée des pouvoirs disparaît (`data-pouvoirs="aucun"`) — tout remonte.
   @param o — ceux de `construireX5`, plus :
     · `plansFreres` — les plans à variante (le menu PLAN ne garde que ceux de la catégorie) ;
     · `valeurDe(record)` — la valeur d'un objet fini, `{ cout: "4,000 GP" }` : l'organe de
       Wares (`fabriqueDeValeur`), ⛔ pas une seconde règle de prix ici.
   `choix.variante` est le MOT de la variante (« Awareness »). */
const MOT_DE_CATEGORIE = { "wondrous-item": "wondrous item", potion: "potion", wand: "wand",
  ring: "ring", rod: "rod", staff: "staff", scroll: "scroll" };
function construireX5Variante(o) {
  const { plan, plansFreres = [], valeurDe = null, choix = {}, fh = true,
    surChoix = null, surAnnuler = null, surEnvoyer = null, surJeton = null, alerte = "",
    bourse = null, bourseOuverte = false, surBourse = null, surFermerBourse = null, surMonnaie = null } = o;
  const variantes = variantesDe(plan.data);
  const variante = variantes.find((v) => v.mot === choix.variante) || variantes[0];
  const status = choix.status || "Crafting";
  const qte = Math.max(1, Math.min(PLAFOND_QTE, Math.floor(Number(choix.qte)) || 1));
  const fini = recordDUneVariante(plan, variante.mot);
  const valeur = valeurDe && fini ? prixEnPO((valeurDe(fini) || {}).cout || "") : NaN;
  const cote = coteDUneVariante({ variante, valeur, qte });

  const n = elx("section", "x5");
  n.dataset.objet = "x5";
  n.dataset.ecran = "X5";
  n.dataset.famille = "variante";
  n.setAttribute("role", "group");
  n.setAttribute("aria-label", "Blueprint");
  n.dataset.status = status.toLowerCase();
  const feuille = elx("style");
  feuille.setAttribute("data-fhpc", "x5");
  feuille.textContent = feuilleDesCotesX5();
  n.append(feuille);
  /* ⭐ la rangée des pouvoirs n'existe pas pour une variante : tout ce qui suit remonte */
  n.dataset.pouvoirs = "aucun";

  const titre = elx("h2", "x5-titre", "Blueprint");
  titre.dataset.organe = "TITRE";
  n.append(titre);

  /* ⚖️ « Ioun Stone ▾ » — le plan, et ses frères de catégorie. ⭐ Le mot est le nom sans
     l'énumération (« Wand of the War Mage », pas « …, +1, +2, or +3 »). */
  const motDuPlan = (r) => String(r.data.name).replace(/,\s*\+1,\s*\+2,?\s*or\s*\+3\s*$/i, "");
  /* ⭐ LES FRÈRES DE CATÉGORIE, triés ici : l'appelant donne tous les plans à variante, la
     fiche d'une Ioun Stone ne propose que des wondrous. ⛔ Le plan courant y est toujours. */
  const memes = plansFreres.filter((r) => r && r.data && r.data.category === plan.data.category);
  const freres = memes.some((r) => r.data.name === plan.data.name) ? memes : [plan, ...memes];
  n.append(
    menu("PLAN", plan.data.name, freres.map((r) => ({ valeur: r.data.name, mot: motDuPlan(r) })), surChoix),
    menu("VARIANT", variante.mot, variantes.map((v) => ({ valeur: v.mot, mot: v.mot })), surChoix));

  n.append(
    menu("STATUS", status, ["Crafting", "Buying", "Found"].map((v) => ({ valeur: v, mot: v })), surChoix),
    menu("QTY", String(qte), Array.from({ length: PLAFOND_QTE }, (_, k) => ({ valeur: String(k + 1), mot: String(k + 1) })), surChoix));

  const prix = prixSaisi(choix.prix);
  const type = MOT_DE_CATEGORIE[plan.data.category] || "item";
  if (status !== "Found" || alerte) {
    n.append(encart(cote, status, null, prix, surChoix ? (v) => surChoix("PRIX", v) : null, alerte, type));
  }
  n.append(phraseDuStatut(status));

  const jeton = elx("button", "wares-jeton x5-jeton");
  jeton.type = "button";
  jeton.dataset.organe = "JETON";
  jeton.setAttribute("aria-label", `${variante.nom} — preview`);
  jeton.append(...corpsDuJeton({ nom: variante.nom }));
  if (surJeton) jeton.addEventListener("click", () => surJeton({ nom: variante.nom, plan, variante, cote, status }));
  else jeton.disabled = true;
  n.append(jeton);

  n.append(...laBourse({ bourse, bourseOuverte, surBourse, surFermerBourse, surMonnaie }));

  const destination = choix.destination || "backpack";
  const destOk = DESTINATIONS.some((d) => d.valeur === destination && d.actif && d.valeur !== "craft");
  const pret = Boolean(surEnvoyer) && cote.legal && destOk;
  n.append(...lePied({ destination, surChoix, surAnnuler, pret,
    pourquoi: !cote.legal ? "this item has no readable value" : "not available here",
    envoyer: () => surEnvoyer({ plan, variante, cote, status, destination,
      cout: enPieces(montantDuStatut(cote, status, prix)) }) }));
  return { noeud: n, cote };
}

export { PLAFOND_QTE };
