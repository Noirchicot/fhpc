/* ══ L'ÉCRAN R (Gear) — LE CORPS OÙ L'ON S'HABILLE — lot 212, 2026-09-16 ═════
   Le major hub du chapitre Équipement : le pantin, ses emplacements, la
   bourse, le Tally, le collecteur, le dropdown et la rangée du pied. Tout le
   reste du chapitre y revient.

   🔴 TOUTE LA GÉOMÉTRIE VIENT DE `gear-disposition.mjs`, ET CE FICHIER EST
   GÉNÉRÉ (`Plan-ecran-R/R_gen.py` → `R_cotes.json` → la déclaration). Ce
   module PEINT, il ne décide d'aucune cote : il lit la table, pose chaque
   organe à son `x`/`y` du plan, et le garde `tests/gear-ecran.test.mjs`
   vérifie que la table tient les lois (dalle, marge, gouttières 4/8, jeton
   = tokens, cibles ≥ 44, aucun chevauchement, budget 560).
   ⛔ Aucun nombre n'est écrit ici. Un nombre qui manque à la table se demande
   à la table — il ne se retape pas.

   🔴 LES POSITIONS SORTENT DANS UNE FEUILLE CONSTRUITE, PAS EN STYLE EN
   LIGNE. Le garde 7 des jetons interdit `.style` dans tout `ui/` — et son
   attaque montre que `setProperty("--x", …)` est refusé aussi. Le précédent
   est `fonds.mjs` : une VALEUR QUI VIENT DE LA DONNÉE ne peut pas vivre dans
   `shell.css` (elle y serait recopiée), donc elle sort dans une feuille que
   ce module écrit depuis la table, une règle par organe. `shell.css` ne porte
   que l'HABIT — la forme, l'encre, les états — jamais un `left`.

   ⭐ UNE COORDONNÉE DU PLAN COMPTE DEPUIS LE HAUT DE LA DALLE, BELT COMPRIS
   (`DALLE 375 × 560`). L'écran, lui, vit SOUS le belt : chaque `y` de la
   table est donc posé à `y − BELT_H`. C'est la seule arithmétique du fichier,
   et elle est écrite une fois (`haut()`).

   ⛔ LES QUATRE LUNES DU PLAN NE SONT PAS POSÉES. Croquis d'Eric du 15/09 :
   *« OPTIONS FOR LARGER SCREENS ONLY — IN DOUBLE VIEW (IN CHARACTER SHEET
   ONLY) »*, et Eric le 16/09 : *« les lunes sont pour les écrans plus
   grands »*. Elles appartiennent au miroir « Équipement en jeu », pas à la
   création. Le plan les porte avec `creation: false` (Archi 34, 16/09 : elles
   restent dessinées et cotées, la déclaration dit de ne pas les poser). La
   colonne x 0..44 reste VIDE et c'est voulu : elle leur est réservée par
   construction (les rangées L2..L4 commencent à x 49). ⛔ Un lot qui la
   remplirait prendrait la place des lunes.

   📌 CRÉATION OU JEU — la liste de ce que ce module reprend de `b3-*` /
   `equipment-step.mjs`, et la réponse (loi d'Eric, 15/09 : « à la création
   est le SOCLE, en jeu est le SURPLUS ») :
     · BOITES (clefs, `attunable`, `optionnelle`) ......... création — le corps
     · SLOT_VERS_BOITES / POCHES_DEBORD ..................... création — le rangement
     · `attribuerBoites` (slot → première boîte libre) ..... création
     · le glisser (`armerJeton`) ............................ création
     · la bourse (quatre monnaies) .......................... création
     · les destinations du dropdown ......................... création : Backpack ·
       Gear · Tally · Craft. ⛔ Party inventory · Companion · Group PC ·
       Merchant/NPC n'apparaissent pas (« une destination sans destinataire
       n'apparaît pas », artefact du 15/09) — elles sont du jeu ;
     · le poids (`poidsParLieu`, « Gear weight ») ........... création, mais
       SANS COTE au plan (le croquis l'écrit sur le pantin) — pas posé, question
       portée par Archi 34 ;
     · Storage / « remise » (`location: storage`) ........... ⏳ non tranché — le
       croquis du 15/09 dit « OTHER », ce lot ne l'expose pas sur R.

   ⏳ CE QUE CE LOT NE CÂBLE PAS, ET LE DIT : le tap sur un jeton porté (la fiche
   X1, un lot à part) · Companions (B4) · les destinations Tally et Craft du
   dropdown (X3 et B3 — options présentes, désactivées) · le livre (sa cible
   FH WEB est une décision d'Eric : `disabled` tant qu'elle manque). */

import * as D from "./gear-disposition.mjs?v=632";
import { BOITES } from "./b3-disposition.mjs?v=632";
import { armerJeton } from "./glisser.mjs?v=632";
import { versionQuery } from "./version.mjs?v=632";
import { enGP } from "./equipement-pipeline.mjs?v=632";

const { DALLE, BELT_H, MARGE, ORGANES, BARRE } = D;
/* ⏳ Le générateur n'exporte pas encore `PANTIN` (seule `R_cotes.json` le
   porte). Tant qu'il manque, le pantin n'est pas dessiné — ⛔ on ne le retape
   pas depuis la table JSON, on attend la régénération (Archi 34). */
const PANTIN = D.PANTIN || null;

/* ══ DU NOM DU PLAN À LA CLEF DU DÉPÔT ══════════════════════════════════════
   Eric, par Archi 34 (16/09) : *« libellés du plan, clefs du dépôt »* — on ne
   renomme pas sous un lien (`fourreau1..4` / `poche1..4` vivent dans six
   fichiers). La table ci-dessous est le SEUL endroit qui apparie les deux.
   ⚠️ `EXTRA STORAGE` est numéroté par COLONNE au plan (1·2 à gauche, 3·4 à
   droite) et par RANGÉE au dépôt (`poche1·2` en haut) : l'appariement suit la
   POSITION, pas le chiffre. */
export const CLEF_DE = Object.freeze({
  "BODY FORGING": "forge1",  "BODY FORGING opt": "forge2",
  "HEAD/FACE 1": "tete1",    "HEAD/FACE 2": "tete2",
  "TORSO/BACK 1": "torse1",  "TORSO/BACK 2": "torse2",  "TORSO/BACK 3": "torse3",
  "ARM/HANDS 1": "fourreau1", "ARM/HANDS 2": "fourreau2",
  "BELT": "ceinture",
  "POCKET/WEAPON 1": "fourreau3", "POCKET/WEAPON 2": "fourreau4",
  "FOOT/LEGS 1": "pied1",    "FOOT/LEGS 2": "pied2",
  "EXTRA STORAGE 1": "poche1", "EXTRA STORAGE 3": "poche2",
  "EXTRA STORAGE 2": "poche3", "EXTRA STORAGE 4": "poche4",
  "GROUND 1": "sol1",        "GROUND 2": "sol2",
  "SEND COLLECTOR": "collecteur",
  "SEND TO": "send-to",
  "PURSE": "purse", "TALLY": "tally", "COMPANIONS": "companions",
  "BACKPACK": "backpack", "SEND": "send", "WARES": "wares",
  "livre": "livre", "?": "guide"
});

/* Le libellé d'un emplacement — l'écriture du croquis (Eric, 15/09), sans le
   numéro qui n'identifie que la table : `HEAD/FACE 1` et `HEAD/FACE 2` s'écrivent
   tous deux `HEAD/FACE`. `opt` devient un ÉTAT (`data-optionnelle`), pas un mot. */
export function libelleDe(nom) {
  return nom.replace(/\s+opt$/, "").replace(/\s+\d+$/, "");
}

/** Les destinations du dropdown À LA CRÉATION — les quatre qui ont un
 *  destinataire. `actif: false` : la destination existe (X3 Tally, B3 Craft)
 *  mais son écran n'est pas encore là — on la montre, on ne la laisse pas
 *  choisir : un envoi vers nulle part serait un objet perdu. */
export const DESTINATIONS = Object.freeze([
  { valeur: "backpack", mot: "Backpack", actif: true },
  { valeur: "self",     mot: "Gear",     actif: true },
  { valeur: "tally",    mot: "Tally",    actif: false },
  { valeur: "craft",    mot: "Craft",    actif: false }
]);

function eld(balise, classe, texte) {
  const n = document.createElement(balise);
  if (classe) n.className = classe;
  if (texte !== undefined) n.textContent = texte;
  return n;
}
function bouton(classe, texte, note, surClic) {
  const b = eld("button", classe, texte);
  b.type = "button";
  if (note) b.setAttribute("aria-label", note);
  if (surClic) b.addEventListener("click", surClic);
  return b;
}

/* ══ LA FEUILLE DES COTES — écrite depuis la table, jamais à la main ═══════ */
const px = (v) => `${Math.round(v * 100) / 100}px`;
/** Le haut d'un organe, sous le belt. */
const haut = (y) => y - BELT_H;

/** La feuille qui pose chaque organe à sa place du plan. Exportée pour le
 *  garde : il la relit contre la table et vérifie que chaque rectangle du
 *  plan y est, tel quel.
 *  · un JETON ne reçoit que `left`/`top` : sa cote est celle des tokens
 *    (`--glisse-case` × `--glisse-h`, `shell.css`), jamais un nombre d'ici ;
 *  · un BOUTON à cible reçoit la boîte de sa CIBLE, et son dessin en creux :
 *    la face se peint dans le `padding-box`, les bords transparents portent
 *    l'écart cible − dessin (« dessin et cible sont DEUX cotes ») ;
 *  · les PORTES et les RONDS ne sont pas posés un par un : ils vivent dans la
 *    rangée, et c'est la grille de `[data-rangee]` (§6 pré) qui les place.
 *    La rangée, elle, est posée à `BARRE`. */
export function feuilleDesCotes() {
  const regles = [];
  const regle = (id, corps) => regles.push(`.gear > [data-organe="${id}"]{${corps}}`);
  for (const o of ORGANES) {
    const id = CLEF_DE[o.nom];
    /* `creation: false` : l'organe est dessiné au plan (Eric le regarde) mais
       n'existe pas à la création — les lunes. La donnée le dit, pas ce fichier. */
    if (!id || o.creation === false || o.sorte === "porte" || o.sorte === "rond") continue;
    if (o.sorte === "jeton") {
      regle(id, `left:${px(o.x)};top:${px(haut(o.y))}`);
    } else if (o.cible) {
      const c = o.cible;
      regle(id, `left:${px(c.x)};top:${px(haut(c.y))};width:${px(c.l)};height:${px(c.h)};` +
        `border-width:${px((c.h - o.h) / 2)} ${px((c.l - o.l) / 2)}`);
    } else {
      regle(id, `left:${px(o.x)};top:${px(haut(o.y))};width:${px(o.l)};height:${px(o.h)}`);
    }
  }
  regles.push(`.gear > .gear-rangee{left:${px(MARGE)};top:${px(haut(BARRE.y))};` +
    `width:${px(DALLE.l - 2 * MARGE)};height:${px(BARRE.h)}}`);
  if (PANTIN) {
    regles.push(`.gear > .gear-pantin{left:${px(PANTIN.x)};top:${px(haut(PANTIN.y))};` +
      `width:${px(PANTIN.l * PANTIN.echelle)};height:${px(PANTIN.rendu_h)};` +
      `mask-image:url(./assets/${PANTIN.image}${versionQuery(import.meta.url)});` +
      `-webkit-mask-image:url(./assets/${PANTIN.image}${versionQuery(import.meta.url)})}`);
  }
  return regles.join("\n");
}

/* ══ LES ORGANES ════════════════════════════════════════════════════════════ */

/** Un emplacement — vide, il dit son nom ; occupé, il porte le jeton posé, sa
 *  quantité et ses trois voyants. ⛔ CE SONT DES VOYANTS, PAS DES BOUTONS
 *  (artefact 15/09 : « la tuile montre l'état ; la fiche le change ») : on les
 *  lit, on ne les tape pas, le plancher de 44 ne s'applique pas. Seul ⭕ (équipé)
 *  s'allume ce lot ; ♥ (harmonisé) et 🔒 (verrou) restent éteints tant que X1
 *  n'écrit pas la donnée — arbitrage d'Archi 34, 16/09, ⛔ pas un lecteur pour
 *  une donnée que personne n'écrit. */
function emplacement(o, id, pose, options) {
  const boite = BOITES.find((b) => b.clef === id) || null;
  const e = eld("div", "gear-emplacement");
  e.dataset.organe = id;
  const mot = libelleDe(o.nom);
  if (boite && boite.optionnelle) e.dataset.optionnelle = "oui";
  if (!pose) {
    e.append(eld("span", "gear-nom", mot));
    e.setAttribute("aria-label", `${mot} — empty`);
    return e;
  }
  /* ⚖️ Eric, 16/09 (b) : le nom du slot S'EFFACE quand un objet est posé — comme
     le « drop it here » d'un collecteur. ⛔ Pas masqué, pas rendu (garde 4) :
     le nom reste dans l'aria-label, le lecteur d'écran l'entend. */
  e.dataset.occupe = "oui";
  const objet = eld("span", "gear-objet", pose.nom);
  /* la quantité suit le nom sur sa ligne : trois lignes au plus pour les deux */
  if (pose.qte > 1) objet.append(" ", eld("span", "gear-qte", `×${pose.qte}`));
  e.append(objet);
  const voyants = eld("span", "gear-voyants");
  for (const [voyant, etat] of [["verrou", pose.locked], ["equipe", pose.equipped], ["harmonise", pose.attuned]]) {
    const v = eld("span", "gear-voyant");
    v.dataset.voyant = voyant;
    v.dataset.etat = etat === true ? "oui" : "non";
    v.setAttribute("aria-hidden", "true");
    voyants.append(v);
  }
  e.append(voyants);
  if (options.collecte && options.collecte.has(pose.index)) e.dataset.collecte = "oui";
  e.setAttribute("aria-label",
    `${mot} — ${pose.nom}${pose.qte > 1 ? ` ×${pose.qte}` : ""}${pose.equipped ? ", equipped" : ""}`);
  /* Le geste : glisser vers le collecteur. Le tap (la fiche X1) n'est pas de ce lot. */
  armerJeton(e, {
    onTap: () => {},
    onDepot: (creneau) => {
      if (creneau === "collecteur" && options.surCollecte) options.surCollecte(pose.index);
    }
  });
  return e;
}

/** Le collecteur d'envoi — UN jeton (loi du 29/08), la seule cible de dépôt
 *  de cet écran. `data-compte` dit ce qu'il retient ; Send le vide. */
function collecteur(id, options) {
  const c = eld("div", "gear-collecteur");
  c.dataset.organe = id;
  c.dataset.creneau = "collecteur";
  c.dataset.vise = "false";
  const n = options.collecte ? options.collecte.size : 0;
  c.dataset.compte = String(n);
  c.append(eld("span", "gear-nom", "Send collector"));
  c.append(eld("span", "gear-objet", n ? `${n} to send` : ""));
  c.setAttribute("aria-label", n ? `Send collector — ${n} to send` : "Send collector — empty");
  return c;
}

/** Le dropdown `Send to` — l'organe du §8 (`.pipeline-dropdown`) : très large,
 *  peu haut, aucun liseré. Les quatre destinations de la création. */
function dropdown(id, options) {
  const s = eld("select", "pipeline-dropdown gear-send-to");
  s.dataset.organe = id;
  s.setAttribute("aria-label", "Send to");
  for (const d of DESTINATIONS) {
    const opt = eld("option", null, d.mot);
    opt.value = d.valeur;
    if (!d.actif) opt.disabled = true;
    if (d.valeur === options.destination) opt.selected = true;
    s.append(opt);
  }
  s.addEventListener("change", () => { if (options.surDestination) options.surDestination(s.value); });
  return s;
}

/* Les trois boutons libres du corps de l'écran (gabarit « libre », Eric 16/09 :
   « tally bouton libre relief carré avec parchemin » · « bourse bouton libre ») */
function boutonPurse(id, options) {
  const total = options.bourse ? Math.floor(enGP(options.bourse)) : 0;
  const b = bouton("gear-bouton", undefined, `Purse — ${total} gp`, () => options.surBouton && options.surBouton("purse"));
  b.dataset.organe = id;
  /* Eric, 16/09 : « la priorité est de bien voir le montant » — le mot « Purse »
     ne s'écrit plus sur l'image, il vit dans l'aria-label ; le montant seul, centré. */
  b.append(eld("span", "gear-bouton-montant", `${total} gp`));
  return b;
}
function boutonTally(id, options) {
  const n = options.compteTally || 0;
  const b = bouton("gear-bouton", undefined, n ? `Tally — ${n} lines` : "Tally", () => options.surBouton && options.surBouton("tally"));
  b.dataset.organe = id;
  b.dataset.compte = String(n);
  /* ⛔ pas de mot : le dessin est le parchemin d'Eric (croquis 15/09), l'image
     est le bouton — comme les astres du belt. Le nom est dans `aria-label`. */
  return b;
}
function boutonCompanions(id) {
  /* un PETIT de la famille (77, Eric 16/09 : « petit bouton 77 × 40 ») — la
     porte vers B4, posée par la feuille des cotes comme les autres organes */
  const b = bouton("gear-porte", "Companions", "Companions");
  b.dataset.organe = id;
  /* B4 est un lot à part : le bouton se montre, il ne répond pas encore —
     `disabled`, jamais un bouton muet qui passerait pour cassé. */
  b.disabled = true;
  return b;
}

/** La rangée du pied — la cinquième porte de §6 pré : `data-rangee`, deux
 *  bornes et un groupe. Le livre est posé ICI (par l'écran), le `?` y descend
 *  par la coquille (`poserLesBornes`). Les trois portes tiennent la MÊME
 *  largeur 77 (Eric : « Backpack bouton même taille que Send ! ») — au cran
 *  serré de `--bouton-cran-serre` (voir shell.css). */
function rangee(options) {
  const r = eld("div", "gear-rangee");
  r.dataset.rangee = "gear";
  const livre = bouton("fiche-livre gear-livre", undefined, "Rules");
  if (options.livreDe && options.livreDe.href) {
    livre.addEventListener("click", () => { window.open(options.livreDe.href, "_blank", "noopener"); });
  } else {
    /* ⛔ `disabled`, pas un bouton muet : sa cible FH WEB est une décision
       d'Eric (NORMES : « chaque conversion demande une CIBLE »). */
    livre.disabled = true;
  }
  r.append(livre);
  for (const o of ORGANES) {
    if (o.sorte !== "porte") continue;
    const id = CLEF_DE[o.nom];
    const note = id === "send" ? "Send — clears the collector and sends" : o.mot;
    const b = bouton("gear-porte", o.mot, note, () => options.surPorte && options.surPorte(id));
    b.dataset.porte = id;
    r.append(b);
  }
  return r;
}

/**
 * CONSTRUIT L'ÉCRAN R.
 * @param {object} [options]
 * @param {object} [options.boites]        clef → { nom, qte, index, equipped, attuned, locked }
 * @param {object} [options.bourse]        { pp, gp, sp, cp } — les clefs posées
 * @param {number} [options.compteTally]   les lignes du Tally (le panier)
 * @param {Set<number>} [options.collecte] les index gear retenus par le collecteur
 * @param {string} [options.destination]   la valeur choisie du dropdown
 * @param {(id:string)=>void} [options.surPorte]      backpack · send · wares
 * @param {(id:string)=>void} [options.surBouton]     purse · tally
 * @param {(index:number)=>void} [options.surCollecte]
 * @param {(valeur:string)=>void} [options.surDestination]
 * @param {{href?:string}} [options.livreDe]
 * @returns {{ noeud: HTMLElement }}
 */
export function construireLEcranGear(options = {}) {
  const boites = options.boites || {};
  const noeud = eld("section", "gear dalle-intermediaire");
  noeud.dataset.objet = "gear";

  const feuille = eld("style");
  feuille.setAttribute("data-fhpc", "gear");
  feuille.textContent = feuilleDesCotes();
  noeud.append(feuille);

  if (PANTIN) {
    const p = eld("div", "gear-pantin");
    p.setAttribute("aria-hidden", "true");
    noeud.append(p);
  }

  for (const o of ORGANES) {
    const id = CLEF_DE[o.nom];
    if (!id || o.creation === false) continue;   // les lunes : `creation: false` au plan
    if (o.sorte === "jeton") {
      noeud.append(id === "collecteur" ? collecteur(id, options) : emplacement(o, id, boites[id] || null, options));
    } else if (o.sorte === "bouton") {
      if (id === "send-to") noeud.append(dropdown(id, options));
      else if (id === "purse") noeud.append(boutonPurse(id, options));
      else if (id === "tally") noeud.append(boutonTally(id, options));
      else if (id === "companions") noeud.append(boutonCompanions(id));
    }
    /* portes et ronds : dans la rangée, ci-dessous */
  }
  noeud.append(rangee(options));
  return { noeud };
}
