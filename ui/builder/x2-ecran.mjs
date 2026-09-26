/* ══ X2 — LA FICHE D'UN OBJET DU CATALOGUE — lot 242 ═════════════════════════
   Le tap sur une tuile de Wares ouvre CETTE fiche. Elle recouvre toute la dalle,
   375 × 500 sous le belt, comme X1.

   ⚖️ LA LOI QUI LUI DONNE SON NOM — `NORMES.md`, `equipement-la-fiche-du-
   catalogue-est-un-x2`, vivante depuis le 20/09 : *« La fiche d'un objet du
   CATALOGUE est un `X2` ; celle d'un objet POSSÉDÉ est un `X1`. »*
   🔴 CE QU'ELLE RÉPARE : cet écran était codé sous le nom de vue **`b1`** — *le
   même mot que le rang B1, qui est le sac*. ⛔ Un nom, deux objets. Eric a
   confirmé le 21/09 : *« oui b1 = X2 »*.
   📌 ET CE N'EST PAS UN ÉCRAN NEUF : il existait, il marchait, son retour rendait
   Wares avec son rayon, sa sous-catégorie et sa page. ⛔ Rien de sa logique n'a
   changé ici — les organes ont été DÉPLACÉS, pas reconstruits.

   ══ 🪡 LA COUTURE — CE QUI VIENT DE X1 ET CE QUI VIENT DU CROQUIS ═══════════
   ⚖️ Eric, 2026-09-21 : *« X2 — (les flèches rondes dégagent) · ligne du haut
   idem X1 · texte idem · TOUT IDEM JUSQU'AU TRAIT BAS DU TEXTE. En dessous place
   les éléments comme dans mon croquis. Utilise les existants de la X2 et on fera
   des corrections. En bas les boutons idem mon dessin. »* Puis : *« le 1/X
   dégage »*.

     au-dessus du second filet │ ✅ STRICTEMENT X1, et IMPORTÉ
     en dessous               │ le croquis du 21/09

   🔴 « IDEM X1 » VEUT DIRE *IMPORTER*, PAS *RECOPIER*, et le dépôt le disait déjà
   en toutes lettres, dans l'en-tête de `parchemin.mjs` : *« la fiche ne sait pas
   dessiner une feuille, elle sait qu'elle en porte une. Le jour où un second
   écran en veut une, il l'importe — ⛔ il ne la recopie pas. »* Ce jour est ce
   lot, et la phrase vaut pour TOUTE la tête, pas seulement pour la feuille.
   ⭐ LES DEUX FICHES MONTENT DONC LE MÊME ORGANE : `construireLaTeteDeFiche`
   (`x1-ecran.mjs`). ⛔ Il n'y a pas un seul organe de tête fabriqué ici — le
   garde `x2-ecran.test.mjs` le vérifie, et il a été éprouvé ROUGE.

   ══ ⛔ CE QUE CE LOT NE POSE PAS, ET POURQUOI ═══════════════════════════════
   · LES COTES SOUS LA COUTURE. X1 pose chaque organe en absolu depuis une table
     GÉNÉRÉE (`x1-disposition.mjs`, sortie de `X1_gen.py`). X2 n'a pas la sienne,
     et ⛔ une feuille de cotes ne se retape pas à la main : elle se demande au
     générateur. Les organes du croquis sont donc posés dans une BANDE unique
     (`x2-pied`), dont les quatre cotes sont LUES dans la table de X1 — la
     couture, la dalle, la marge de côté, la marge de pied. Dedans, ils gardent
     la disposition en flux des organes existants de la X2. ⏳ C'est l'ébauche
     qu'Eric a demandée (*« on fera des corrections »*), pas un fini.
   · LE GRAND VIDE CENTRAL du croquis est donc rendu par construction : la bande
     range son contenu vers le BAS, et ce qui reste au-dessus est le vide.
   · `1/2` ET `2` EN GROS — ⛔ NON TRAITÉS, et c'est délibéré. Eric ne les a pas
     expliqués. Ils ressemblent à l'idiome `champNombre` de X1 (*« 1/2, et le 1
     est modifiable »* — on prélève sur un stock), mais ⛔ une ressemblance
     d'organes est exactement le terrain où ce dépôt se trompe. Ils attendent un
     mot d'Eric.
   · LE MODE LECTURE. L'œil est POSÉ — c'est l'un des deux ornements de la tête,
     et Eric a dit *« tout idem »* — mais ⛔ il n'a rien à retirer ici : X2 n'a
     aucune rangée d'options entre la couture et sa bande. Ses cotes de lecture
     sont donc un NO-OP mesurable (`BAS_DE_TETE + 8` rend exactement la hauteur
     normale du texte), ⛔ pas un nombre inventé. Le jour où X2 reçoit sa table,
     l'œil poussera le texte sur la bande comme il le fait chez X1.

   ⚖️ ET COMME X1, ELLE N'ÉCRIT JAMAIS DANS LE BELT — Eric, 16/09 : *« les x ne
   s'inscrivent pas dans le belt »*. ⛔ `x2` n'entre donc pas dans `FENETRE_DE`
   (`equipment-step.mjs`), et c'est son ABSENCE de cette table qui le garantit. */
import * as D from "./x1-disposition.mjs?v=832";
/* ⭐ LA TÊTE, ENTIÈRE, PAR UN SEUL APPEL — ⛔ aucun de ces trois n'est réécrit ici. */
import { construireLaTeteDeFiche, feuilleDesCotesDeTete, BAS_DE_TETE, texteDeLUnite, remplirLaDescription } from "./x1-ecran.mjs?v=832";
/* ⭐ LES DESTINATIONS SONT CELLES DE L'ÉCRAN R, PAS UNE SECONDE LISTE — le même
   choix que X1 : le jour où une destination s'ouvre (Tally, Craft), les trois
   écrans l'apprennent ensemble. ⛔ Le croquis en dessine huit ; la liste qui
   PILOTE en porte cinq, et les inactives s'y disent déjà par `actif: false`.
   Compléter la liste depuis un dessin serait une règle de jeu écrite par un
   écran — ⏳ elle appartient à Eric, et le rapport la lui rend. */
import { DESTINATIONS } from "./gear-ecran.mjs?v=832";
/* ⭐ LA MONNAIE VIENT DU PIPELINE, TELLE QUELLE : c'est lui qui parse un coût du
   SRD, le multiplie et dit si la bourse couvre. ⛔ X2 n'a aucun tarif à lui. */
import { parseCout, multiplieCout, bourseCouvre } from "./equipement-pipeline.mjs?v=832";

function elx(balise, classe, texte) {
  const n = document.createElement(balise);
  if (classe) n.className = classe;
  if (texte !== undefined) n.textContent = texte;
  return n;
}
function boutonX(mot, classe, surClic, note) {
  const b = elx("button", classe, mot);
  b.type = "button";
  if (note) b.setAttribute("aria-label", note);
  if (surClic) b.addEventListener("click", surClic);
  return b;
}

const px = (v) => `${Math.round(v * 100) / 100}px`;

/** ⚖️ LA BANDE SOUS LA COUTURE — les quatre cotes sont LUES, ⛔ aucune n'est
 *  écrite. 📏 `500` a déjà trois écrivains au dépôt (`sac-`, `wares-` et la
 *  table de X1) ; il n'en gagne pas un quatrième ici.
 *    · son haut  = la couture, le pied du second filet
 *    · son bas   = la dalle, moins la marge de pied de X1 (la déchirure mord)
 *    · ses côtés = la marge de côté de X1 */
export function feuilleDesCotesX2() {
  const haut = BAS_DE_TETE;
  const bas = D.DALLE.h - D.MARGE_PIED;
  return [
    /* ⭐ LA TÊTE, SOUS LE NOM DE X2 — la MÊME feuille que X1 monte, ⛔ pas une
       copie : une seule fonction l'écrit, pour les deux fiches. Le bas de lecture
       est la couture elle-même (voir l'en-tête : l'œil n'a rien à retirer ici). */
    /* 🔴 LOT 273 — LE BAS DE LECTURE N'EST PLUS LA COUTURE. Eric, 25/09 : « l'œil ne marche
       pas sur X2 ». Le lot 242 avait écrit que l'œil n'avait « rien à retirer ici » : le bas de
       lecture était la couture, et le mode lecture ne changeait RIEN. ⭐ Comme sur X1, il
       descend jusqu'au-dessus des portes — le bas du pied moins une cible (📏 mesuré : les
       trois boutons commencent à 422 = 466 − 44) ; les réglages s'effacent (la feuille). */
    feuilleDesCotesDeTete("x2", bas - D.TOUCH),
    `.x2 [data-organe="x2-pied"]{left:${px(D.MARGE_COTE)};top:${px(haut)};`
      + `width:${px(D.DALLE.l - 2 * D.MARGE_COTE)};height:${px(bas - haut)}}`
  ].join("\n");
}

/** ⚖️ `PURSE` — le mot est celui du CROQUIS d'Eric, qui fait foi (21/09). L'encart
 *  montre les quatre clefs en colonnes, les montants dessous.
 *  ⭐ ET LE MOT DE LA BOURSE PASSE AVANT LES CHIFFRES : sans classe, l'or de départ
 *  n'existe pas, et quatre tirets seraient une bourse tronquée qui se tait. Le
 *  pilote tend `motBourse` (un seul écrivain, `motDeLaBourse`). */
function encartBourse(bourse, motBourse) {
  const b = elx("aside", "x2-bourse");
  b.append(elx("h3", "x2-bourse-titre", "Purse"));
  if (motBourse) { b.append(elx("p", "x2-bourse-mot", motBourse)); return b; }
  const grille = elx("div", "x2-bourse-grille");
  for (const k of ["pp", "gp", "sp", "cp"]) {
    const col = elx("div", "x2-bourse-clef");
    col.append(elx("span", "x2-bourse-unite", k.toUpperCase()),
               elx("span", "x2-bourse-somme", String(bourse[k] ?? "—")));
    grille.append(col);
  }
  b.append(grille);
  return b;
}

/** ⚖️ LA FICHE D'UN OBJET DU CATALOGUE.
 *  @param {object} options
 *   · `liste`, `index` : les objets de la page d'où l'on vient. ⛔ LE FEUILLETAGE
 *     N'EST PAS DÉMONTÉ — Eric a retiré les FLÈCHES et le `1/X`, deux organes
 *     d'écran ; il n'a rien dit de la donnée, et `equipment-step.mjs` la publie
 *     toujours « pour la fiche ». `naviguer` reste donc branché.
 *   · `bourse`, `motBourse` : l'or du personnage
 *   · `onAction` : l'arbitre du pilote · `fermer` : le retour, inchangé */
export function construireLaFicheX2(options = {}) {
  const { liste = [], index = 0, bourse = {}, motBourse = null,
          onAction = () => {}, naviguer, fermer = () => {},
          /* ⭐ LOT 262 — LA PORTE DU CRAFT. L'écran ne sait pas ce qui se crafte : il
             DEMANDE (`peutCrafter`) et il PASSE LA MAIN (`ouvrirCraft`). ⛔ Aucune
             règle de jeu n'entre ici — c'est `craft.mjs` qui sait, par le pilote. */
          peutCrafter = () => false, ouvrirCraft = null } = options;
  let i = index;
  let qte = 1;
  const item = () => liste[i] || {};

  const noeud = elx("section", "x2");
  noeud.dataset.objet = "x2";
  noeud.dataset.ecran = "X2";
  noeud.setAttribute("role", "group");

  const feuille = elx("style");
  feuille.setAttribute("data-fhpc", "x2");
  feuille.textContent = feuilleDesCotesX2();
  noeud.append(feuille);

  /* ⭐ ICI, ET NULLE PART AILLEURS : le parchemin, le titre, la quantité, la ligne
     du haut, les deux filets, le texte, sa jauge et les deux ornements. ⛔ X2 ne
     fabrique aucun de ces organes — elle les reçoit. */
  const it0 = item();
  /* 🔴 LOT 273 — L'ŒIL DE X2 NE FAISAIT RIEN. Eric, 25/09 : « l'œil ne marche pas sur X2 ».
     La tête appelle `surLecture(!lecture)` au tap — et X2 ne lui donnait NI l'état NI le geste
     (X1 les reçoit de son pilote). ⭐ X2 porte donc son mode lecture elle-même : un objet
     d'options MUTABLE, parce que la tête relit `lecture` au moment du tap. En lecture, comme
     sur X1, le texte s'allonge jusqu'aux portes (la feuille de tête le sait déjà, par
     `.x2[data-lecture="oui"]`) et les réglages du pied s'effacent (la feuille). */
  const tete = { ...options, lecture: false, surLecture: (v) => basculerLecture(v) };
  construireLaTeteDeFiche(noeud, {
    nom: it0.nom, qte: 1, prose: it0.prose,
    prixUnite: it0.coutTexte, poidsUnite: it0.poidsTexte,
    /* ⚖️ LOT 279 — la rareté et la note de craft, portées par la fiche de l'objet */
    rarete: it0.rarete || "", noteCraft: it0.noteCraft || ""
  }, tete);

  /* ══ SOUS LA COUTURE — LE CROQUIS DU 21/09 ═══════════════════════════════ */
  const pied = elx("div", "x2-pied");
  pied.dataset.organe = "x2-pied";

  /* — PURSE · QTY ± · PRICE, sur une rangée (croquis) */
  const marche = elx("div", "x2-marche");
  const or = encartBourse(bourse, motBourse);

  const reglages = elx("div", "x2-reglages");
  const qteChamp = elx("input", "pipeline-typein pipeline-qte");
  qteChamp.type = "text"; qteChamp.inputMode = "numeric";
  qteChamp.setAttribute("aria-label", "Quantity");
  qteChamp.addEventListener("change", () => {
    const n = parseInt(qteChamp.value, 10);
    qte = Number.isInteger(n) && n > 0 ? n : 1;
    peindre();
  });
  /* ⚖️ LE `+` ET LE `−` SONT EMPILÉS, à droite du champ — le croquis les dessine
     l'un sur l'autre, ⛔ pas côte à côte. */
  const pas = elx("div", "x2-pas");
  pas.append(
    boutonX("+", "pipeline-pas pipeline-pas-plus", () => { qte += 1; peindre(); }, "One more"),
    boutonX("−", "pipeline-pas pipeline-pas-moins", () => { qte = Math.max(1, qte - 1); peindre(); }, "One less"));
  /* ⭐ LE PRIX EST UN TYPE IN (rose au croquis d'août, encadré ici) : le joueur
     peut marchander. ⛔ L'écran n'invente aucun tarif — le défaut vient du record. */
  const prixChamp = elx("input", "pipeline-typein");
  prixChamp.type = "text";
  prixChamp.setAttribute("aria-label", "Price");

  const champQte = elx("label", "x2-champ");
  champQte.append(elx("span", "pipeline-libelle", "Qty"), qteChamp);
  const champPrix = elx("label", "x2-champ");
  champPrix.append(elx("span", "pipeline-libelle", "Price"), prixChamp);
  reglages.append(champQte, pas, champPrix);
  marche.append(or, reglages);

  /* — SEND TO · le grand bouton-menu du croquis */
  const destRang = elx("div", "x2-sendto");
  destRang.append(elx("span", "pipeline-libelle", "Send to"));
  const dest = elx("select", "pipeline-dropdown x2-dropdown");
  dest.setAttribute("aria-label", "Send to");
  for (const d of DESTINATIONS) {
    const o = elx("option", null, d.mot);
    o.value = d.valeur;
    /* 🔴 `Craft` ÉTAIT GRISÉ EN DUR (`actif: false`), POUR TOUT OBJET — Eric, 24/09,
       devant `Weapon, +1, +2, or +3` en ligne : « impossible pour moi d'arriver au
       blueprint, tu vois bien que craft n'est pas sélectionnable ». ⭐ Il s'ouvre
       désormais quand CET objet est un plan que X5 sait composer. ⛔ Il reste grisé
       pour le reste — un objet fini ne se crafte pas, et un plan dont la famille n'a
       pas encore d'écran (un parchemin, un wondrous) le dit en restant fermé. */
    const actif = d.valeur === "craft" ? Boolean(ouvrirCraft) && peutCrafter(item().ref) : d.actif;
    if (!actif) o.disabled = true;
    dest.append(o);
  }
  destRang.append(dest);
  /* ⭐ CHOISIR `Craft`, C'EST OUVRIR X5 — le choix EST le geste. ⛔ Ni `BUY` ni `FREE`
     ne veulent rien dire pour un plan qu'on n'a pas encore composé : les faire passer
     par eux obligerait le joueur à « acheter » un objet qui n'existe pas. */
  dest.addEventListener("change", () => {
    if (dest.value === "craft" && ouvrirCraft) ouvrirCraft(item().ref);
  });

  const alerte = elx("p", "pipeline-alerte");

  const coutTotal = () => multiplieCout(parseCout(prixChamp.value) || item().cout, qte);

  /* ⛔ LA LOGIQUE D'ENVOI EST CELLE DE L'ÉCRAN D'AVANT, MOT POUR MOT : payer si on
     achète, refuser si la bourse ne couvre pas, poser la ligne, fermer. */
  function envoyer(payer) {
    const cout = coutTotal();
    if (payer) {
      if (!cout) { alerte.textContent = "No known price — use FREE, or type one."; return; }
      if (!bourseCouvre(bourse, cout)) { alerte.textContent = "Not enough coin in the purse."; return; }
      onAction({ kind: "payer", cout });
    }
    const destination = dest.value || "self";   /* item seul : la cascade */
    onAction({ kind: "addGearLine", ref: item().ref, quantity: qte,
      equipped: destination === "self", location: destination });
    fermer();
  }

  /* — LES TROIS BOUTONS DU PIED, idem le dessin d'Eric : CANCEL · BUY · FREE.
     ⚖️ `CRAFT` A QUITTÉ LE PIED : le croquis le range dans le menu `SEND TO`.
     ⚖️ ET `BACK` EST DEVENU `CANCEL`, ce que le croquis écrit — ⭐ le GESTE est
     inchangé (c'est le même `fermer`, le retour vers Wares est intact), seul le
     mot change. 📌 Et il tombe juste : `Back` est EXCLUSIF à la coquille
     (`shell-wiring.test.mjs` garde 17), et `Cancel` est le mot ratifié pour un
     pied qui abandonne sans rien défaire. */
  const portes = elx("div", "x2-portes");
  portes.append(
    boutonX("CANCEL", "pipeline-bouton", fermer, "Back to the catalogue"),
    porteDouble("BUY", "PAY / SEND / CLEAR", () => envoyer(true), "Pay, send, and return"),
    porteDouble("FREE", "SEND / CLEAR", () => envoyer(false), "Send without paying"));

  pied.append(marche, destRang, alerte, portes);

  function basculerLecture(v) {
    tete.lecture = Boolean(v);
    if (tete.lecture) noeud.dataset.lecture = "oui"; else delete noeud.dataset.lecture;
    /* ⛔ PAS `hidden` : `display: flex` de `.x2-marche` l'emporte (mesuré). La feuille les
       efface par `.x2[data-lecture="oui"]`. */
    const oeil = noeud.querySelector('[data-organe="oeil"]');
    if (oeil) {
      oeil.dataset.on = tete.lecture ? "oui" : "non";
      oeil.setAttribute("aria-label", tete.lecture ? "Show the whole sheet" : "More room for the text");
    }
  }
  noeud.append(pied);

  /* ⭐ LA TÊTE EST BÂTIE UNE FOIS, AVEC L'OBJET RÉEL — ⛔ X2 ne la fabrique pas, elle
     la reçoit déjà écrite. Ce qui suit n'est donc PAS une seconde fabrication : c'est
     le RAFRAÎCHISSEMENT du texte quand le feuilletage change de page (`naviguer`).
     ⚠️ Il lit les organes par leur clef, ce qui est une lecture — et un garde qui
     chercherait la CHAÎNE `data-organe="nom"` dans cette source ne saurait pas
     distinguer cette lecture-ci d'une écriture. C'est pour ça que le garde 3 mesure
     les GESTES de fabrication, ⛔ pas la présence d'un mot. */
  function peindre() {
    const it = item();
    const ecrire = (clef, mot) => {
      const e = noeud.querySelector(`[data-organe="${clef}"]`);
      if (e) e.textContent = mot;
    };
    ecrire("nom", it.nom || "");
    /* ⭐ LOT 279 — la ligne du prix (rareté comprise) et le texte (note de craft comprise) se
       repeignent par les écrivains de la tête. 🔴 `prix` et `poids` n'étaient pas des organes
       de la tête (elle écrit `unite`) : ces deux lignes ne repeignaient rien. */
    const objet = { prixUnite: it.coutTexte, poidsUnite: it.poidsTexte, rarete: it.rarete || "",
      prose: it.prose, noteCraft: it.noteCraft || "" };
    ecrire("unite", texteDeLUnite(objet));
    ecrire("rarete", objet.rarete);
    const desc = noeud.querySelector('[data-organe="description"]');
    if (desc) remplirLaDescription(desc, objet);
    noeud.setAttribute("aria-label", it.nom ? `${it.nom} — item sheet` : "Item sheet");
    prixChamp.value = it.coutTexte || "";
    qteChamp.value = String(qte);
    alerte.textContent = "";
  }
  peindre();
  if (naviguer) naviguer({ vers: (n) => { i = n; peindre(); } });

  return noeud;
}

/** ⚖️ UN BOUTON À DEUX ÉTAGES — le croquis écrit le verbe en gros et, dessous, en
 *  petit, ce que le geste ENCHAÎNE : *« PAY / SEND / CLEAR »*, *« SEND / CLEAR »*.
 *  ⭐ Le sous-titre est un voyant, ⛔ pas une seconde étiquette : le lecteur
 *  d'écran entend la phrase entière par `aria-label`, et rien deux fois. */
function porteDouble(mot, sous, surClic, note) {
  const b = boutonX("", "pipeline-bouton x2-bouton-double", surClic, note);
  b.append(elx("span", "x2-bouton-mot", mot));
  const s = elx("span", "x2-bouton-sous", sous);
  s.setAttribute("aria-hidden", "true");
  b.append(s);
  return b;
}
