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

import * as D from "./gear-disposition.mjs?v=639";
import { BOITES } from "./b3-disposition.mjs?v=639";
import { armerJeton, fantome } from "./glisser.mjs?v=639";
import { versionQuery } from "./version.mjs?v=639";
import { enGP } from "./equipement-pipeline.mjs?v=639";

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
  "FOOT/LEG 1": "pied1",     "FOOT/LEG 2": "pied2",
  "EXTRA STORAGE 1": "poche1", "EXTRA STORAGE 3": "poche2",
  "EXTRA STORAGE 2": "poche3", "EXTRA STORAGE 4": "poche4",
  "GROUND 1": "sol1",        "GROUND 2": "sol2",
  "SEND COLLECTOR": "collecteur",
  "SEND TO": "send-to",
  "PURSE": "purse", "MONTANT": "montant", "TALLY": "tally", "PARTY TALLY": "party-tally",
  "COMPANIONS": "companions",
  "BACKPACK": "backpack", "SEND": "send", "WARES": "wares",
  "livre": "livre", "?": "guide"
});

/* Le libellé d'un emplacement — l'écriture du croquis (Eric, 15/09), sans le
   numéro qui n'identifie que la table : `HEAD/FACE 1` et `HEAD/FACE 2` s'écrivent
   tous deux `HEAD/FACE`. `opt` devient un ÉTAT (`data-optionnelle`), pas un mot. */
/* ⚖️ Eric, 16/09 : *« foot leg mieux »* — porté au plan par Archi 34 (FOOT/LEG) :
   plus rien à corriger ici, le libellé EST celui de la table. */
export function libelleDe(nom) {
  return nom.replace(/\s+opt$/, "").replace(/\s+\d+$/, "");
}

/** Le libellé posé dans la case : ⚖️ Eric, 16/09 — *« weapons sous pocket ! »*,
 *  puis *« non, on superpose quand ça dépasse »* : la barre reste, et elle
 *  devient une OCCASION de retour (`<wbr>`) — le libellé tient sur une ligne
 *  quand il y tient, se superpose quand il déborde. Rien de forcé. */
function poserLeLibelle(span, mot) {
  const parts = mot.split("/");
  parts.forEach((p, i) => { if (i) span.append("/", document.createElement("wbr")); span.append(p); });
  return span;
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
/* ══ LA BOURSE — le popup qu'ouvre le bouton Purse ═════════════════════════
   ⚖️ COTES ARRÊTÉES PAR ERIC LE 16/09, et pas une n'est devinée : *« la bourse
   il faut la faire »* · *« fais des boutons de 40 »* · *« ça prend la place que
   ça doit, c'est un popup »*. La passation du chapitre les fixe : **186 × 133**,
   quatre monnaies PP · GP · SP · CP sur UNE seule rangée, chacune avec `+` et
   `−`, chaque bouton dessin 40 / cible 44 — comme le Tally.
   📐 LES QUATRE COLONNES SONT DES CIBLES JOINTIVES : x 5 · 49 · 93 · 137, soit
   44 de pas, et 5 + 4 × 44 + 5 = 186. ⛔ C'est POUR ÇA que le popup fait 186 et
   pas les 125 du dépôt : à 125, les `+`/`−` rendaient 23,75 de large, très loin
   du plancher de 44. La largeur est la conséquence du plancher tactile, pas un
   goût — et c'est ce qui rend ce popup non négociable.
   ⚠️ `b3-disposition.mjs:147` porte encore l'ancienne cote : hors de ce lot. */
export const BOURSE = Object.freeze({
  l: 186, h: 133,
  pas: 44,                       /* une colonne = une cible tactile, jointive */
  marge: 5,                      /* 186 − 4 × 44 = 10, cinq de chaque côté */
  bouton: 40,                    /* le dessin, dans la cible de 44 */
  monnaies: Object.freeze([
    Object.freeze({ clef: "pp", mot: "PP" }),
    Object.freeze({ clef: "gp", mot: "GP" }),
    Object.freeze({ clef: "sp", mot: "SP" }),
    Object.freeze({ clef: "cp", mot: "CP" })
  ])
});

export function feuilleDesCotes() {
  const regles = [];
  const regle = (id, corps) => regles.push(`.gear > [data-organe="${id}"]{${corps}}`);
  for (const o of ORGANES) {
    const id = CLEF_DE[o.nom];
    /* ⭐ LA COTE SE POSE POUR TOUT ORGANE QUI A UNE CLEF, MÊME HORS CRÉATION —
       et c'est voulu : le Group Tally n'apparaît qu'en jeu, mais le jour où il
       apparaît il doit être DÉJÀ à sa place, pas posé par une seconde règle
       écrite ailleurs. ⛔ Les quatre lunes restent dehors sans condition de
       `creation` : elles n'ont pas de clef du tout, et c'est `!id` qui les sort. */
    if (!id || o.sorte === "porte" || o.sorte === "rond") continue;
    if (o.sorte === "jeton") {
      regle(id, `left:${px(o.x)};top:${px(haut(o.y))}`);
    } else if (o.sorte === "voyant") {
      /* un VOYANT : une boîte qu'on lit, aucune cible — posée telle quelle */
      regle(id, `left:${px(o.x)};top:${px(haut(o.y))};width:${px(o.l)};height:${px(o.h)}`);
    } else if (o.cible) {
      const c = o.cible;
      regle(id, `left:${px(c.x)};top:${px(haut(c.y))};width:${px(c.l)};height:${px(c.h)};` +
        `border-width:${px((c.h - o.h) / 2)} ${px((c.l - o.l) / 2)}`);
    } else {
      regle(id, `left:${px(o.x)};top:${px(haut(o.y))};width:${px(o.l)};height:${px(o.h)}`);
    }
  }
  /* le montant de la bourse : tant que la table ne le porte pas (⏳ Archi 34, la
     cote est en cours — sa première boîte mordait TORSO/BACK 3), il est DÉDUIT de
     PURSE — juste dessous, à --sp-4 (MARGE), même largeur. Dès que MONTANT est
     dans ORGANES, c'est la règle `[data-organe="montant"]` ci-dessus qui le pose. */
  if (!ORGANES.some((o) => o.nom === "MONTANT")) {
    const purse = ORGANES.find((o) => CLEF_DE[o.nom] === "purse");
    if (purse) regles.push(`.gear > .gear-montant{left:${px(purse.x)};top:${px(haut(purse.y + purse.h + MARGE))};width:${px(purse.l)}}`);
  }
  /* le popup de la bourse : sa boîte et le pas de ses colonnes viennent de la
     table ci-dessus, jamais de la feuille — `shell.css` ne porte aucune cote. */
  /* ⛔ PAS `.gear > .gear-bourse` : le popup n'est pas un enfant DIRECT de la dalle,
     il vit dans son voile. Mesuré au navigateur, la règle ne s'appliquait pas et le
     popup se dimensionnait sur son contenu — 176 au lieu de 186, hauteur libre.
     ⭐ La leçon est plus large que le bug : un sélecteur d'enfant direct enferme une
     cote dans une STRUCTURE, et la structure bouge quand l'écran grandit. */
  regles.push(`.gear .gear-bourse{width:${px(BOURSE.l)};height:${px(BOURSE.h)};padding:${px(BOURSE.marge)}}`);
  regles.push(`.gear .gear-monnaie{width:${px(BOURSE.pas)}}`);
  regles.push(`.gear-monnaie-bouton{width:${px(BOURSE.pas)};height:${px(BOURSE.pas)};` +
    `border-width:${px((BOURSE.pas - BOURSE.bouton) / 2)}}`);
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
    e.append(poserLeLibelle(eld("span", "gear-nom"), mot));
    e.setAttribute("aria-label", `${mot} — empty`);
    /* vide, c'est une CIBLE : Eric, 16/09 — « les items peuvent se déplacer dans
       tous les sens ». Occupée, elle n'en est plus une (une case tient une chose). */
    e.dataset.creneau = id;
    e.dataset.vise = "false";
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
  /* Le geste : glisser vers le collecteur, ou vers n'importe quel emplacement
     vide (Eric, 16/09 : « dans tous les sens ») — avec le fantôme du dépôt
     (« ils ont un fantôme »). Le tap (la fiche X1) n'est pas de ce lot. */
  armerJeton(e, {
    onTap: () => {},
    onLever: (x, y) => fantome.lever(e, x, y),
    onBouger: (x, y) => fantome.suivre(x, y),
    onPoser: () => fantome.ranger(),
    onDepot: (creneau) => {
      if (creneau === "collecteur") { if (options.surCollecte) options.surCollecte(pose.index); }
      else if (options.surPlacer) options.surPlacer(pose.index, creneau);
    }
  });
  return e;
}

/** Le collecteur d'envoi — UN jeton (loi du 29/08), et il ne retient qu'UN objet :
 *  Eric, 16/09 — *« un item dans le collecteur, pas 2 ; si on veut plus c'est un
 *  Tally »*. Plein, il cesse d'être une cible (plus de `data-creneau`) : un
 *  second dépôt ne fait rien. `data-compte` dit ce qu'il retient ; Send le vide. */
function collecteur(id, options, retenu) {
  const c = eld("div", "gear-collecteur");
  c.dataset.organe = id;
  const n = options.collecte ? options.collecte.size : 0;
  if (n === 0) { c.dataset.creneau = "collecteur"; c.dataset.vise = "false"; }
  c.dataset.compte = String(n);
  /* ⚖️ PLEIN, LE COLLECTEUR PORTE L'OBJET LUI-MÊME — Eric, 16/09 au soir : *« lorsqu'un
     token va dans le collecteur, il ne doit pas rester à sa place initiale : il doit
     quitter l'emplacement et rester dans le collecteur »*.
     ⛔ CE QU'IL CORRIGE, ET C'ÉTAIT UN MENSONGE DE L'ÉCRAN : l'objet restait posé dans
     sa boîte avec une simple marque, et le collecteur ne disait qu'un NOMBRE. On voyait
     donc la même épée à deux endroits, et le geste qu'on venait de faire n'avait rien
     déplacé. ⭐ Un panier montre ce qu'il contient ; une place qu'on a vidée est vide. */
  if (retenu) {
    c.dataset.occupe = "oui";
    const objet = eld("span", "gear-objet", retenu.nom);
    if (retenu.qte > 1) objet.append(" ", eld("span", "gear-qte", `×${retenu.qte}`));
    c.append(objet);
    c.setAttribute("aria-label", `Send collector — ${retenu.nom}`);
    /* ⚖️ ET IL EN RESSORT PAR LE MÊME GESTE QU'IL Y EST ENTRÉ — Eric, 16/09 au soir :
       *« un token dans le collecteur doit pouvoir en ressortir »*. ⭐ Rien de neuf
       n'était nécessaire côté données : `surPlacer` retire DÉJÀ la ligne de la collecte
       avant de la poser dans sa boîte, parce qu'un objet ne peut pas être à deux
       endroits. Ce qui manquait était le GESTE — le collecteur portait l'objet sans
       le rendre saisissable, et une chose qu'on voit mais qu'on ne peut pas reprendre
       est une impasse.
       ⛔ Un dépôt sur le collecteur lui-même ne fait rien : il est déjà là. */
    armerJeton(c, {
      onTap: () => {},
      onLever: (x, y) => fantome.lever(c, x, y),
      onBouger: (x, y) => fantome.suivre(x, y),
      onPoser: () => fantome.ranger(),
      onDepot: (creneau) => {
        if (creneau === "collecteur") return;
        if (options.surPlacer) options.surPlacer(retenu.index, creneau);
      }
    });
    return c;
  }
  c.append(eld("span", "gear-nom", "Send collector"));
  /* ⛔ PAS DE SPAN VIDE QUAND IL N'Y A RIEN — Eric, 16/09 au soir : *« italique
     collecteur, centré verticalement et horizontalement »*. Un élément vide reste un
     enfant du flex : il ne se voit pas, mais il compte, et le mot cessait d'être au
     milieu sans qu'on voie pourquoi. Le vide ne se peint pas, il ne se pose pas. */
  if (n) c.append(eld("span", "gear-objet", `${n} to send`));
  c.setAttribute("aria-label", n ? `Send collector — ${n} to send` : "Send collector — empty");
  return c;
}

/** Le dropdown `Send to` — l'organe du §8 (`.pipeline-dropdown`) : très large,
 *  peu haut, aucun liseré. Les quatre destinations de la création. */
function dropdown(id, options) {
  /* ⚖️ UNE BOÎTE AUTOUR DU SELECT, ET C'EST LE `<select>` NATIF QUI L'IMPOSE —
     Eric, 16/09 au soir : *« dans le dropdown rajoute collé au haut, en T1, en
     italique, couleur un peu moins blanc flashy : destination »*. ⛔ On ne peut
     rien écrire DANS un `<select>` : il ne rend que ses `<option>`, et ses
     pseudo-éléments ne sont pas fiables d'un moteur à l'autre. La boîte porte donc
     le mot et l'organe ; le select, lui, ne perd ni son rôle ni son clavier.
     ⭐ C'EST LA BOÎTE QUI PORTE `data-organe` : elle EST l'organe du plan, celui
     dont la cote est posée. Le select la remplit. */
  const boite = eld("div", "gear-destination");
  boite.dataset.organe = id;
  const mot = eld("span", "gear-destination-mot", "destination");
  mot.setAttribute("aria-hidden", "true");   /* le select dit déjà « Send to » */
  const s = eld("select", "pipeline-dropdown gear-send-to");
  s.setAttribute("aria-label", "Send to");
  for (const d of DESTINATIONS) {
    const opt = eld("option", null, d.mot);
    opt.value = d.valeur;
    if (!d.actif) opt.disabled = true;
    if (d.valeur === options.destination) opt.selected = true;
    s.append(opt);
  }
  s.addEventListener("change", () => { if (options.surDestination) options.surDestination(s.value); });
  boite.append(mot, s);
  return boite;
}

/* Les trois boutons libres du corps de l'écran (gabarit « libre », Eric 16/09 :
   « tally bouton libre relief carré avec parchemin » · « bourse bouton libre ») */
function boutonPurse(id, options) {
  const total = options.bourse ? Math.floor(enGP(options.bourse)) : 0;
  const b = bouton("gear-bouton", undefined, `Purse — ${total} gp`, () => options.surBouton && options.surBouton("purse"));
  b.dataset.organe = id;
  /* Eric, 16/09 (soir) : « fais rentrer l'image dans un carré de 50 × 50 » — le
     dessin EST la cible (50 ≥ --touch), l'image est le bouton, le mot « Purse »
     vit dans l'aria-label. Le montant est un VOYANT posé SUR elle (`MONTANT`,
     `dans: "PURSE"` au plan), un organe à part : `montantDeLaBourse`. */
  return b;
}
/** Le montant, SUR la bourse, dans sa zone de 40 × 40 (Eric, 16/09 soir : « la
 *  zone de texte 40 × 40 suffit », « jaune très proche du blanc ») : « 999 gp »
 *  en T1/600 tient sur une ligne (34,21) ; au-delà il se coupe au blanc —
 *  « 99999 » (31,99) puis « gp » — sur les deux lignes que la zone offre.
 *  Un VOYANT, pas un bouton — on le lit, le bouton porte déjà le montant dans
 *  son nom accessible. */
/** Les milliers, séparés par une espace fine INSÉCABLE — Eric, 16/09 au soir, qui
 *  écrit lui-même « 85 565 gp » en demandant à voir. Mesuré à T1/600 : « 99 999 »
 *  rend 33,64 dans les 40 de la zone (contre 31,99 sans séparateur), et l'espace
 *  insécable garde le nombre sur UNE ligne — il se coupe au blanc avant « gp »,
 *  jamais au milieu du nombre.
 *  ⛔ PAS `toLocaleString` : il rend selon la locale de la machine qui l'exécute,
 *  donc autre chose en test qu'au navigateur, et une virgule en anglais. */
function enMilliers(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f");
}
function montantDeLaBourse(options) {
  const total = options.bourse ? Math.floor(enGP(options.bourse)) : 0;
  const m = eld("div", "gear-montant");
  /* ⚖️ « gp » PASSE SOUS LE NOMBRE AU-DELÀ DE DEUX CHIFFRES — Eric, 16/09 au
     soir. ⛔ C'est le COMPTE DES CHIFFRES qui décide, pas la largeur rendue ni
     la longueur de la chaîne : « 1 234 » fait cinq signes et quatre chiffres.
     ⭐ Et ce module ne fait que DIRE l'état : la disposition est peinte par la
     feuille (`[data-empile]`), comme partout ailleurs. */
  m.dataset.empile = String(String(total).length > 2);
  m.append(eld("span", "gear-montant-nombre", enMilliers(total)), eld("span", "gear-montant-unite", "gp"));
  m.dataset.organe = "montant";
  m.setAttribute("aria-hidden", "true");
  return m;
}
/** Le Group Tally — le parchemin BLEU, à gauche du personnel.
 *  ⚖️ IL EST TOUJOURS POSÉ, ET C'EST LE VOILE QUI DIT SON ÉTAT. Eric avait
 *  d'abord dit *« un group tally (optionnel) n'apparaît que quand un des joueurs
 *  ou DM envoie vers le party inventory »* — je l'avais donc rendu absent tant
 *  qu'aucune donnée ne le portait. ⛔ ET C'ÉTAIT LE SERVIR MAL : rien n'alimente
 *  `compteParty` aujourd'hui, donc « conditionnel » voulait dire « jamais », et
 *  Eric ne l'a pas vu à l'écran — *« tu l'as pas mis »*, 16/09 au soir. Il avait
 *  raison : une place réservée que rien n'occupe n'est pas un organe, c'est un trou.
 *  ⭐ ET SES DEUX RÈGLES SE REJOIGNENT, C'EST CE QUI TRANCHE : le voile qu'il a
 *  inventé une heure plus tard (*« le tally pas actif, voile à 20 % »*) dit DÉJÀ
 *  « il n'y a rien là-dedans ». Le parchemin vide à 20 % porte donc exactement le
 *  message que son absence portait — en laissant voir où il est. */
function boutonPartyTally(id, options) {
  const n = options.compteParty || 0;
  const b = bouton("gear-bouton", undefined, n ? `Party tally — ${n} lines` : "Party tally",
    () => options.surBouton && options.surBouton("party-tally"));
  b.dataset.organe = id;
  b.dataset.compte = String(n);
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
  b.dataset.porte = id;   /* le cran du plan (T1/600, rembourrage 4) se pose sur cette paire d'attributs */
  /* B4 est un lot à part : le bouton se montre, il ne répond pas encore —
     `disabled`, jamais un bouton muet qui passerait pour cassé. */
  b.disabled = true;
  return b;
}

/** La bourse — le popup des quatre monnaies. Eric, 16/09 : *« la bourse il faut
 *  la faire »*, *« ça prend la place que ça doit, c'est un popup »*.
 *  ⭐ UN POPUP, DONC IL SE FERME — et par le VOILE, pas par un bouton : la
 *  hauteur de 133 est entièrement prise par les quatre colonnes (5 + 12 + 44 +
 *  16 + 44 + 5 = 126), et y loger un `BACK` aurait demandé de rogner ailleurs
 *  une cote qu'Eric a arrêtée. Retaper la bourse la ferme aussi.
 *  ⛔ LES `+`/`−` NE SONT PAS DES BOUTONS À MOT : ils portent un GLYPHE, donc ni
 *  l'habit de la famille ni son liseré de rôle (NORMES : « un bouton à glyphe
 *  n'en porte pas »). Ils prennent le corps et le rayon, rien de plus. */
function bourseOuverte(options) {
  const v = eld("div", "gear-voile");
  v.dataset.organe = "bourse-voile";
  /* ⛔ ON FERME SUR LE VOILE LUI-MÊME, PAS SUR CE QUI REMONTE : `e.target === v`
     dit « le clic est tombé À CÔTÉ de la bourse ». ⭐ C'est plus sûr qu'un
     `stopPropagation` posé dans le popup — celui-ci suppose que l'événement
     remonte, donc il dépend du moteur, et il échoue en silence là où il n'y en a
     pas. Ici, aucune supposition : on regarde où le doigt est tombé. */
  if (options.surFermerBourse) {
    v.addEventListener("click", (e) => { if (!e || e.target === v) options.surFermerBourse(); });
  }
  const b = eld("div", "gear-bourse");
  b.setAttribute("role", "group");
  b.setAttribute("aria-label", "Purse");
  const sac = options.bourse || {};
  for (const m of BOURSE.monnaies) {
    const col = eld("div", "gear-monnaie");
    col.dataset.monnaie = m.clef;
    const n = Number.isInteger(sac[m.clef]) ? sac[m.clef] : 0;
    col.append(eld("span", "gear-monnaie-mot", m.mot));
    col.append(cranDeMonnaie("+", m, n + 1, `One more ${m.mot}`, options));
    col.append(eld("span", "gear-monnaie-compte", String(n)));
    /* ⛔ PLANCHER À ZÉRO, ET IL EST DIT DEUX FOIS EXPRÈS : `setCurrency` le tient
       déjà (« une bourse n'a pas de dette »), mais un bouton qui ne fait rien au
       lieu d'être éteint est un bouton cassé pour qui le regarde. */
    col.append(cranDeMonnaie("−", m, n - 1, `One less ${m.mot}`, options, n === 0));
    b.append(col);
  }
  v.append(b);
  return v;
}
function cranDeMonnaie(glyphe, m, valeur, note, options, eteint) {
  const b = bouton("gear-monnaie-bouton", glyphe, note,
    () => options.surMonnaie && options.surMonnaie(m.clef, valeur));
  b.dataset.cran = glyphe === "+" ? "plus" : "moins";
  if (eteint) b.disabled = true;
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
  /* 🔴 LA RANGÉE PORTE SON PROPRE GROUPE, ET ELLE NE L'EMPRUNTE À PERSONNE.
     ⛔ CE QUE ÇA RÉPARE, ET ERIC L'A VU SUR DEUX APPAREILS (iPad et Mac, 16/09 au
     soir) : les trois portes rendaient ~274 blg au lieu de 77 et débordaient sur
     deux lignes. La grille du pied a trois colonnes — borne | 1fr | borne — et
     c'est `.rangee-majeurs` qui occupe celle du milieu. Sans lui, les portes se
     placent une par une : la première prend tout le `1fr`, les suivantes passent
     à la ligne.
     ⚠️ ET POURQUOI JE NE LE VOYAIS PAS : `poserLesBornes` (la coquille) crée ce
     groupe au montage de l'écran. Un repeint qui ne repasse pas par elle — et
     tout geste interne à Gear en est un — reconstruit la rangée SANS groupe. Le
     défaut n'apparaît donc qu'APRÈS le premier geste, jamais à l'ouverture.
     ⭐ `poserLesBornes` REPREND un groupe déjà là (`dejaLa`, shell.mjs) au lieu
     d'en créer un second : le poser ici ne double rien, et rend l'écran juste
     qu'elle passe ou non. */
  const majeurs = eld("div", "rangee-majeurs");
  for (const o of ORGANES) {
    if (o.sorte !== "porte") continue;
    const id = CLEF_DE[o.nom];
    const note = id === "send" ? "Send — clears the collector and sends" : o.mot;
    const b = bouton("gear-porte", o.mot, note, () => options.surPorte && options.surPorte(id));
    b.dataset.porte = id;
    majeurs.append(b);
  }
  r.append(majeurs);
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
 * @param {(index:number, boite:string)=>void} [options.surPlacer]   un jeton posé sur un emplacement vide
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

  /* ce que la collecte retient, cherché UNE fois : les boîtes sont un dictionnaire,
     la collecte un ensemble d'index — et le collecteur n'en tient qu'un (Eric, 16/09). */
  const estCollecte = (p) => !!(p && options.collecte && options.collecte.has(p.index));
  const retenu = Object.values(boites).find(estCollecte) || null;

  for (const o of ORGANES) {
    const id = CLEF_DE[o.nom];
    /* ⭐ UNE SEULE CONDITION, ET C'EST LA CLEF : les quatre lunes n'en ont pas
       (elles sont d'un autre écran), donc elles sortent ici sans qu'on nomme
       `creation`. Ce qui est hors création mais DE cet écran — le Group Tally —
       est posé plus bas par sa donnée, et par elle seule. */
    if (!id) continue;
    if (o.sorte === "jeton") {
      if (id === "collecteur") { noeud.append(collecteur(id, options, retenu)); continue; }
      /* ⭐ UN OBJET COLLECTÉ A QUITTÉ SA BOÎTE : on le retire ICI, en amont, plutôt que
         de demander à l'emplacement de se taire. La place redevient vide — donc une
         CIBLE — sans qu'aucune règle d'affichage ait à connaître la collecte. */
      const pose = boites[id] || null;
      noeud.append(emplacement(o, id, pose && estCollecte(pose) ? null : pose, options));
    } else if (o.sorte === "voyant") {
      if (id === "montant") noeud.append(montantDeLaBourse(options));
    } else if (o.sorte === "bouton") {
      if (id === "send-to") noeud.append(dropdown(id, options));
      else if (id === "purse") noeud.append(boutonPurse(id, options));
      else if (id === "tally") noeud.append(boutonTally(id, options));
      else if (id === "party-tally") noeud.append(boutonPartyTally(id, options));
      else if (id === "companions") noeud.append(boutonCompanions(id));
    }
    /* portes et ronds : dans la rangée, ci-dessous */
  }
  /* ⏳ tant que le plan ne porte pas MONTANT, le montant se pose quand même — déduit */
  if (!ORGANES.some((o) => o.nom === "MONTANT")) noeud.append(montantDeLaBourse(options));
  noeud.append(rangee(options));
  /* ⭐ EN DERNIER, DONC AU-DESSUS : un popup recouvre ce qu'il interrompt, et
     l'ordre du DOM suffit à le dire — aucun `z-index` à accorder avec personne. */
  if (options.bourseOuverte) noeud.append(bourseOuverte(options));
  return { noeud };
}
