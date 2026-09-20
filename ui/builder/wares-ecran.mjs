/* ══ L'ÉCRAN WARES — la boutique, dictée par Eric le 2026-09-20 ════════════════
   Trois dalles : le tambour à DEUX étages, la grille de douze, le pied. Les lois vivent dans
   `NORMES.md` (ancres `equipement-wares-*`), les cotes dans `wares-disposition.mjs`.

   ⛔ CET ÉCRAN NE SAIT RIEN DU DOCUMENT, et c'est ce qui le rend regardable au banc : le
   pilote lui passe des catégories, des sous-catégories, une page de jetons et des comptes.
   Il ne lit aucun record, il n'écrit aucune ligne, il ne connaît pas le mot « personnage ».

   ⭐ IL NE REDESSINE RIEN DE CE QUI EXISTE :
     · la roue vient de `roue-tambour.mjs` — module feuille, et Wares en monte DEUX ;
     · le jeton vient de `jeton-objet.mjs` — le nom sur trois lignes, la bande des quatre
       marques. Eric, 20/09 : *« les jetons EXACTEMENT la même règle que dans les menus
       Gear/Backpack »*. ⛔ Pas de prix sur le jeton.
   ⚠️ CE QUI RESTE ÉCRIT TROIS FOIS, ET JE LE NOMME SANS LE CORRIGER ICI : la rangée du pied
   (`data-rangee`, borne | majeurs | borne) est fabriquée par R, par le sac et maintenant par
   Wares. Sa GÉOMÉTRIE n'a qu'un écrivain — la grille de `[data-rangee]`, §6 pré — donc la
   redite est de vingt lignes de structure, pas de cote. Elle appelle son lot ; ce n'est pas
   celui-ci, et un quatrième porteur le rendra nécessaire. */

import {
  DALLE, DALLES, REMBOURRAGE, REMBOURRAGE_GRILLE, ECART, ECART_ETAGES, TOUCH, JETON, ROUE,
  RENDU_GRILLE, PIED, RANGEE, PORTES, PAR_PAGE, COLONNES_GRILLE, RANGEES_GRILLE, FOND, CLEF_DE,
} from "./wares-disposition.mjs?v=767";
import { monterLeTambour } from "./roue-tambour.mjs?v=767";
import { corpsDuJeton, motDuJeton } from "./jeton-objet.mjs?v=767";
import { versionQuery } from "./version.mjs?v=767";

const px = (n) => `${Math.round(n * 1000) / 1000}px`;

function el(balise, classe, texte) {
  const n = document.createElement(balise);
  if (classe) n.className = classe;
  if (texte !== undefined) n.textContent = texte;
  return n;
}

function bouton(classe, mot, nom, surClic) {
  const b = el("button", classe, mot);
  b.type = "button";
  if (nom) b.setAttribute("aria-label", nom);
  if (surClic) b.addEventListener("click", surClic);
  return b;
}

/* ══ LA FEUILLE — ⛔ DES PISTES, JAMAIS DES `left` ═════════════════════════════
   🔒 SACRÉ N° 3 : *« tout est dans une boîte, les boîtes sont sur une grille — les boutons
   compris — et les espaces valent 8, que la grille écrit seule »* (NORMES:2148).
   🔴 ET C'EST LÀ QUE WARES DIVERGE DU SAC, DÉLIBÉRÉMENT. `feuilleDesCotesSac()` traduit son
   plan en `left/top/width/height` : chaque organe est posé en absolu dans sa dalle. Le sacré
   ne cède pas, et Eric l'a rappelé en dictant cet écran — donc ici le plan devient des
   PISTES, et un centre ne s'écrit nulle part.
   ⭐ CE QUE ÇA COÛTE ET CE QUE ÇA RAPPORTE : on perd la liberté de poser un organe n'importe
   où ; on gagne que `135,5` et `394` n'existent dans aucun fichier. Ils sont ce qu'un `1fr`
   rend, et ils se referont justes le jour où `Send to` changera de largeur. */
export function feuilleDesCotesWares() {
  const [tambour, grille, pied] = DALLES;
  const r = [];

  /* la colonne des trois dalles — c'est ELLE qui écrit le line bleed, ⛔ jamais une dalle
     pour sa voisine (CADRES §8 bis) */
  r.push(`.wares{display:grid;grid-template-rows:${px(tambour.h)} ${px(grille.h)} ${px(pied.h)};` +
         `gap:${px(ECART)};width:${px(DALLE.l)};height:${px(DALLE.h)}}`);

  /* ── dalle 1 : deux étages, séparés par les 4 blg dictés ── */
  r.push(`.wares-tambour{display:grid;grid-template-rows:${px(ROUE.hauteurDominante)} ${px(ROUE.hauteurDominante)};` +
         `row-gap:${px(ECART_ETAGES)};padding:${px(REMBOURRAGE)} 0;` +
         `grid-template-columns:${px(22)} 1fr ${px(22)}}`);
  r.push(`.wares-etage{grid-column:1 / -1;display:block;height:${px(ROUE.hauteurDominante)}}`);
  /* la marge du ruban laisse le premier et le dernier cran arriver au centre — c'est elle
     qui rend `scrollLeft = pas × k` exact, et c'est la même que celle du sac */
  r.push(`.wares-ruban{display:flex;gap:${px(ROUE.pas - ROUE.tuile)};` +
         `padding-inline:${px((ROUE.piste - ROUE.tuile) / 2)}}`);

  /* ── dalle 2 : deux gouttières et la grille, sans écart entre elles ──
     ⛔ LES GOUTTIÈRES NE PARTICIPENT PAS AU `gap` : si elles le faisaient, la dalle vaudrait
     2×1fr + 277 + 4×8 = 375 avec un `1fr` de 41, et les colonnes ne tomberaient plus sur
     49 · 144 · 239. Le `gap` vit dans la SOUS-grille, où il sépare des jetons. */
  r.push(`.wares-grille{display:grid;grid-template-columns:1fr ${px(RENDU_GRILLE.jetons.l)} 1fr;` +
         `padding-block:${px(REMBOURRAGE_GRILLE)}}`);
  r.push(`.wares-cases{display:grid;grid-template-columns:repeat(${COLONNES_GRILLE},${px(JETON.l)});` +
         `grid-template-rows:repeat(${RANGEES_GRILLE},${px(JETON.h)});gap:${px(ECART)}}`);
  /* le filigrane — un MASQUE, pas une image : `background` porte l'encre thématique, donc il
     reste lisible le jour comme la nuit. L'image posée telle quelle (elle est NOIRE)
     s'évanouirait sur le fond de nuit.
     🔴 ET IL EST UN ORGANE DE LA GRILLE, ⛔ PLUS UN ABSOLU — mon propre garde 13 m'a repris :
     je l'avais posé en `left`/`top`, ce que le sacré n° 3 refuse. ⭐ Posé dans LA MÊME cellule
     que les jetons, il se centre tout seul et déborde de 6 en haut et en bas — exactement le
     débord que le plan décrit, sans qu'aucun des deux nombres soit écrit. */
  const url = `url("./assets/${FOND.image}${versionQuery(import.meta.url)}")`;
  r.push(`.wares-fond{grid-column:2;grid-row:1;place-self:center;` +
         `width:${px(FOND.l)};height:${px(FOND.h)};` +
         `mask-image:${url};-webkit-mask-image:${url}}`);
  r.push(`.wares-cases{grid-column:2;grid-row:1}`);

  /* ── dalle 3 : trois colonnes, trois rangées, les deux côtés qui enjambent ──
     ⭐ ET VOICI TOUT LE CENTRAGE D'ERIC, EN DEUX DÉCLARATIONS : la cellule enjambe les
     rangées 1 à 2 (`grid-row: 1 / 3`, soit 48 + 8 + 44 = 100) et se centre dedans. C'est ce
     qui met la bourse et les Tally *« entre 2 lignes »*, comme il l'avait dit avant de le voir. */
  r.push(`.wares-pied{display:grid;grid-template-columns:1fr ${px(PIED.colonnes[1])} 1fr;` +
         `grid-template-rows:${px(48)} ${px(TOUCH)} ${px(TOUCH)};row-gap:${px(ECART)};` +
         `padding:${px(REMBOURRAGE)} ${px(REMBOURRAGE)}}`);
  r.push(`.wares-cote{grid-row:1 / 3;display:grid;place-self:center;place-items:center;` +
         `grid-auto-flow:column;gap:${px(ECART)}}`);
  r.push(`.wares-pied > [data-organe="collecteur"]{grid-column:2;grid-row:1;justify-self:center}`);
  r.push(`.wares-pied > [data-organe="send-vers"]{grid-column:2;grid-row:2;align-self:center}`);
  r.push(`.wares-pied > [data-rangee]{grid-column:1 / -1;grid-row:3}`);
  return r.join("\n");
}

/* ══ UN ÉTAGE DU TAMBOUR ═══════════════════════════════════════════════════════
   ⚖️ « fonctionnement exactement celui de backpack » (Eric, 20/09) — même roue, même
   navigation, ⛔ et elle ne tourne plus à l'infini. Le second étage n'est pas un second
   mécanisme : c'est le MÊME, monté deux fois. */
function etage(nom, items, actif, surViser) {
  const roue = el("div", "wares-roue wares-etage");
  roue.dataset.organe = CLEF_DE[nom];
  roue.setAttribute("role", "tablist");
  roue.setAttribute("aria-label", nom === "ROUE CATEGORIES" ? "Categories" : "Sub-categories");
  const ruban = el("div", "wares-ruban");
  roue.append(ruban);

  const crans = items.map((it, i) => {
    const c = bouton("wares-cran", it.nom, it.nom);
    c.dataset.snap = "oui";
    c.dataset.position = String(i);
    c.setAttribute("role", "tab");
    c.setAttribute("aria-selected", String(i === actif));
    return c;
  });
  /* ⛔ LE CHOIX N'EST PAS LE TAP : le tambour aimante, et c'est le viseur qui choisit — la loi
     du catalogue (II.3). L'écran écoute donc le DÉFILEMENT, pas le clic ; le clic n'a qu'à
     amener le cran sous le viseur, ce que le module fait déjà. */
  roue.addEventListener("scroll", () => {
    const k = Math.round(roue.scrollLeft / ROUE.pas);
    if (k !== actif && surViser) surViser(Math.max(0, Math.min(k, items.length - 1)));
  });
  return monterLeTambour({ roue, ruban, crans, actif, pas: ROUE.pas });
}

/* ══ UN JETON DE LA GRILLE ═════════════════════════════════════════════════════
   ⚖️ Eric, 20/09 : *« les jetons EXACTEMENT la même règle que dans les menus Gear/Backpack.
   Différence une seule : un tap sur token mène à un écran X2 pas X1. »*
   ⛔ PAS DE PRIX ICI. Le prix vit sur la fiche et dans la recherche — *« exactement la même
   règle »* ferme la porte, et c'est la réponse à la question que j'allais poser.
   ⏳ ET LA BANDE DES QUATRE MARQUES DÉCRIT UN OBJET POSSÉDÉ. Sur une étagère de boutique les
   quatre tombent à « non », et `corpsDuJeton` le fait déjà tout seul : la bande rend ses 14
   blg sans rien dire. On garde — dire *« ce que tu possèdes déjà »* serait une règle neuve,
   et elle appartient à Eric. */
function jeton(item, surJeton) {
  const b = bouton("wares-jeton", undefined, motDuJeton(item));
  b.dataset.refId = item.ref;
  b.dataset.glissable = "true";
  b.append(...corpsDuJeton(item));
  /* ⭐ UN TAP OUVRE UN X2 — la fiche d'un objet du CATALOGUE. ⛔ Pas un X1 : celui-là est la
     fiche d'un objet qu'on POSSÈDE, et on ne possède rien sur une étagère. */
  if (surJeton) b.addEventListener("click", () => surJeton(item.ref));
  return b;
}

/* ══ LA GOUTTIÈRE — un chevron et un compte ════════════════════════════════════
   ⚖️ `liste-une-seule-page-pas-de-fleches` (26/08) : *« quand il y a 3 tokens, on n'affiche
   que 3 tokens, pas besoin de flèches »*. ⛔ Et surtout PAS par `display: none` — défaut n° 3
   du dépôt : une flèche masquée garde sa place et reste atteignable au clavier. On ne la
   compose pas, c'est tout. */
function gouttiere(sens, compte, actif, surPage) {
  const g = el("div", "wares-gouttiere");
  g.dataset.cote = sens;
  if (actif) {
    const mot = sens === "gauche" ? "‹" : "›";
    const b = bouton("wares-chevron", mot, sens === "gauche" ? "Previous page" : "Next page",
      () => surPage && surPage(sens === "gauche" ? -1 : 1));
    b.dataset.organe = sens === "gauche" ? "page-precedente" : "page-suivante";
    g.append(b);
  }
  const v = el("span", "wares-compte", compte);
  v.dataset.organe = sens === "gauche" ? "compte-objets" : "compte-pages";
  g.append(v);
  return g;
}

/**
 * CONSTRUIT L'ÉCRAN WARES.
 *
 * @param {object} [o]
 * @param {{nom:string}[]} [o.categories]      les crans de l'étage 1
 * @param {number} [o.categorie]               le rang visé à l'étage 1
 * @param {{nom:string}[]} [o.sousCategories]  les crans de l'étage 2
 * @param {number} [o.sousCategorie]           le rang visé à l'étage 2
 * @param {object[]} [o.objets]                la PAGE de jetons — au plus `PAR_PAGE`
 * @param {number} [o.compte]                  les objets de la sous-catégorie (gouttière gauche)
 * @param {number} [o.page] [o.pages]          la page courante et leur nombre (gouttière droite)
 * @param {string} [o.bourse]                  le montant, déjà mis en mots
 * @param {number} [o.compteTally]
 * @param {string} [o.destination]
 * @param {{valeur:string,mot:string}[]} [o.sections]
 * @param {(i:number)=>void} [o.surCategorie] [o.surSousCategorie]
 * @param {(sens:number)=>void} [o.surPage]
 * @param {(ref:string)=>void} [o.surJeton]    ⭐ ouvre un X2
 * @param {(id:string)=>void} [o.surPorte]     gear · send · backpack
 * @param {(id:string)=>void} [o.surBouton]    purse · tally · party-tally
 * @param {(valeur:string)=>void} [o.surDestination]
 * @returns {{ noeud: HTMLElement }}
 */
export function construireLesWares(o = {}) {
  const noeud = el("div", "wares");
  noeud.dataset.ecran = "wares";
  /* ⛔ AUCUN TITRE. Eric, 20/09 : *« Equipment browser dégage »*. Le cran sous le viseur NOMME
     l'écran (NORMES §1 quinquies, « le tambour désigne »), et la 3ᵉ ligne du belt dit déjà
     `Wares`. Deux noms pour un écran sont un libellé qui ment, en plus discret. */

  /* ── DALLE 1 ─────────────────────────────────────────────────────────────── */
  const tambour = el("div", "wares-tambour wares-dalle");
  tambour.append(
    etage("ROUE CATEGORIES", o.categories || [], o.categorie | 0, o.surCategorie),
    etage("ROUE SOUS-CATEGORIES", o.sousCategories || [], o.sousCategorie | 0, o.surSousCategorie),
  );

  /* ── DALLE 2 ─────────────────────────────────────────────────────────────── */
  const grille = el("div", "wares-grille wares-dalle");
  const fond = el("div", "wares-fond");
  fond.setAttribute("aria-hidden", "true");
  grille.append(fond);

  const objets = (o.objets || []).slice(0, PAR_PAGE);
  const pages = Math.max(1, o.pages | 0 || 1);
  const cases = el("div", "wares-cases");
  cases.setAttribute("role", "list");
  for (const item of objets) {
    const c = el("div", "wares-case");
    c.setAttribute("role", "listitem");
    c.append(jeton(item, o.surJeton));
    cases.append(c);
  }
  grille.append(
    gouttiere("gauche", String(o.compte ?? objets.length), pages > 1, o.surPage),
    cases,
    gouttiere("droite", `${(o.page | 0) + 1}/${pages}`, pages > 1, o.surPage),
  );

  /* ── DALLE 3 ─────────────────────────────────────────────────────────────── */
  const pied = el("div", "wares-pied wares-dalle");

  /* les deux Tally, à gauche — centrés dans la cellule par la grille, ⛔ pas par un calcul */
  const gauche = el("div", "wares-cote");
  gauche.dataset.cote = "gauche";
  for (const [id, mot, note] of [["party-tally", "◇", "Party Tally"], ["tally", "◆", "Tally"]]) {
    const b = bouton("wares-tally", mot, note, () => o.surBouton && o.surBouton(id));
    b.dataset.organe = id;
    if (id === "tally" && o.compteTally) b.dataset.compte = String(o.compteTally);
    /* ⛔ LE PARTY TALLY N'A PAS DE DESTINATAIRE, ET IL LE DIT : il se montre inerte plutôt
       que de faire semblant d'écouter — la règle du sac, reprise telle quelle. */
    if (id === "party-tally") b.disabled = true;
    gauche.append(b);
  }
  pied.append(gauche);

  const collecteur = el("div", "wares-collecteur", "SEND COLLECTOR");
  collecteur.dataset.organe = "collecteur";
  pied.append(collecteur);

  /* la bourse, à droite — symétrique des Tally, et centrée par la même déclaration */
  const droite = el("div", "wares-cote");
  droite.dataset.cote = "droite";
  const purse = bouton("wares-purse", o.bourse || "", "Purse", () => o.surBouton && o.surBouton("purse"));
  purse.dataset.organe = "purse";
  droite.append(purse);
  pied.append(droite);

  const envoi = el("select", "wares-send-vers");
  envoi.dataset.organe = "send-vers";
  envoi.setAttribute("aria-label", "Send to");
  for (const s of (o.sections || [])) {
    const opt = el("option", undefined, s.mot);
    opt.value = s.valeur;
    if (s.valeur === o.destination) opt.selected = true;
    envoi.append(opt);
  }
  envoi.addEventListener("change", () => o.surDestination && o.surDestination(envoi.value));
  pied.append(envoi);

  pied.append(rangeeDuPied(o));

  noeud.append(tambour, grille, pied);
  return { noeud };
}

/** La rangée du pied — `Gear · Send · Backpack`, le triangle qui se referme.
 *  ⚖️ NORMES `equipement-wares-pied-triangle` : chaque écran porte les DEUX portes qu'il n'est
 *  pas. ⛔ `Equipment` est le nom de l'ÉTAPE, jamais d'un écran.
 *  ⭐ LE GROUPE `rangee-majeurs` N'EST PAS DÉCORATIF, et R l'a payé sur deux appareils : sans
 *  lui les trois portes se placent une par une, la première prend tout le `1fr` et les
 *  suivantes passent à la ligne. */
function rangeeDuPied(o) {
  const r = el("div", "wares-rangee");
  r.dataset.rangee = "wares";
  const livre = bouton("fiche-livre wares-livre", undefined, "Rules");
  if (o.livreDe && o.livreDe.href) {
    livre.addEventListener("click", () => { window.open(o.livreDe.href, "_blank", "noopener"); });
  } else {
    livre.disabled = true;
  }
  r.append(livre);
  const majeurs = el("div", "rangee-majeurs");
  for (const id of PORTES) {
    const mot = id === "gear" ? "Gear" : id === "send" ? "Send" : "Backpack";
    const note = id === "send" ? "Send — clears the collector and sends" : mot;
    const b = bouton("wares-porte", mot, note, () => o.surPorte && o.surPorte(id));
    b.dataset.porte = id;
    majeurs.append(b);
  }
  r.append(majeurs);
  return r;
}

export { PAR_PAGE, RANGEE };
