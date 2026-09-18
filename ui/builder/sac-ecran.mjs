/* ══ L'ÉCRAN SB3.1 — LE SAC ═══════════════════════════════════════════════════
   Lot 214. Quatre rangées de trois jetons par SECTION, une roue pour passer de
   l'une à l'autre, et la rangée d'échange de R autour du collecteur.

   🔴 TOUTE LA GÉOMÉTRIE VIENT DE `sac-disposition.mjs`, ET CE FICHIER EST GÉNÉRÉ
   (`Plan-backpack/backpack_gen.py` → `backpack_cotes.json` → la déclaration).
   Ce module PEINT, il ne décide d'aucune cote : il lit la table, pose chaque
   organe à son `x`/`y` du plan. ⛔ Aucun nombre ne s'écrit ici. Un nombre qui
   manque à la table se demande à la table — il ne se retape pas.

   🔴 LES POSITIONS SORTENT DANS UNE FEUILLE CONSTRUITE, PAS EN STYLE EN LIGNE :
   le garde 7 des jetons interdit `.style` dans tout `ui/`. Une valeur qui vient
   de la DONNÉE ne peut pas vivre dans `shell.css` (elle y serait recopiée) —
   elle sort donc dans une feuille que ce module écrit depuis la table, une règle
   par organe. `shell.css` ne porte que l'HABIT : la forme, l'encre, les états.

   ⭐ ET LE JETON N'EST PAS DESSINÉ ICI : il vient de `jeton-objet.mjs`, l'organe
   que l'écran R porte aussi. Deux copies divergeraient à la première marque
   ajoutée — c'est la doctrine payée trois fois (l'interrupteur du menu, les
   chevrons de Destiny, ce jeton).

   ⏳ CE QUE CE PREMIER JET NE FAIT PAS ENCORE, et le dit : le glisser d'une
   section à l'autre, les popups de `Sort` et de `Sections`, la molette du tuner.
   La table les porte, l'écran les POSE — les gestes viendront sur ce socle. */

import { DALLE, MARGE, TOUCH, JETON, ROUE, COLONNES, ORGANES } from "./sac-disposition.mjs?v=657";
import { corpsDuJeton, motDuJeton } from "./jeton-objet.mjs?v=657";

/** La clef DOM de chaque organe de la table. ⛔ Elle ne se devine pas du nom :
 *  une clef est un contrat entre la table, la feuille et le garde. */
export const CLEF_DE = Object.freeze({
  "ROUE": "roue", "TUNER G": "tuner-g", "TUNER D": "tuner-d",
  "CRAN 1": "cran-1", "CRAN 2": "cran-2", "CRAN 3": "cran-3", "CRAN 4": "cran-4", "CRAN 5": "cran-5",
  "TRIER": "trier", "TASSER": "sections",
  "POIDS 1": "poids-1", "POIDS 2": "poids-2", "POIDS 3": "poids-3",
  "COLLECTEUR": "collecteur", "TALLY": "tally", "PARTY TALLY": "party-tally", "PURSE": "purse",
  "SEND VERS": "send-vers", "GEAR": "gear", "SEND": "send", "WARES": "wares",
  "RANGEE": "rangee", "livre": "livre", "?": "guide"
});
/* les douze cases prennent leur clef de leur nom : CASE 2.3 → case-2-3 */
const clefDeCase = (nom) => nom.toLowerCase().replace(/\s/g, "-").replace(".", "-");

const px = (v) => `${Math.round(v * 100) / 100}px`;
/* 🔴 UN ORGANE NICHÉ SE POSE PAR RAPPORT À SON HÔTE, PAS À LA DALLE — faute vue
   au banc, premier rendu : les cinq crans portaient les `x` de la TABLE (32, 93,
   154…) alors qu'ils vivent DANS la roue, elle-même posée à 32. Ils partaient
   donc 32 trop à droite et se tronquaient en « P… ».
   ⭐ La table dit `dans: "ROUE"` : l'écart se calcule, il ne se retape pas. */
const NICHES = new Set(["CRAN 1", "CRAN 2", "CRAN 3", "CRAN 4", "CRAN 5"]);
const hote = (o) => (NICHES.has(o.nom) ? ORGANES.find((p) => p.nom === o.dans) : null);
const pose = (o) => {
  const h = hote(o);
  const dx = h ? (h.cible ? h.cible.x : h.x) : 0;
  const dy = h ? (h.cible ? h.cible.y : h.y) : 0;
  const c = o.cible;
  return c
    ? `left:${px(c.x - dx)};top:${px(c.y - dy)};width:${px(c.l)};height:${px(c.h)};` +
      `border-width:${px((c.h - o.h) / 2)} ${px((c.l - o.l) / 2)}`
    : `left:${px(o.x - dx)};top:${px(o.y - dy)};width:${px(o.l)};height:${px(o.h)}`;
};

/** La feuille qui pose chaque organe à sa place du plan. Exportée pour le garde,
 *  qui la relit contre la table.
 *  · un organe SANS cible reçoit sa boîte telle quelle — on le lit, on ne le tape
 *    pas, et le plancher `--touch` ne s'y applique pas ;
 *  · un organe À CIBLE reçoit la boîte de sa CIBLE, et son dessin en creux : les
 *    bords transparents portent l'écart cible − dessin (NORMES §0). */
export function feuilleDesCotesSac() {
  const regles = [];
  for (const o of ORGANES) {
    if (o.creation === false) continue;          /* ⛔ les lunes : cotées, pas posées */
    const id = CLEF_DE[o.nom] || (o.nom.startsWith("CASE ") ? clefDeCase(o.nom) : null);
    if (!id) continue;
    /* ⛔ LES ENFANTS DE LA RANGÉE NE SE POSENT PAS : c'est la grille partagée des
       rangées de contrôles qui les range (cinq listes de `shell.css` la disent
       ensemble). Leur `x` au plan dit où ils TOMBENT, il ne les y met pas. */
    if (o.sorte === "porte" || o.sorte === "rond") continue;
    /* ⛔ SÉLECTEUR DESCENDANT, JAMAIS `>` : un enfant direct enferme une cote dans
       une STRUCTURE, et la structure bouge dès qu'un organe se loge dans un groupe. */
    regles.push(`.sac [data-organe="${id}"]{${pose(o)}}`);
  }
  /* ⚖️ LA RÈGLE D'ERIC (18/09) : *« il faut que le T0 des petites tuiles
     remplissent idem que le T1 de la grande tuile »*. La marge intérieure vaut
     7,5 % de la largeur DU CRAN — 5 sur le dominant, 4 sur un secondaire.
     🔴 ET ELLE NE PEUT PAS S'ÉCRIRE `padding-inline: 7.5%` — faute vue au banc :
     un pourcentage de `padding` se résout sur la largeur du CONTENANT, pas sur
     celle de l'élément. 7,5 % de la roue (311) faisait 23,3 de chaque côté, et
     il ne restait que 20 pour le mot : tous les crans affichaient « P… ».
     ⭐ Le pourcentage reste donc dans la TABLE, où il est vrai, et la feuille en
     DÉDUIT deux nombres — qui ne sont pas retapés : ils se recalculent si une
     cote bouge. */
  for (const o of ORGANES) {
    const id = CLEF_DE[o.nom];
    if (!id || !id.startsWith("cran-")) continue;
    regles.push(`.sac [data-organe="${id}"]{padding-inline:${px(o.l * ROUE.margePct)}}`);
  }
  return regles.join("\n");
}

function el(balise, classe, texte) {
  const n = document.createElement(balise);
  if (classe) n.className = classe;
  if (texte !== undefined) n.textContent = texte;
  return n;
}
function bouton(classe, mot, note, surClic) {
  const b = el("button", classe, mot);
  b.type = "button";
  if (note) b.setAttribute("aria-label", note);
  if (surClic) b.addEventListener("click", surClic);
  return b;
}

/* ══ LES ORGANES ═══════════════════════════════════════════════════════════ */

/** La roue des sections — le tambour d'Équipement à UN étage, sans perspective.
 *  ⚖️ Eric, 18/09 : *« le tambour est mal fait… l'idée est de faire un tambour à un
 *  étage, zoom + halo idem belt sur l'élément actif, les autres en plus petit,
 *  2 de chaque côté »*. ⭐ Le cran sous le viseur NOMME l'écran — NORMES §1
 *  quinquies, *« le tambour désigne »* — donc ⛔ aucun titre n'est dû. */
function roue(options) {
  const r = el("div", "sac-roue");
  r.dataset.organe = "roue";
  r.setAttribute("role", "tablist");
  r.setAttribute("aria-label", "Sections");
  const sections = options.sections || [];
  const n = sections.length;
  const actif = Math.min(Math.max(0, options.section | 0), Math.max(0, n - 1));
  /* ⚖️ CINQ PLACES, PAS CINQ CRANS — deux avant, le dominant, deux après. La table
     ne connaît que des PLACES ; c'est la roue qui décide combien elle en remplit.
     🔴 ET EN DESSOUS DE CINQ SECTIONS, ELLE N'EN REMPLIT PAS CINQ : avec le modulo,
     une seule section s'affichait cinq fois, et un sac neuf — qui n'en a AUCUNE —
     montrait cinq crans nus. ⛔ Une roue qui tourne sur elle-même ment sur ce
     qu'elle contient. Vu dans l'application, pas au banc. */
  for (let i = 0; i < 5; i += 1) {
    const dom = i === 2;
    const brut = actif - 2 + i;
    const idx = n > 5 ? ((brut % n) + n) % n : (brut >= 0 && brut < n ? brut : -1);
    if (idx < 0) continue;                       /* cette place reste vide */
    const c = el("button", "sac-cran", sections[idx].nom);
    c.type = "button";
    c.dataset.organe = `cran-${i + 1}`;
    c.dataset.dominant = dom ? "oui" : "non";
    c.setAttribute("role", "tab");
    c.setAttribute("aria-selected", String(dom));
    if (!dom && options.surSection) c.addEventListener("click", () => options.surSection(idx));
    r.append(c);
  }
  return r;
}

/** Un tuner — chevron au repos, flèche circulaire au survol *(la feuille le peint)*,
 *  et la molette le fait tourner. ⚖️ Eric, 18/09 : *« le chevron devient un bouton
 *  tuner avec une flèche circulaire »* · *« hover avec souris le déclenche »*.
 *  ⛔ LA MOLETTE S'AJOUTE, elle ne remplace rien : le tuner se TAPE toujours. */
function tuner(sens, options) {
  const b = bouton("sac-tuner", "", sens < 0 ? "Previous section" : "Next section",
    () => options.surTourner && options.surTourner(sens));
  b.dataset.organe = sens < 0 ? "tuner-g" : "tuner-d";
  b.dataset.sens = sens < 0 ? "gauche" : "droite";
  /* ⛔ `passive: false` — sans lui le navigateur refuse le `preventDefault`, et la
     page défilerait DERRIÈRE la roue pendant qu'on la tourne. */
  b.addEventListener("wheel", (ev) => {
    if (ev && typeof ev.preventDefault === "function") ev.preventDefault();
    if (options.surTourner) options.surTourner((ev && ev.deltaY < 0) ? -1 : 1);
  }, { passive: false });
  return b;
}

/** Une case de la grille — vide elle attend, occupée elle porte le jeton.
 *  ⭐ LE CORPS DU JETON VIENT DE SON ORGANE (`jeton-objet.mjs`), celui de R. */
function case_(id, objet, options) {
  const c = el("div", "sac-case");
  c.dataset.organe = id;
  if (!objet) {
    c.dataset.creneau = id;
    c.dataset.vise = "false";
    c.setAttribute("aria-label", "Empty");
    return c;
  }
  c.dataset.occupe = "oui";
  c.append(...corpsDuJeton(objet));
  c.setAttribute("aria-label", motDuJeton(objet));
  if (objet.locked === true) c.dataset.verrouille = "oui";
  if (options.surJeton) c.addEventListener("click", () => options.surJeton(objet.index));
  return c;
}

/* ══ L'ÉCRAN ══════════════════════════════════════════════════════════════ */

/** @param {object} options
 *   · `sections` : `[{ nom }]` — celles que le joueur a créées ;
 *   · `section`  : l'index de celle qu'on regarde ;
 *   · `objets`   : les douze places, `null` pour une case vide ;
 *   · `poids`    : `{ gear, backpack, encombrement }`, déjà mis en mots ;
 *   · les gestes : `surTourner`, `surSection`, `surJeton`, `surTrier`,
 *     `surSections`, `surDestination`, `surPorte`.
 *  @returns {{noeud: HTMLElement}} */
export function construireLeSac(options = {}) {
  const noeud = el("div", "sac");
  noeud.dataset.ecran = "SB3.1";

  const feuille = el("style");
  feuille.dataset.fhpc = "sac";
  feuille.textContent = feuilleDesCotesSac();
  noeud.append(feuille);

  /* ⛔ LES TUNERS SONT POSÉS SUR LA DALLE, pas dans la roue : la table les
     déclare `dans: "ROUE"` pour dire qu'ils LUI APPARTIENNENT — un voyant dans
     un bouton, la seule inclusion admise — mais au DOM ils sont frères d'elle,
     sinon leur cible déborderait de sa boîte. */
  const r = roue(options);
  noeud.append(r, tuner(-1, options), tuner(1, options));

  const trier = bouton("sac-outil", "", "Sort this section", () => options.surTrier && options.surTrier());
  trier.dataset.organe = "trier";
  const sections = bouton("sac-outil", "", "Edit sections", () => options.surSections && options.surSections());
  sections.dataset.organe = "sections";
  noeud.append(trier, sections);

  /* les trois lignes de poids — des VOYANTS : on les lit, on ne les tape pas */
  const p = options.poids || {};
  [["poids-1", p.gear], ["poids-2", p.backpack], ["poids-3", p.encombrement]].forEach(([id, mot]) => {
    const v = el("p", "sac-poids", mot || "");
    v.dataset.organe = id;
    noeud.append(v);
  });

  const objets = options.objets || [];
  for (let r = 0; r < 4; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      noeud.append(case_(`case-${r + 1}-${c + 1}`, objets[r * 3 + c] || null, options));
    }
  }

  const col = el("div", "sac-collecteur");
  col.dataset.organe = "collecteur";
  col.dataset.creneau = "collecteur";
  col.setAttribute("aria-label", "Send collector — empty");
  noeud.append(col);

  for (const [id, mot] of [["party-tally", "Party Tally"], ["tally", "Tally"], ["purse", "Purse"]]) {
    const b = bouton("sac-echange", "", mot, () => options.surPorte && options.surPorte(id));
    b.dataset.organe = id;
    noeud.append(b);
  }

  const envoi = el("div", "sac-destination");
  envoi.dataset.organe = "send-vers";
  const s = el("select", "pipeline-dropdown");
  s.setAttribute("aria-label", "Send to");
  for (const d of options.destinations || []) {
    const opt = el("option", null, d.mot);
    opt.value = d.valeur;
    if (!d.actif) opt.disabled = true;
    if (d.valeur === options.destination) opt.selected = true;
    s.append(opt);
  }
  s.addEventListener("change", () => options.surDestination && options.surDestination(s.value));
  envoi.append(s);
  noeud.append(envoi);

  /* ⚖️ LA BARRE DU BAS EST CELLE DE R, ORGANE COMPRIS — Eric, 18/09 : *« et ici on
     veut le livre et le ? »*, puis *« ce sont des petits boutons »*.
     ⛔ ET ELLE CORRIGE UNE NON-CONFORMITÉ DE MON PREMIER JET : mes portes faisaient
     105 × 40 (le gabarit MOYEN) quand celles de R font **77 × 44**, le PETIT. Trois
     portes du même chapitre, au même endroit, ne peuvent pas avoir deux tailles :
     un joueur qui passe de R au sac verrait la rangée bouger sous lui.
     ⭐ ELLES REPRENNENT `gear-porte`, LA CLASSE DE R — pas une copie de son habit :
     la même, donc les mêmes cotes et les mêmes teintes par construction. Le liseré
     dit le verbe (§6) : bleu on navigue, vert on agit — `Send` est le seul à porter
     une conséquence, et c'est la règle d'Eric du 16/09.
     ⏳ DETTE DE NOM, ET ELLE EST NOMMÉE : `gear-porte` dit encore l'écran qui l'a
     portée la première. Le jour où Wares la prendra — il est au programme — elle
     descendra dans un organe au nom neutre, comme l'interrupteur et le jeton. */
  /* ⭐ LA RANGÉE DU BAS EST UN ORGANE, comme sur R : elle porte `data-rangee`, et
     c'est LUI qui donne au livre et au `?` leur habit — il est déclaré pour un
     enfant direct d'une rangée. ⛔ Les poser à même la dalle les laissait nus :
     un disque blanc au lieu d'un livre. */
  const rangee = el("div", "sac-rangee");
  rangee.dataset.organe = "rangee";
  rangee.dataset.rangee = "sac";
  noeud.append(rangee);
  for (const [id, classe, note] of [["livre", "fiche-livre", "The book"]]) {
    const b = bouton(classe, undefined, note, () => options.surPorte && options.surPorte(id));
    b.dataset.organe = id;
    rangee.append(b);
  }
  /* 🔴 LES TROIS PORTES VIVENT DANS UN GROUPE, ET CE N'EST PAS UN ENVELOPPEUR DE
     CONFORT — la faute est déjà écrite dans R : la grille du pied a TROIS colonnes
     (borne | 1fr | borne), et c'est `.rangee-majeurs` qui occupe celle du milieu.
     ⛔ Sans lui, la première porte prend tout le `1fr` et les suivantes passent à
     la ligne : Eric l'avait vu sur deux appareils le 16/09. Je l'ai refait ici. */
  const majeurs = el("div", "rangee-majeurs");
  rangee.append(majeurs);
  for (const [id, mot] of [["gear", "Gear"], ["send", "Send"], ["wares", "Wares"]]) {
    const b = bouton("bouton gear-porte", mot, mot, () => options.surPorte && options.surPorte(id));
    b.dataset.organe = id;
    b.dataset.porte = id;
    majeurs.append(b);
  }
  /* le livre et le `?` encadrent la rangée — deux ronds de 22 dans des cibles de 44.
     ⛔ Ils sont DUS à un écran du parcours (la trilogie de NORMES §6) : le sac en
     est un, contrairement à la fiche de rang X qui s'en passe. */
  const guide = bouton("tuto-point", "?", "What is this screen?",
    () => options.surPorte && options.surPorte("guide"));
  guide.dataset.organe = "guide";
  rangee.append(guide);
  return { noeud };
}
