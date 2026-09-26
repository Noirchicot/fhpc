/* ══ X5 — LA FICHE BLUEPRINT DU PARCHEMIN DE SORT — lot 285 ═══════════════════════════
   ⚖️ LA DICTÉE QUI FAIT FOI — Eric, 2026-09-26 :
        « choisir : classe de sort · choisir lvl
          4 étages de sorts token, un dropdown
          send »
   puis « toujours mettre rareté prix qté ».
   ⭐ LUE AINSI : Blueprint / CLASS ▾ · LEVEL ▾ / quatre rangées de JETONS de sorts / les pages /
   la NOTE (rareté · temps · prix, puis Qty · Total) / QTY · le COLLECTEUR du parchemin · la
   bourse / Cancel · SEND TO (« un dropdown ») · Send.
   ⚖️ LOT 290 — Eric, 26/09 : *« le collecteur doit être vide pour accueillir le sort dans X5 »*.
   Le collecteur est VIDE tant qu'aucun sort n'est choisi ; on y GLISSE un jeton de sort (au
   doigt, le tap ouvre l'info du sort ; à la souris, le clic gauche choisit).

   📐 LE PLAN COTÉ : `FH-WEB/FHPC/Plan-ecran-X5/X5_gen.py`, famille `parchemin` (v4), recopié
   dans `x5-disposition.mjs`. ⛔ Aucune cote ne s'écrit ici : la feuille de X5 pose chaque
   organe, `feuilleDuParchemin` ne dit que la grille — et elle la LIT dans la table.
   🧮 LES RÈGLES : `craft-parchemin.mjs` (classes, niveaux, cote) et `bareme-srfh.mjs` (la
   table du SRD). ⛔ Aucune règle de jeu ici.

   ⭐ LES PIÈCES COMMUNES SONT CELLES DE LA COQUILLE — `menu`, `laBourse`, `lePied`, `or` et
   la feuille des cotes arrivent en argument depuis `construireX5` (`x5-ecran.mjs`). ⛔ Ce
   module ne les importe pas : `x5-ecran` l'importe, un import en retour ferait une boucle ;
   ⛔ et il ne les recopie pas : deux pieds divergeraient au premier réglage. */
import * as D from "./x5-disposition.mjs?v=843";
import { enPieces, PLAFOND_QTE } from "./craft.mjs?v=843";
import { classesDesSorts, niveauxDeLaClasse, sortsDe, motDuNiveau, coteDUnParchemin, nomDuParchemin }
  from "./craft-parchemin.mjs?v=843";
import { DESTINATIONS } from "./gear-ecran.mjs?v=843";
import { corpsDuJeton } from "./jeton-objet.mjs?v=843";
import { armerJeton, fantome } from "./glisser.mjs?v=843";
import { estPlanParchemin } from "../../src/build/objet-crafte.mjs?v=843";

/* ⭐ LOT 290 — LE NOM DU CRÉNEAU DU COLLECTEUR, écrit UNE fois, lu par la cible et par le dépôt
   (le patron de Wares, `CRENEAU_COLLECTEUR`). ⛔ `onDepot` reçoit le `data-creneau` de la
   cible, pas son nœud (`glisser.mjs`). */
export const CRENEAU_SORT = "x5:sort";

const px = (v) => `${Math.round(v * 100) / 100}px`;
function elx(balise, classe, texte) {
  const n = document.createElement(balise);
  if (classe) n.className = classe;
  if (texte !== undefined) n.textContent = texte;
  return n;
}

/** La fiche est-elle celle d'un parchemin ? — le plan le dit par sa table (⛔ aucun nom). */
export function estFicheParchemin(o) {
  return Boolean(o && o.plan && o.plan.data && estPlanParchemin(o.plan.data));
}

/* ⚖️ « 4 étages de sorts token » — la grille de Wares : 3 × 4 = 12 jetons par page, lus dans
   la table (`GRILLE_SORTS`). ⛔ Pas un 12 écrit ici. */
const G = D.GRILLE_SORTS;
export const PAR_PAGE = G.colonnes * G.rangees;

/** ⭐ LA GRILLE DES SORTS, ET RIEN D'AUTRE — la feuille de X5 pose déjà la BOÎTE de l'organe
 *  `SORTS` ; ceci dit comment les jetons s'y rangent. Toutes les valeurs viennent de la table. */
export function feuilleDuParchemin() {
  return `.x5 [data-organe="SORTS"]{display:grid;grid-template-columns:repeat(${G.colonnes},${px(G.l)});`
    + `grid-auto-rows:${px(G.h)};gap:${px(G.ecart)};align-content:start}`
    /* ⭐ LOT 290 — LE FANTÔME D'UN JETON DE SORT a la cote du jeton (« identique à l'objet »).
       ⚠️ Il est monté hors de la grille (`.app`, `glisser.mjs`), où le `100 %` de `.wares-jeton`
       se résoudrait contre la page entière : la cote se redit donc ici, lue dans la table. */
    + `.x5-sort.glisse-fantome,.x5-jeton.glisse-fantome{inline-size:${px(G.l)};block-size:${px(G.h)}}`;
}

const borne = (n, min, max) => Math.max(min, Math.min(max, n));

/** ⚖️ LA FICHE X5 DU PARCHEMIN.
 *  @param {object} o — ceux de `construireX5`, plus :
 *   · `sorts` — les RECORDS de sort de la pile (⛔ pas des vues) ;
 *   · `choix` — `{ classe, niveau, sort, page, qte, destination }`, tenu par l'appelant.
 *     `sort` est le NOM du sort ; `niveau` un entier (0 = cantrip).
 *   · `surChoix(organe, valeur)` — `CLASS` · `LEVEL` · `SORT` · `PAGE` (la page visée) · `QTY` ·
 *     `SEND TO` ; `surEnvoyer(envoi)` — `{ plan, sort, niveau, cote, status, destination, cout }` ;
 *     `surJeton(apercu)` — `{ nom, plan, sort, niveau, cote, status }`.
 *  @param pieces — les pièces communes de la coquille (voir l'en-tête).
 *  @returns {{ noeud: HTMLElement, cote: object }} */
export function construireX5Parchemin(o, pieces) {
  const { menu, laBourse, lePied, or, feuilleDesCotesX5 } = pieces;
  const { plan, sorts = [], choix = {}, surChoix = null, surAnnuler = null, surEnvoyer = null,
    surJeton = null, surInfo = null, alerte = "", bourse = null, bourseOuverte = false, surBourse = null,
    surFermerBourse = null, surMonnaie = null } = o;

  /* ⚖️ « choisir : classe de sort · choisir lvl » — lus dans les sorts, ⛔ jamais écrits.
     ⭐ Une classe qui n'a pas le niveau choisi retombe sur SON premier niveau. */
  const classes = classesDesSorts(sorts);
  const classe = classes.includes(choix.classe) ? choix.classe : (classes[0] ?? null);
  const niveaux = classe === null ? [] : niveauxDeLaClasse(sorts, classe);
  const voulu = Number.parseInt(choix.niveau, 10);
  const niveau = niveaux.includes(voulu) ? voulu : (niveaux[0] ?? null);
  const offerts = niveau === null ? [] : sortsDe(sorts, classe, niveau);
  const sort = offerts.find((s) => s.data.name === choix.sort) || null;
  const pages = Math.max(1, Math.ceil(offerts.length / PAR_PAGE));
  /* ⭐ sans page demandée, on ouvre celle du sort choisi */
  const page = borne(Number.isInteger(choix.page) ? choix.page
    : (sort ? Math.floor(offerts.indexOf(sort) / PAR_PAGE) : 0), 0, pages - 1);
  const qte = borne(Math.floor(Number(choix.qte)) || 1, 1, PLAFOND_QTE);
  const cote = niveau === null ? { legal: false, raison: "niveau-illisible" } : coteDUnParchemin({ plan, niveau, qte });

  const n = elx("section", "x5");
  n.dataset.objet = "x5";
  n.dataset.ecran = "X5";
  n.dataset.famille = "parchemin";
  n.setAttribute("role", "group");
  n.setAttribute("aria-label", "Blueprint");
  n.dataset.status = "crafting";
  const feuille = elx("style");
  feuille.setAttribute("data-fhpc", "x5");
  feuille.textContent = `${feuilleDesCotesX5()}\n${feuilleDuParchemin()}`;
  n.append(feuille);

  const titre = elx("h2", "x5-titre", "Blueprint");
  titre.dataset.organe = "TITRE";
  n.append(titre);

  n.append(
    menu("CLASS", classe, classes.map((c) => ({ valeur: c, mot: c })), surChoix),
    menu("LEVEL", niveau === null ? "" : String(niveau),
      niveaux.map((k) => ({ valeur: String(k), mot: motDuNiveau(k) })), surChoix));

  /* ⚖️ « 4 étages de sorts token » — un jeton par sort, le corps de tous les jetons
     (`corpsDuJeton`). `aria-pressed` dit le sort choisi à l'œil (le halo, `shell.css`) comme
     à l'oreille.
     ⚖️ LOT 290 — LE GESTE EST CELUI DU VIVIER (`renderChoixGlisses`, loi d'Eric du 16/08) :
     au doigt, tap = INFO et glisser sur le collecteur = CHOISIR ; à la souris, clic gauche =
     choisir, clic droit = info. ⛔ Sans `surInfo`, le tap choisit, au doigt comme à la souris
     (la même clause que le vivier : un écran sans info à donner ne change pas de geste). */
  const grille = elx("div", "x5-sorts");
  grille.dataset.organe = "SORTS";
  grille.setAttribute("role", "list");
  grille.setAttribute("aria-label", classe === null ? "Spells" : `${classe} spells, ${motDuNiveau(niveau)}`);
  for (const s of offerts.slice(page * PAR_PAGE, (page + 1) * PAR_PAGE)) {
    /* ⭐ la case de Wares (`wares-case`, l'élément de liste) porte le bouton — ⛔ un bouton qui
       se dirait `listitem` perdrait son rôle de bouton */
    const c = elx("div", "wares-case");
    c.setAttribute("role", "listitem");
    const b = elx("button", "wares-jeton x5-sort");
    b.type = "button";
    b.dataset.sort = s.data.name;
    b.setAttribute("aria-pressed", s === sort ? "true" : "false");
    b.setAttribute("aria-label", `${s.data.name}${s === sort ? ", chosen" : ""}`);
    b.append(...corpsDuJeton({ nom: s.data.name }));
    const choisir = () => { if (surChoix) surChoix("SORT", s.data.name); };
    armerJeton(b, {
      onLever: (x, y) => fantome.lever(b, x, y),
      onBouger: (x, y) => fantome.suivre(x, y),
      onPoser: () => fantome.ranger(),
      onTap: (type) => { if (surInfo && type !== "mouse") surInfo(s); else choisir(); },
      onDepot: (creneau) => { if (creneau === CRENEAU_SORT) choisir(); },
    });
    /* le clic droit — l'autre moitié de la loi ; ⛔ `armerJeton` ne s'arme que sur le bouton 0 */
    if (surInfo) {
      b.addEventListener("contextmenu", (ev) => {
        if (ev && typeof ev.preventDefault === "function") ev.preventDefault();
        surInfo(s);
      });
    }
    /* ⌨️ LE CLAVIER GARDE SON CHOIX : `Entrée` sur un bouton émet un `click` sans pointeur
       (`detail === 0`). ⛔ Un clic de souris ou de doigt porte `detail ≥ 1` et passe déjà par
       `armerJeton` : l'écouter ici choisirait deux fois. */
    b.addEventListener("click", (ev) => { if (ev && ev.detail === 0) choisir(); });
    c.append(b);
    grille.append(c);
  }
  n.append(grille);

  /* ⚖️ LES PAGES — la règle de Wares (`liste-une-seule-page-pas-de-fleches`) : une seule page,
     pas de chevrons ; ⛔ et pas par `display: none` — un chevron qu'on ne compose pas ne se
     tabule pas. Le compte reste : il dit « 1/1 ». ⭐ Les chevrons tournent en rond. */
  if (pages > 1) {
    for (const [nom, sens, mot, dit] of [["PAGE G", -1, "‹", "Previous page"], ["PAGE D", 1, "›", "Next page"]]) {
      const c = elx("button", "wares-chevron x5-page", mot);
      c.type = "button";
      c.dataset.organe = nom;
      c.setAttribute("aria-label", dit);
      if (surChoix) c.addEventListener("click", () => surChoix("PAGE", String((page + sens + pages) % pages)));
      n.append(c);
    }
  }
  const compte = elx("span", "wares-compte x5-pages", `${page + 1}/${pages}`);
  compte.dataset.organe = "PAGES";
  n.append(compte);

  /* ⚖️ LA NOTE — « toujours mettre rareté prix qté » (Eric, 26/09). Ligne 1 : le scribing du
     SRD et la rareté LUE (« Scribing: 5 days · 150 GP · Uncommon ») ; ligne 2, en bleu : la
     quantité, le total, et que `Send` le débite (la phrase des autres familles, en une ligne).
     ⭐ Le refus de l'appelant (« Not enough coin… ») prend la place de la ligne 2. */
  const note = elx("p", "x5-note");
  note.dataset.organe = "NOTE";
  if (cote.legal) {
    note.append(elx("span", "x5-note-scribing",
      `Scribing: ${cote.temps} · ${or(cote.craftUnitaire)}${cote.rarete ? ` · ${cote.rarete}` : ""}`));
  } else {
    note.append(elx("span", "x5-note-scribing", "No spell to scribe here."));
  }
  const ligne2 = alerte ? elx("span", "x5-note-total x5-note-refus", alerte)
    : elx("span", "x5-note-total", cote.legal
      ? `Qty ${qte} · Total ${or(cote.craftTotal)} · paid from your purse on Send` : "");
  if (alerte) ligne2.setAttribute("role", "alert");
  note.append(ligne2);
  n.append(note);

  /* ⚖️ « toujours mettre … qté » — le menu QTY de la coquille, 1 à 10 (`PLAFOND_QTE`) ;
     à GAUCHE du jeton, en miroir de la bourse (le plan le vérifie). */
  n.append(menu("QTY", String(qte),
    Array.from({ length: PLAFOND_QTE }, (_, k) => ({ valeur: String(k + 1), mot: String(k + 1) })), surChoix));

  n.append(collecteurDuSort({ plan, sort, niveau, cote, surJeton, surChoix }));

  n.append(...laBourse({ bourse, bourseOuverte, surBourse, surFermerBourse, surMonnaie }));

  /* ⚖️ « un dropdown · send » — le SEND TO du pied commun, puis Send ; Cancel à gauche.
     ⭐ `Send` paie le coût de scribing (le Total), pose la ligne et rend la main. */
  const destination = choix.destination || "backpack";
  const destOk = DESTINATIONS.some((d) => d.valeur === destination && d.actif && d.valeur !== "craft");
  const pret = Boolean(surEnvoyer) && Boolean(sort) && cote.legal && destOk;
  n.append(...lePied({ destination, surChoix, surAnnuler, pret,
    pourquoi: !sort ? "choose a spell first" : !cote.legal ? "this spell has no readable level" : "not available here",
    envoyer: () => surEnvoyer({ plan, sort, niveau, cote, status: "Crafting", destination,
      cout: enPieces(cote.craftTotal) }) }));

  return { noeud: n, cote };
}

/** ⚖️ LE COLLECTEUR DU PARCHEMIN — l'organe `JETON` du plan (87 × 48, la cote d'un jeton :
 *  « un collecteur = un jeton en taille », NORMES §1 ter bis ; ⛔ aucune cote ici, la feuille
 *  de X5 la pose).
 *  ⚖️ Eric, 26/09 : *« le collecteur doit être vide pour accueillir le sort dans X5 »*.
 *   · VIDE (aucun sort) : le collecteur de l'Équipement, tel quel — `.gear-collecteur`, le creux
 *     sans liseré de NORMES §2 ter, qui s'allume sous le doigt (`[data-vise]`). ⛔ Aucun mot :
 *     ni « Spell Scroll », ni nom. `data-compte="0"` est la donnée de l'organe (il ne retient
 *     rien), pas un réglage de peinture.
 *   · REMPLI : il porte le jeton « Spell Scroll (Fireball) » — le nom du MOTEUR
 *     (`nomDUnParchemin`) : le jeton, la fiche X1 et la ligne posée par `Send` disent le même.
 *     Il ouvre l'aperçu X1. ⭐ Il reste une CIBLE : glisser un autre sort dessus le remplace
 *     (un seul sort par parchemin).
 *  ⭐ La cible est la même dans les deux états (`data-creneau`), et c'est ce qui permet au
 *  doigt de CHANGER de sort sans passer par un geste neuf. */
/* ⚖️ LOT 300 — L'ALLER-RETOUR. Eric, 26/09, mot pour mot : *« Ce collecteur peut faire un aller
   retour, mais son contenu n'est pas un item tant qu'on n'a pas fait send »*. ⭐ Le jeton posé
   se GLISSE hors du collecteur : lâché hors de toute cible, le collecteur se vide
   (`surChoix("SORT", null)`) — c'est le geste d'annulation d'un récepteur (`onHorsCible`,
   `glisser.mjs`). Lâché sur le collecteur même, rien ne change. ⭐ « pas un item » : son tap
   ouvre l'APERÇU (options grisées, *« Not yours yet »*, lot 270), jamais une fiche d'objet. */
function collecteurDuSort({ plan, sort, niveau, cote, surJeton, surChoix = null }) {
  if (!sort) {
    const vide = elx("div", "gear-collecteur x5-collecteur");
    vide.dataset.organe = "JETON";
    vide.dataset.creneau = CRENEAU_SORT;
    vide.dataset.vise = "false";
    vide.dataset.compte = "0";
    vide.dataset.rempli = "false";
    vide.setAttribute("aria-label", "Spell collector — empty, drag a spell here");
    return vide;
  }
  const nomDuJeton = nomDuParchemin(plan, sort);
  const jeton = elx("button", "wares-jeton x5-jeton x5-collecteur");
  jeton.type = "button";
  jeton.dataset.organe = "JETON";
  jeton.dataset.creneau = CRENEAU_SORT;
  jeton.dataset.vise = "false";
  jeton.dataset.rempli = "true";
  jeton.setAttribute("aria-label", `${nomDuJeton} — preview`);
  jeton.append(...corpsDuJeton({ nom: nomDuJeton }));
  const apercu = () => { if (surJeton && cote.legal) surJeton({ nom: nomDuJeton, plan, sort, niveau, cote, status: "Crafting" }); };
  armerJeton(jeton, {
    onLever: (x, y) => fantome.lever(jeton, x, y),
    onBouger: (x, y) => fantome.suivre(x, y),
    onPoser: () => fantome.ranger(),
    onTap: apercu,
    onDepot: () => {},   // lâché sur un créneau (lui-même) : il reste
    onHorsCible: () => { if (surChoix) surChoix("SORT", null); },
  });
  /* ⌨️ le clavier garde l'aperçu : `Entrée` émet un `click` sans pointeur (`detail === 0`) */
  jeton.addEventListener("click", (ev) => { if (ev && ev.detail === 0) apercu(); });
  return jeton;
}
