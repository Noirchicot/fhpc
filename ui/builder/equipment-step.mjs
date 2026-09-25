/* ══ L'ÉTAPE EQUIPMENT — lot 49 ═══════════════════════════════════════
   Même loi que Class/Species/Compétences/Inheritance : le moteur prononce,
   l'écran affiche. ZÉRO règle de jeu ici — ce fichier ne calcule ni un
   total, ni un poids, ni une classe d'armure : `derive.mjs:404-445` sait
   déjà tout faire dès qu'une ligne `gear[N]` (ref + quantity + equipped) et
   les quatre clefs de `currency` sont posées (§0.2 de la commande, mesuré).

   ── ⛔ AUCUN PLAN `decisions[]` POUR `gear`/`currency` (mesuré, comme
   Abilities/Destiny) — `decisions.mjs` ne publie rien sous ces deux
   racines : ce fichier lit et pose directement dans
   `document.build.choices`, jamais un `planAt(decisions, "gear")` qui
   n'existerait pas.

   ── 🔴 LE CHOIX D'ARCHITECTE DU 13/08 EST LEVÉ — Eric, 21/09 : *« Il faut un
   popup avec un QCM »*, *« je te demande de l'améliorer »*. ⛔ CE QUI SUIT
   N'EST PLUS LA LOI DE L'ÉCRAN ; c'est l'argument qui l'a portée, et il reste
   vrai de la DONNÉE : le QCM ne retape aucune liste d'objets, il DÉRIVE tout
   de la phrase SRD, qui reste la seule écriture de la règle. ➡️ La loi
   d'aujourd'hui vit au corpus (`NORMES.md`, « un aiguilleur qui exige une
   réponse est un popup à QCM ») et son lecteur est plus bas, `optionsDeLaProse`.

   ── ⭐ LE CHOIX D'ARCHITECTE, RATIFIÉ (commande §1a, Eric 2026-08-13) —
   L'ÉCRAN AFFICHE LA PHRASE DE LA CLASSE TELLE QUELLE, IL NE LA STRUCTURE
   PAS. `data.starting_equipment` est UNE SEULE CHAÎNE DE PROSE sur les
   douze classes (« Choose A or B: … », le Fighter en a TROIS — « Choose A,
   B, or C » — §0.4 de la commande, mesuré) ; la structurer en boutons
   créerait une DEUXIÈME écriture de la même règle, à côté du texte SRD, et
   deux copies divergent sauf si quelque chose les compare. Le joueur COMPOSE
   son sac lui-même avec le chercheur plus bas, en lisant la phrase.

   ── LA BOURSE DE DÉPART (lot 182) — L'or de départ est une RÈGLE que le
   moteur ne dérive pas (`contracts/DERIVATION-FIELDS.md` §6 : la phrase de
   départ est « un CHOIX du joueur, pas une dérivation », sa lecture appartient
   à l'interface) : c'est CET ÉCRAN qui la pose, jamais automatiquement
   (`shell.mjs`, action `poserLeDepart` depuis le lot 245, `addStartingPurse`
   avant lui — un CLIC, pas un effet de rendu, pour ne jamais réécrire une
   bourse déjà dépensée).
   ⛔ ET PLUS AUCUN MONTANT N'EST ÉCRIT ICI. La consigne d'hier disait « le
   nombre est nommé UNE FOIS (`INHERITED_PURSE_GP`), jamais un `50` nu » —
   📏 mesuré le 09/09 : `50` apparaissait DIX fois dans ce fichier, dont deux
   dans la prose lue par le joueur. Une loi écrite et non tenue ne protège
   rien. Chaque montant se LIT maintenant dans la prose de sa source
   (`orDuDepart`, plus bas), et il n'y a plus de nombre à tenir.

   ── 🔴 LE PIÈGE DE LA BOURSE, RENDU VISIBLE, PAS CONTOURNÉ — `CURRENCY_KEYS`
   (importé de `src/build/index.mjs`, JAMAIS recopié : même liste que
   `derive.mjs`, zéro divergence possible) vaut quatre clefs, pas d'`ep`.
   Poser `currency.gp` seul ne produit AUCUNE bourse dérivée
   (`derive.mjs:442`) — cet écran ne le cache pas : les quatre champs sont
   TOUJOURS visibles, et `resolved.currency` ne s'affiche QUE quand le
   moteur l'a vraiment produit.

   ── ⚠️ DISCIPLINE DE FICHIER : `document` (le personnage brut, dans les
   `ctx`) SHADOWS le `document` DOM global à l'intérieur des fonctions qui le
   reçoivent — même geste qu'`abilities-step.mjs`/`inheritance-step.mjs`.
   AUCUNE fonction qui reçoit ce paramètre n'appelle `document.createElement`
   directement : tout passe par `el`/`text`/`button`/`numberField`/
   `searchField`, définis en tête de fichier, dont le PROPRE `document`
   référencé est toujours le DOM global (portée de module, jamais ombragée). */

/* ⭐ `markPressed` EST LE SEUL ÉCRIVAIN DE `data-active`/`aria-pressed` du dépôt
   (lot 57) : le QCM du départ l'appelle comme les six autres écrans, ⛔ il ne
   pose pas son propre attribut — c'est la divergence que le garde surveille. */
import { renderPicker, markPressed } from "./carnet.mjs?v=826";
import { facteurZoomCourant } from "./echelle.mjs?v=826";
import { CURRENCY_KEYS } from "../../src/build/index.mjs?v=826";
/* `isGenre` vient du CONTRAT, jamais d'une liste recopiée ici : le tambour
   demande à `query` un genre lu dans la donnée (`shelving.of_kind`), et
   `query` JETTE sur un genre inconnu. Vérifier avant de demander transforme
   un écran qui tombe en un record signalé. */
import { isGenre } from "../../src/layers/document.mjs?v=826";
import { swapContent } from "./socle.mjs?v=826";
import { LISTE_PAR_PAGE, pageDeListe } from "./normes.mjs?v=826";
/* ⭐ L'ÉCRAN WARES (lot 218) — dicté par Eric le 20/09. Il ne sait rien du document ; ce
   fichier-ci lui traduit le rangement en catégories, sous-catégories et pages. */
import { construireLesWares, poserLesRoues } from "./wares-ecran.mjs?v=826";
import { PAR_PAGE as WARES_PAR_PAGE } from "./wares-disposition.mjs?v=826";
/* ⭐ L'ORGANE DE GLISSER DU DÉPÔT, pas une seconde écriture du geste :
   la carte R arme ses jetons avec lui (tap → B1, glisser → la cible). */
import { armerJeton } from "./glisser.mjs?v=826";
/* 🧍 LOT 212 — L'ÉCRAN R (Gear), le major hub du chapitre : le pantin et ses
   emplacements, le collecteur, la rangée du pied. Il REMPLACE le dressing en
   trois bandes (`b3-dressing.mjs`) comme écran d'entrée ; l'ancienne scène
   SVG ne vit plus que dans le banc `ecran-b3.html`. Une seule écriture de
   la disposition : la table générée `gear-disposition.mjs`. */
import { construireLEcranGear, DESTINATIONS } from "./gear-ecran.mjs?v=826";
/* ⭐ LA TAILLE DE LA GRILLE VIENT DE L'ÉCRAN, QUI LA COMPTE DANS SON PLAN — ⛔ un
   12 écrit ici serait un nombre retapé, et il mentirait le jour où le plan rend sa
   cinquième rangée. C'est aussi la taille d'une PAGE du sac. */
import { construireLeSac, poserLesDalles, CASES_DU_SAC, COLS_GRILLE, CHAMPS_DE_SECTION } from "./sac-ecran.mjs?v=826";
/* 🗂️ LOT 213 — X1, LA FICHE D'UN OBJET POSSÉDÉ : le tap (ou le clic droit) sur
   un jeton de l'écran R l'ouvre. Elle recouvre la dalle et ⛔ n'écrit JAMAIS la
   3ᵉ ligne du belt — *« les x ne s'inscrivent pas dans le belt »* (Eric, 16/09) :
   c'est son absence de `FENETRE_DE` qui le garantit, et rien d'autre. */
import { construireLaFicheX1 } from "./x1-ecran.mjs?v=826";
/* ⭐ LOT 248 — X0 PORTE LE PARCHEMIN DE X1 ET X2, PAR LE MÊME HABILLEUR.
   ⛔ Redessiner la texture ici aurait fait un SECOND ÉCRIVAIN pour un organe
   unique : deux feuilles qui divergent d'une teinte, personne ne le voit
   avant qu'Eric le voie. Eric, 23/09 : *« utilise la texture parcheminée de
   la fiche X »*, et *« on peut l'appeler X0 à la rigueur »*. */
/* ⛔ LES COTES DE X0 NE VIVENT PAS DANS `shell.css` — c'est la loi que le garde
   §7 de `x1-ecran.test.mjs` tient depuis X1 : *« shell.css ne porte AUCUNE
   position de la fiche : les cotes sont dans la table »*. La feuille lit
   `var(--x0-…)`, et ces jetons sont posés ici, à la source. */
import { feuilleDesCotesX0 } from "./x0-disposition.mjs?v=826";
/* 🔗 LE PIPELINE (24/08) — B1 · B2 · SB3.1/2/3, le panier partagé et la
   monnaie. La carte R publie les gestes, le pipeline fait les écrans. */
import { parseCout, parsePoids, multiplieCout, additionneCouts, formatCout, currentCartLines, cartCompte,
  enGP, lignesParLieu, poidsParLieu, motDeLEncombrement, motDUnPoids, fabriqueDeValeur,
  estRecette, renderB2, renderSacs, renderRecherche, bourseCouvre } from "./equipement-pipeline.mjs?v=826";
/* ⚖️ LOT 242 — LA FICHE DU CATALOGUE A REPRIS SON NOM DE LOI : `X2`, et elle a
   quitté le pipeline pour son propre module, comme X1. 🔴 Elle s'appelait `b1` —
   *le même mot que le rang B1, qui est le sac*. Eric, 21/09 : *« oui b1 = X2 »*.
   ⛔ ET L'ORDRE DES IMPORTS N'EST PAS UN DÉTAIL : `x2-ecran` importe `x1-ecran` (la
   tête partagée), qui importe `gear-ecran`, qui importe le pipeline. X2 est donc en
   BOUT de chaîne — c'est pour ça qu'elle ne pouvait pas rester dans le pipeline,
   qui aurait fermé le cycle. */
import { construireLaFicheX2 } from "./x2-ecran.mjs?v=826";
import { construireX5 } from "./x5-ecran.mjs?v=826";
import { texteDeLaNote } from "./bareme-srfh.mjs?v=826";
import { seCrafteDansX5, ouvertureX5, coteDUnObjetCrafte, recordDUneVariante } from "./craft.mjs?v=826";
import { nomCrafte, estCrafte, lireLeBonus, variantesDe, nomDUneVariante } from "../../src/build/objet-crafte.mjs?v=826";
import { SLOT_VERS_BOITES, POCHES_DEBORD } from "./b3-disposition.mjs?v=826";
/* LOT 191 — le repli d'une ligne dont le record manque passe par l'organe
   unique : le lot 181 avait réparé le CHERCHEUR (la gemme se résout), mais le
   repli `|| l.ref.id` restait, et il ressortirait au premier genre inconnu. */
import { motDUnRecordAbsent } from "./mot-du-choix.mjs?v=826";
/* 🌱 LOT 198 — EQUIPMENT VIT SANS CLASSE, ET LA BOURSE NOMME. ⚖️ Eric, 10/09 :
   *« Ce que tu crées dans Sheet est un précurseur de la fiche, non ? Pourquoi
   ne pas dériver tous ces éléments dans le bilan de Sheet ? »* — les chapitres
   travaillent sur les choix, un seul déduit : Sheet. L'or de départ se lit
   dans le record de classe (`orDuDepart`) ; sans classe, en pile Fate's Hand,
   l'aiguilleur offrait les 50 PO de l'Inheritance seuls, et une bourse prise
   là n'aurait jamais reçu l'or de la classe choisie ensuite — une BOURSE
   TRONQUÉE (mesuré le 10/09). Le premier passage de ce lot tuait l'écran ;
   ni tuer ni tronquer : la boutique se montre, et la bourse (« My gold ») dit
   d'aller choisir une classe. Complète, ou nommée, jamais tronquée. Le nom du
   cran se lit sur la ceinture, par l'organe qui nomme déjà les crans. */
import { motDuCran } from "./ecran-mort.mjs?v=826";


/* §0.3 de la commande, mesuré : 82 `gear` + 38 `weapon` + 13 `armor` = 133
   records. Bookkeeping d'ÉCRAN (quels genres ce chercheur interroge) — pas
   une règle de jeu : `derive.mjs` accepte n'importe quel `ref` valide sous
   `gear[n]`, cette liste ne fait que dire à QUI `query({kind})` est posée.

   ── ⭐ LOT 84 — `item` ENTRE, ET C'EST UNE DÉCISION D'ERIC (2026-08-23,
   « oui ça rentre à l'équipement »). Le catalogue passe donc de 133 à 391
   records (mesuré : 82 + 38 + 13 + 258). La commande du lot l'INTERDISAIT
   tant que personne n'avait tranché ; il est tranché.

   ── 🔴 CE QUE `item` APPORTE ET CE QU'IL N'A PAS, mesuré sur
   `layers/srd-5.2.1-en.layer.json` : les 258 objets magiques portent
   `category` (non vide 258/258) — c'est le SEUL vrai second niveau du
   catalogue — mais **0 sur 258 portent un `cost`, 0 sur 258 portent un
   `weight`**. Un autre chantier les remplira. Cet écran doit donc afficher
   un objet SANS PRIX ET SANS POIDS sans rien casser et sans inventer de
   valeur : `recordCost`/`recordWeight` rendent `null`, et la ligne de méta
   affiche « — ». L'absence est MONTRÉE, jamais comblée.
   ⭐ LOT 260 (2026-09-24) — L'AUTRE CHANTIER, C'EST CELUI-LÀ. Eric : *« les
   autres objets magiques […] sont censés avoir une valeur, même si on n'arrive
   pas toujours à calculer le poids »*. La valeur vient désormais de
   `fabriqueDeValeur` (pipeline) : la rareté lue dans `srd:item-value`, plus la
   base quand elle est UNIQUE — la règle du SRD à la lettre. ⛔ Ce n'est donc
   toujours pas une valeur inventée ; c'est une valeur que le SRD calcule et que
   personne ne lisait. Le poids, lui, reste absent quand la base est ambiguë.
   `recordCost`/`recordWeight` sont RETIRÉS : leur seul emploi était cette phrase. */
/* ⛔ `EQUIPMENT_RECORD_KINDS` A ÉTÉ RETIRÉ ICI (lot 95), et ce n'est pas un
   nettoyage : c'est la liste qui MANQUAIT les 25 outils. Elle nommait quatre
   genres, le rangement d'Eric en range cinq — les outils sont sur
   `crafting › tools` depuis le lot 90 et n'apparaissaient nulle part.
   ⭐ La leçon est celle d'`item-value` : une liste de genres écrite à la main
   ne dit jamais qu'elle est incomplète. Le tambour lit maintenant les 470
   records de rangement, qui portent chacun LEUR genre — plus de liste.

   🔴 « PLUS DE LISTE » ÉTAIT FAUX PENDANT QUINZE JOURS, ET C'EST CE
   COMMENTAIRE-CI QUI L'A FAIT CROIRE. Le lot 95 a retiré la liste du TAMBOUR
   et l'a laissée intacte dans `fabriquerChercheur` — les cinq mêmes genres en
   dur, mille lignes plus bas, pour la recherche, les noms des lignes achetées
   et les boîtes du dressing. 📏 Mesuré le 2026-09-08 en posant les 54 gemmes
   du lot 181 : une azurite achetée s'affichait `fh:gem:en:azurite`, son id nu,
   et la recherche ne la trouvait pas. Elle est corrigée là-bas, par
   `genresDuRangement` — et le mot de ce commentaire redevient vrai. */

/* ══ 🔴 L'OR DE DÉPART — DEUX SOURCES, UNE RÈGLE, ZÉRO NOMBRE ÉCRIT ICI ══
   ⚖️ Eric, 2026-09-09 : *« le kit ou les 50 gp peut marcher pour SRD et FH »*,
   *« fait idem SRD pour FH »*, *« harmonise ça »*. ⇒ **CHAQUE SOURCE DE DÉPART
   OFFRE SON PAQUET OU SON OR**, et c'est la même règle dans les deux piles.
   ⭐ C22 (« les 50 PO REMPLACENT le kit », Eric le 08/09) n'est pas défaite :
   elle est ÉLARGIE. Prendre la bourse, c'est mettre les paquets de côté — de
   TOUTES ses sources — et prendre l'or que chacune propose à leur place.

   📏 CE QUE LA DONNÉE PORTE, MESURÉ LE 2026-09-09 sur `layers/` :
   · `class.data.starting_equipment` — « Choose A or B: (A) …, and 15 GP; or
     (B) 75 GP » : le paquet porte SON or, et l'option B en porte un AUTRE, un
     par classe (75 · 90 · 110 · 50 · 155 · 50 · 150 · 150 · 100 · 50 · 100 ·
     55). Le Fighter en a trois (« Choose A, B, or C »).
   · `background.data.equipment` — la MÊME forme, et 50 GP pour les quatre
     arrière-plans du SRD ; l'Inheritance qui les remplace le porte depuis le
     lot 182 (`src/tools/fh-skills-source.mjs`, jamais le JSON produit).

   ⚠️ ET LE PIÈGE DE MESURE DE CE LOT, NOMMÉ AVANT D'AVOIR MENTI : **trois
   classes valent VRAIMENT 50** (Druid, Monk, Sorcerer). Un relevé qui rend 50
   n'est donc PAS la preuve qu'un `50` en dur est resté — et un relevé qui rend
   50 partout n'est pas la preuve du contraire non plus. C'est le Fighter (155)
   et le Wizard (55) qui accusent, pas le Druide.

   ⛔ CE QUI EST RETIRÉ : `export const INHERITED_PURSE_GP = 50`. Le nombre
   était JUSTE — c'est l'option B des quatre arrière-plans SRD éteints — et il
   était au mauvais endroit. Un écran ne porte pas une valeur de règle : celle-ci
   figeait la pile FH sur 50 et rendait FAUX le fil SRD, où un Fighter dont la
   donnée dit 155 lisait 50 et recevait 50.

   ⛔ LA LECTURE VIT DANS L'INTERFACE, JAMAIS DANS LE MOTEUR —
   `contracts/DERIVATION-FIELDS.md` §6 : *« C'est un CHOIX du joueur, pas une
   dérivation […] structurer les phrases pour les PRÉSENTER est un besoin de
   l'interface (M3) »*. Le refus tient toujours, il est respecté ici.
   ⛔ ET UN SEUL LECTEUR DE MONNAIE : `parseCout`, déjà écrit dans le pipeline
   et ANCRÉ des deux bouts. C'est son ancrage qui refuse « 1 Sorcery Point » et
   qui fait qu'une phrase mal découpée rend `null` au lieu d'un faux montant. */

/** Le champ de prose où chaque genre de source porte son départ. Deux genres,
 *  deux noms de champ — le SRD ne les a pas nommés pareil, et les renommer
 *  serait réécrire du SRD à la main (interdit, §L). */
const CHAMP_DE_DEPART = { class: "starting_equipment", background: "equipment" };

/** Comment nommer une source qui n'a pas encore de record (aucune classe
 *  choisie) — l'écran doit pouvoir dire CE QUI manque, pas se taire. */
const MOT_DE_LA_SOURCE = { class: "Your class", background: "Your origin" };

/** L'or de la DERNIÈRE option d'une phrase de départ, ou `null`.
 *  ⚠️ LA DERNIÈRE, ET C'EST TOUT LE PIÈGE : la phrase du Barbare porte DEUX
 *  montants (« … and 15 GP; or (B) 75 GP ») — prendre le premier facturerait
 *  l'or que le paquet contient DÉJÀ, et le nombre rendu serait plausible.
 *  ⭐ Une phrase à une seule option est sa propre dernière option : c'est ce
 *  qui permet à l'Inheritance (« 50 GP », pas de paquet à poser) et aux douze
 *  classes d'être lues par LE MÊME lecteur.
 *  ⛔ Le découpage échoue en rendant `null`, jamais un nombre : `parseCout`
 *  est ancré, donc une phrase entière n'y parse pas. */
/*  ⭐ LOT 245 — CE LECTEUR NE DÉCOUPE PLUS LUI-MÊME. Le QCM avait besoin du
 *  MÊME découpage, et deux découpes de la même phrase divergent : celle-ci
 *  s'appuie donc sur `optionsDeLaProse`, qui est désormais le seul organe qui
 *  sache lire une phrase de départ. ⛔ Ce n'est pas un remplacement — ce que
 *  cette fonction rend n'a pas bougé d'un centime, et les gardes du lot 182 le
 *  tiennent (Barbare 75 et non 15, Fighter 155, « 1 Sorcery Point » → null).
 *  ⭐ Et elle GAGNE le garde du découpage au passage : une phrase dont les
 *  lettres annoncées ne correspondent pas rend maintenant `null` au lieu d'un
 *  montant pris sur un morceau mal coupé. */
export function orDeLaProse(prose) {
  const options = optionsDeLaProse(prose);
  if (!options.length) return null;
  return parseCout(options[options.length - 1].texte);
}

/** L'or d'UNE source, lu dans SON record : `{nom, prose, cout, underived}`.
 *  ⭐ UN MONTANT QU'ON NE SAIT PAS LIRE EST UN FAIT DÉCLARÉ, jamais un 0
 *  consolant ni un 50 de secours — même doctrine que les `underived.*` de
 *  `derive.mjs` (« un zéro consolant se joue sans que personne le sache »).
 *  L'écran AFFICHE ce manque, il ne le comble pas. */
export function orDeLaSource(view, genre) {
  const champ = CHAMP_DE_DEPART[genre];
  const record = view && view.record;
  const data = record && record.data;
  const nom = record && typeof record.name === "string" ? record.name : null;
  const prose = champ && data && typeof data[champ] === "string" ? data[champ] : null;
  if (!prose) return { nom, prose: null, cout: null, underived: "starting-gold.no-phrase" };
  const cout = orDeLaProse(prose);
  if (!cout) return { nom, prose, cout: null, underived: "starting-gold.phrase-unreadable" };
  return { nom, prose, cout, underived: null };
}

/** L'origine du personnage — l'Inheritance en pile FH, l'arrière-plan choisi
 *  en pile SRD.
 *  ⚠️ LIRE SEULEMENT `build.choices` RENDRAIT `null` SUR TOUTE LA PILE FH :
 *  `inheritance-step.mjs` n'émet AUCUN `choose({path:"background"})` quand le
 *  genre n'a qu'une option (le repli à une option, contrat §1a). Une absence
 *  n'est jamais une réponse : on demande alors au genre ce qu'il contient.
 *  ⛔ Et deux options sans choix posé rendent `null` — on ne devine pas
 *  laquelle le joueur aurait prise. */
export function origineDuDepart(query, document) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const entry = choices.find((c) => c.path === "background");
  if (entry && entry.ref) return query({ kind: "background", id: entry.ref.id }) || null;
  const tous = query({ kind: "background" }) || [];
  return tous.length === 1 ? tous[0] : null;
}

/** L'or de départ du personnage : ce que CHAQUE source offre, et le total.
 *  Rend `{sources: [{genre, nom, prose, cout, underived}], cout}` — `cout`
 *  vaut `null` tant qu'aucune source n'a pu être lue (⛔ pas `{gp: 0}` : zéro
 *  pièce et « je ne sais pas » ne se jouent pas pareil).
 *  ⭐ UN SEUL ÉCRIVAIN POUR CE MONTANT : la prose de l'aiguilleur ET le geste
 *  qui pose la bourse (`shell.mjs`) appellent CETTE fonction. Deux calculs du
 *  même nombre divergent au premier jour où l'un des deux est corrigé. */
export function orDuDepart({ query, document } = {}) {
  const q = typeof query === "function" ? query : () => null;
  const refClasse = currentClassRef(document);
  const vueClasse = refClasse ? q({ kind: "class", id: refClasse.id }) : null;
  const sources = [
    { genre: "class", ...orDeLaSource(vueClasse, "class") },
    { genre: "background", ...orDeLaSource(origineDuDepart(q, document), "background") }
  ];
  /* 🌱 LOT 198 — SANS CLASSE, AUCUN TOTAL : une bourse de départ sans l'or de
     la classe est une bourse tronquée, et « tronquée » n'est ni « complète »
     ni « nommée » — c'est un montant que le joueur croirait entier. `cout`
     reste `null` (⛔ pas `{gp: 0}`, pas l'Inheritance seule), et `sansClasse`
     dit pourquoi, pour que l'écran nomme la sortie au lieu d'un manque de
     donnée. Une classe choisie dont le record ne se lit pas garde son sort
     d'avant (lot 182 : nommé, jamais comblé). */
  if (!refClasse) return { sources, cout: null, sansClasse: true };
  const lisibles = sources.filter((s) => s.cout);
  return { sources, cout: lisibles.length ? additionneCouts(lisibles.map((s) => s.cout)) : null, sansClasse: false };
}

/** LE MOT DE LA BOURSE QUAND IL N'Y A PAS DE CLASSE — `null` sinon. Un seul
 *  écrivain pour B1, B2 et l'aiguilleur ; le nom du cran vient de la ceinture.
 *  ⚠️ Brouillon (le mien, sur le mot de l'archi du 10/09) — à Eric. */
export function motDeLaBourse(document) {
  return currentClassRef(document) ? null : `Choose a class on ${motDuCran("class")} to get your starting gold.`;
}

/* ══ 🔴 LE QCM DU DÉPART — lot 245, 2026-09-21 ════════════════════════════
   ⚖️ Eric, 21/09 : *« Il faut un popup avec un QCM. Propre et bien présenté »*,
   *« je te demande de l'améliorer »*, *« idem en plus simple pour Fate's Hand »*.

   ⭐ CE QUE ÇA ANNULE, ET C'EST EN CONNAISSANCE DE CAUSE. L'en-tête de ce
   fichier porte le choix d'architecte du 13/08 — *« l'écran AFFICHE la phrase
   de la classe telle quelle, il ne la STRUCTURE pas »*, parce que la
   structurer *« créerait une DEUXIÈME ÉCRITURE de la même règle »*. Eric
   revient dessus : le QCM se fait. ⛔ MAIS LE MOTIF RESTE VRAI, et c'est lui
   qui dicte la méthode : **aucune liste d'objets n'est retapée ici**. La
   phrase SRD reste la SEULE écriture de la règle ; ce qui suit n'en est qu'un
   DÉCOUPAGE. Un errata de la couche change l'écran sans qu'on touche au code.

   🔴 ET LE VRAI DÉFAUT QUE CE LOT RÉPARE N'EST PAS L'HABIT. Eric : *« que
   l'équipement donné par la classe se mette POUR DE VRAI dans Gear »*, *« ce
   choix n'est pas implémenté »*. 📏 MESURÉ le 21/09 dans `shell.mjs` :
   `choisirDepart` avait DEUX branches et une seule agissait —
     · `purse` enchaînait `addStartingPurse` : l'or tombait vraiment ;
     · `kit`  écrivait `depart: "kit"` **et rien d'autre**. Aucun `addGearLine`.
   ⛔ Pendant ce temps le popup disait *« your class kit is yours, ALREADY
   LISTED »*. Il ne l'était pas. **Ce n'était donc pas un popup laid, c'était
   un popup qui mentait** — l'écran décrivait un monde que le code ne
   fabriquait pas. C'est ça, « pas clair ».

   ⭐ ET `depart` CESSE D'ÊTRE UN ORPHELIN. `derive.mjs` le nomme en toutes
   lettres : *« un ORPHELIN — `depart` (kit ou bourse), un choix qui DEVAIT
   avoir un effet et n'en avait pas »*. Il en a un maintenant : les lignes
   `gear[N]` et la bourse. Le champ lui-même reste un SOUVENIR (l'écran s'y
   restaure), et c'est la doctrine du contrat, pas un contournement —
   `contracts/DERIVATION-FIELDS.md` §6 : *« C'est un CHOIX du joueur, pas une
   dérivation »*.

   ⚖️ CE QUI CHANGE DE RÈGLE, ET JE LE DIS AU LIEU DE LE GLISSER : le geste
   d'hier était GLOBAL (`valeur: "kit" | "purse"`, toutes sources à la fois).
   La maquette d'Eric pose **une question PAR SOURCE**, donc le panachage —
   le paquet de la classe AVEC l'or de l'origine — devient possible. C22
   (*« les 50 PO REMPLACENT le kit »*) est élargie à chaque source prise
   séparément : **chaque source offre son paquet ou son or**, et c'est
   maintenant vrai source par source.

   ⭐ ET LA QUESTION LAISSÉE À ERIC PAR LE LOT DU 26/08 EST FERMÉE. Elle était
   écrite dans un commentaire : *« §7 range l'aiguilleur parmi les POPUPS, et
   §2 dit qu'un popup parle, on ne l'appuie pas. Celui-ci porte DEUX boutons.
   À Eric de dire si ce sont deux organes ou un seul. »* ➡️ La maquette du
   21/09 tranche : **c'est un popup qui EXIGE une réponse**, il porte un QCM
   et un `Done`. Elle est portée à `NORMES.md` — ⛔ une règle qui ne vit que
   dans un commentaire n'existe pas, et une question résolue sans trace se
   repose dans quinze jours.

   ⛔ UN DÉCOUPAGE QUI NE COMPREND PAS REFUSE, IL NE DEVINE PAS. Trois refus
   sont câblés, et chacun est visible au joueur :
     · l'en-tête annonce des lettres qui ne correspondent pas aux options
       trouvées → **la phrase entière est refusée** (zéro option) ;
     · un morceau dont le nom ne rencontre AUCUN record → il est NOMMÉ, il
       n'entre pas dans le sac, et le reste de l'option passe quand même ;
     · une source sans phrase lisible → nommée, aucune ligne, aucun or.
   ⭐ C'est la loi déjà tenue par `orDeLaSource` (*« ce qui ne se lit pas se
   dit »*), étendue des montants aux objets. 📏 Et ce n'est pas théorique :
   mesuré sur les seize phrases des couches, **six morceaux refusent** —
   `20 Arrows` (×4, aucun record « Arrow » n'existe : la couche n'a que
   `Ammunition`), `Spellbook`, `Gaming Set (same as above)`,
   `Musical Instrument of your choice`, et le choix imbriqué du Moine
   (*« Artisan's Tools OR Musical Instrument »*). ⛔ Les rapprocher à la main
   serait exactement le second écrivain que ce lot refuse : `Arrows → Ammunition`
   est une règle de jeu, elle appartient à la couche, pas à un écran. */

/** La clef de comparaison d'un nom d'objet — casse, espaces et apostrophes
 *  typographiques ramenés à une seule forme. ⛔ RIEN D'AUTRE : ni synonyme,
 *  ni traduction, ni pluriel « intelligent ». Un nom qui ne rencontre pas un
 *  record REFUSE, il ne s'approche pas du plus ressemblant. */
function clefDeNom(nom) {
  return String(nom).toLowerCase()
    .replace(/[‘’ʼ´]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** L'en-tête « Choose A or B: » / « Choose A, B, or C: ». Sa capture sert DEUX
 *  fois : à retirer l'en-tête, et à VÉRIFIER que les lettres annoncées sont
 *  celles qu'on a trouvées. */
const ENTETE_DU_CHOIX = /^\s*Choose\s+([A-Z](?:\s*,\s*[A-Z])*(?:\s*,)?\s+or\s+[A-Z])\s*:\s*/i;

/** LES OPTIONS D'UNE PHRASE DE DÉPART — `[{lettre, texte}]`, ou `[]` si la
 *  phrase ne se laisse pas découper.
 *  ⭐ N OPTIONS, JAMAIS DEUX : le Fighter en a TROIS (« Choose A, B, or C »),
 *  et l'Inheritance de Fate's Hand en a UNE (`"50 GP"`, une chaîne nue, sans
 *  « Choose »). Un rendu qui suppose deux options ment sur les deux bords.
 *  ⛔ LE GARDE DU DÉCOUPAGE : les lettres ANNONCÉES par l'en-tête doivent être,
 *  dans l'ordre, celles des options trouvées. Une phrase qui promet trois
 *  options et n'en rend que deux est une phrase qu'on n'a pas comprise — on
 *  rend `[]`, et l'écran le dit. ⭐ Sans ce garde, un point-virgule perdu
 *  ferait disparaître une option en silence, et le joueur recevrait un kit
 *  amputé sans jamais l'apprendre. */
export function optionsDeLaProse(prose) {
  if (typeof prose !== "string" || !prose.trim()) return [];
  const entete = ENTETE_DU_CHOIX.exec(prose);
  const corps = entete ? prose.slice(entete[0].length) : prose;
  const trouvees = corps.split(/;\s*(?:or\s+)?/i)
    .map((brut) => {
      const m = /^\s*\(\s*([A-Za-z])\s*\)\s*/.exec(brut);
      return { lettre: m ? m[1].toUpperCase() : null, texte: (m ? brut.slice(m[0].length) : brut).trim() };
    })
    .filter((o) => o.texte);
  if (!entete) {
    /* PAS D'EN-TÊTE : une phrase nue est sa propre option unique — c'est ce
       qui permet à `"50 GP"` d'être lu par LE MÊME lecteur que les douze
       classes. ⛔ Mais une phrase nue qui se découpe en PLUSIEURS morceaux
       annonce un choix sans le nommer : on ne devine pas, on refuse. */
    return trouvees.length === 1 ? trouvees : [];
  }
  /* ⚠️ LE « or » SE RETIRE AVANT DE COMPTER LES LETTRES, et ce n'est pas une
     coquetterie : 📏 mesuré le 21/09, une découpe naïve sur « A, B, or C »
     rendait `["A", "B", "or C"]` — deux lettres au lieu de trois — et le garde
     REFUSAIT la phrase du Fighter, la seule classe à trois options. ⭐ Le
     garde avait raison de rougir ; c'était sa mesure qui était fausse. */
  const annoncees = (entete[1].replace(/\bor\b/gi, " ").match(/[A-Za-z]/g) || [])
    .map((lettre) => lettre.toUpperCase());
  if (annoncees.length !== trouvees.length) return [];
  if (annoncees.some((lettre, i) => lettre !== trouvees[i].lettre)) return [];
  return trouvees;
}

/** LES MORCEAUX D'UNE OPTION — « Greataxe », « 4 Handaxes », « 15 GP »…
 *  ⭐ LA CONJONCTION EST UNE VIRGULE QUI SE CACHE : le SRD écrit « …, and
 *  15 GP » et « Chain Mail and a Greatsword ». Une seule normalisation, puis
 *  une seule découpe — ⛔ deux découpes divergeraient. */
export function morceauxDeLOption(texte) {
  if (typeof texte !== "string") return [];
  return texte.replace(/\s*,?\s+and\s+/gi, ", ")
    .split(/\s*,\s*/).map((s) => s.trim()).filter(Boolean);
}

/** LE NOM → LE RECORD, ou `null`. L'index est bâti sur `cherche.tous()` —
 *  c'est-à-dire sur les genres que LE RANGEMENT D'ERIC contient
 *  (`genresDuRangement`), ⛔ jamais une liste de genres écrite ici : c'est la
 *  faute que le lot 95 a payée deux fois.
 *  ⚠️ LE SRD INVERSE CERTAINS NOMS — la couche porte « Clothes, Traveler's »
 *  là où la phrase de l'arrière-plan écrit « Traveler's Clothes ». L'index
 *  pose donc aussi la forme retournée. ⭐ Ce n'est pas un synonyme inventé :
 *  c'est le MÊME nom, lu dans l'autre sens, et onze records de la couche
 *  portent cette virgule. */
function indexDesNoms(cherche) {
  const parNom = new Map();
  const pose = (clef, entree) => { if (clef && !parNom.has(clef)) parNom.set(clef, entree); };
  for (const item of cherche.tous()) {
    const nom = recordLabel(item.view);
    if (!nom) continue;
    const entree = { ref: { kind: item.kind, id: item.view.id }, nom };
    pose(clefDeNom(nom), entree);
    const inverse = /^([^,]+),\s*(.+)$/.exec(nom);
    if (inverse) pose(clefDeNom(`${inverse[2]} ${inverse[1]}`), entree);
    /* ⚖️ LOT 246 — LES AUTRES NOMS QUE LA COUCHE DÉCLARE, lus génériquement.
       ⭐ Eric, 21/09 : *« flèches = munitions (gratuit) = tu mets la quantité
       requise »*. La phrase du livre dit « 20 Arrows » ; la couche n'a que
       « Ammunition ». Le rapprochement se fait donc par une DÉCLARATION —
       `data[also_named]`, posée par `srfh-mecaniques-en` sur
       `srd:gear:en:ammunition` — et ⛔ jamais par un `if` sur le mot. C'est
       nommément ce que le lot 245 avait refusé d'écrire ici : « Arrows →
       Ammunition » est une règle de jeu, elle appartient à la couche.
       ⛔ ET CE N'EST PAS UN SYNONYME « INTELLIGENT » : rien n'est deviné, rien
       n'est approché. Un nom non déclaré refuse, comme avant. La seule chose
       qui a changé, c'est qu'une couche peut maintenant DIRE qu'un objet porte
       un second nom dans les phrases de départ.
       ⚠️ ET LE PIÈGE DU MOT DOUBLE : `srd:weapon-property:en:ammunition` porte
       le MÊME nom d'affichage que `srd:gear:en:ammunition`. Il n'entre pas
       dans cet index (📏 `weapon-property` n'est pas un genre du rangement),
       mais c'est une protection d'AUJOURD'HUI, pas une loi — `tests/
       equipment-step.test.mjs` tient les deux records par leur id. */
    const autres = item.view.record && item.view.record.data && item.view.record.data.also_named;
    if (Array.isArray(autres)) {
      for (const autre of autres) if (typeof autre === "string") pose(clefDeNom(autre), entree);
    }
  }
  return parNom;
}

/** LA FAMILLE D'UN OUTIL — `data.inherits` s'il en a un, sinon son propre id.
 *  ⭐ UNE RÈGLE, PAS UNE LISTE. `instrument-wind` et `instrument-other`
 *  héritent de `srd:tool:en:musical-instrument` (la source le déclare depuis le
 *  09/09 ; le générateur le porte à la couche depuis le lot 246), et
 *  `instrument-strings` EST ce record, réécrit. La racine est donc la même dans
 *  les deux piles, et ⛔ aucune énumération des instruments n'existe nulle part :
 *  une liste par nom serait incomplète au premier instrument ajouté. */
function familleDeLOutil(vue) {
  const data = (vue && vue.record && vue.record.data) || {};
  return typeof data.inherits === "string" ? data.inherits : (vue && vue.id) || null;
}

/* Un MÉTIER suivi de son possessif, puis d'autre chose. ⛔ Rien d'autre ne se
   dérive : pas de pluriel, pas de synonyme, pas de suffixe nommé. */
const METIER_POSSESSIF = /^(\p{L}[\p{L}-]*)['’]s?\s+\S/u;

/** LE NOM COURT D'UN OUTIL — le métier, nu, minuscule ; ou le nom, entier.
 *
 *  ⚖️ ERIC, 2026-09-21 : *« Tu retires le mot tool sur chaque item. Tu fais
 *  Tool : smith, glassblower etc. — tu gagnes de l'espace. »* Le libellé de
 *  famille porte le mot une fois, en tête de la question ; les items sont les
 *  métiers nus.
 *
 *  🔴 C'EST UNE DÉRIVATION D'AFFICHAGE, PAS UN RENOMMAGE, et la distinction
 *  est la loi §L du dépôt : ⛔ aucun `name` de record ne bouge. Renommer
 *  `Smith's Tools` en `smith` DANS la donnée serait réécrire du SRD à la main
 *  — ce que le lot 246 a refusé de faire pour « Arrows → Ammunition », et pour
 *  la même raison. Le record garde son nom ; l'écran en dérive un mot.
 *
 *  ⚠️ LE SUFFIXE N'EST PAS TOUJOURS « Tools », ET C'EST POUR ÇA QU'AUCUN N'EST
 *  NOMMÉ ICI. Les dix-sept outils d'artisan en portent TROIS — `Tools`,
 *  `Supplies` (Alchemist, Brewer, Calligrapher, Painter) et `Utensils` (Cook).
 *  ⛔ Un découpage qui chercherait « Tools » laisserait « Alchemist's
 *  Supplies » intact, et personne ne le verrait : le mot resterait juste un
 *  peu long. La règle ne regarde donc pas la FIN du nom, elle regarde le
 *  POSSESSIF — un seul mot, suivi de `'s` ou `s'`, suivi d'autre chose.
 *
 *  ⭐ ET ELLE REFUSE PROPREMENT, elle ne force jamais. Un nom sans possessif
 *  (`Instrument (Wind)`, `Musical Instrument`, `Dice Set`, `Mount (Air)`)
 *  ressort ENTIER — c'est ce qui rend la règle sûre pour le barde, dont aucun
 *  candidat n'est un outil d'artisan. Un métier en deux mots ressortirait
 *  entier lui aussi, plutôt que tronqué à son premier mot.
 *
 *  📏 MESURÉ SUR LES 17 : alchemist · brewer · calligrapher · carpenter ·
 *  cartographer · cobbler · cook · glassblower · jeweler · leatherworker ·
 *  mason · painter · potter · smith · tinker · weaver · woodcarver. Les trois
 *  suffixes tombent, les dix-sept se dérivent, et le mot court est toujours un
 *  MORCEAU du nom entier — ce qui garde le nom accessible du bouton honnête. */
export function nomCourtDOutil(nom) {
  if (typeof nom !== "string") return nom;
  const m = METIER_POSSESSIF.exec(nom);
  return m ? m[1].toLowerCase() : nom;
}

/** LES OUTILS QUE LE JOUEUR A CHOISIS DANS SKILLS — `[{ref, nom, famille}]`.
 *
 *  ⚖️ ERIC, 21/09 : *« Pour l'outil du barde : tu regardes le choix fait dans
 *  Skills. S'il en a choisi deux, il aurait deux possibilités ; si un seul, il
 *  a cet instrument ; si aucun, il n'a rien. »* — puis *« idem barde et monk »*.
 *
 *  🔴 ON LIT LE DOCUMENT, JAMAIS L'ÉTAT D'UN AUTRE ÉCRAN. Skills collecte aussi
 *  ses ajouts dans `ecran.ajoutes.tool`, qui est une variable de module de
 *  `skills-step.mjs` : elle ne survit pas à un rechargement, elle n'est pas
 *  dans le personnage, et la lire d'ici ferait de cet écran le second lecteur
 *  d'un organe qui n'est pas le sien. Les dépenses, elles, sont DANS le
 *  document (`fh.skills.spend.<slug>`) — c'est le même endroit que
 *  `skillsCheminsDeReset` interroge pour son `Reset`.
 *  ⭐ ET ON NE FABRIQUE RIEN : ce lecteur ne pose aucun choix, il relit un choix
 *  déjà fait ailleurs.
 *
 *  ⛔ LE SLUG NE DIT PAS QUE C'EST UN OUTIL. `fh.skills.spend.<slug>` porte les
 *  compétences ET les outils dans le MÊME espace de noms (`athletics` à côté de
 *  `calligrapher-s-supplies`). Le tri se fait donc sur le CATALOGUE du genre
 *  `tool` de la pile montée, ⛔ jamais sur la forme du slug. */
export function outilsChoisisDansSkills({ query, document: docu, famille } = {}) {
  const q = typeof query === "function" ? query : () => null;
  let catalogue = [];
  try { catalogue = q({ kind: "tool" }) || []; } catch { catalogue = []; }
  const parSlug = new Map();
  for (const vue of catalogue) {
    const slug = vue && vue.record && typeof vue.record.slug === "string" ? vue.record.slug : null;
    if (slug) parSlug.set(slug, vue);
  }
  const choices = docu && docu.build && Array.isArray(docu.build.choices) ? docu.build.choices : [];
  const vus = new Set();
  const outils = [];
  for (const c of choices) {
    const path = c && typeof c.path === "string" ? c.path : "";
    if (!path.startsWith(CHEMIN_DEPENSE_SKILLS)) continue;
    const slug = path.slice(CHEMIN_DEPENSE_SKILLS.length);
    const vue = parSlug.get(slug);
    if (!vue || vus.has(slug)) continue;
    vus.add(slug);
    outils.push({ ref: { kind: "tool", id: vue.id }, nom: recordLabel(vue), famille: familleDeLOutil(vue) });
  }
  /* `famille` est une LISTE DE RACINES — une pour le barde (l'instrument),
     deux pour le moine (l'artisanat et l'instrument) depuis que le lot 247 a
     déclaré la famille « Artisan's Tools » sur ses dix-sept outils.
     🔴 LE `"any"` DU LOT 246 EST MORT, ET AVEC LUI SA SUR-INCLUSION : un moine
     qui avait acheté un jeu, un véhicule ou une monture les voyait proposés.
     ⚖️ Eric, 21/09, a fermé le trou en NOMMANT les dix-sept — *« les autres
     c'est other tools »* — et la borne vit dans la couche, pas ici.
     ⚠️ UNE DÉCLARATION SANS FAMILLE NE FILTRE RIEN, et ce n'est pas un défaut
     par distraction : une classe qui déclarerait un outil de départ sans dire
     de quelle famille doit montrer ce que le joueur a, plutôt que rien. ⛔ Mais
     aucune classe n'est dans ce cas aujourd'hui, et un garde le tient. */
  if (!Array.isArray(famille)) return outils;
  const racines = new Set(famille);
  return outils.filter((o) => racines.has(o.famille));
}
export const CHEMIN_DEPENSE_SKILLS = "fh.skills.spend.";

/** LE JOUEUR EST-IL PASSÉ PAR SKILLS ? — une dépense, n'importe laquelle.
 *  ⛔ Ce n'est PAS « a-t-il un outil » : une compétence achetée suffit. C'est le
 *  seul témoin que le document porte de la visite, et il sert à ne pas dire
 *  « aucun instrument » à quelqu'un qui n'a pas encore eu l'occasion d'en
 *  choisir un. ⚠️ Il est imparfait et je le dis : un joueur qui ouvre Skills et
 *  n'y dépense rien est indiscernable d'un joueur qui n'y est jamais allé. Le
 *  document ne porte pas la visite, il porte les dépenses — et ⭐ inventer un
 *  drapeau « vu » serait un second écrivain d'un état qui appartient à Skills. */
export function aDepenseDansSkills(docu) {
  const choices = docu && docu.build && Array.isArray(docu.build.choices) ? docu.build.choices : [];
  return choices.some((c) => c && typeof c.path === "string" && c.path.startsWith(CHEMIN_DEPENSE_SKILLS));
}

/* Les formes d'un pluriel anglais, ESSAYÉES DANS L'ORDRE et seulement APRÈS
   l'exact. ⛔ Aucune ne s'applique si le nom entier rencontre déjà un record :
   « Clothes, Traveler's » ne doit jamais devenir « Cloth ». */
const SINGULIERS = [(c) => c, (c) => c.replace(/ies$/, "y"), (c) => c.replace(/es$/, ""), (c) => c.replace(/s$/, "")];

function recordDuNom(parNom, nom) {
  const clef = clefDeNom(nom);
  for (const forme of SINGULIERS) {
    const trouve = parNom.get(forme(clef));
    if (trouve) return trouve;
  }
  return null;
}

/** LE DÉCOUPAGE D'UNE OPTION — `{lignes, refus, cout}`.
 *  · `lignes` : `{ref, quantity, nom, texte}`, prêtes pour `gear[N]` ;
 *  · `refus`  : les morceaux dont le nom ne rencontre aucun record, TELS QUE
 *               LE SRD LES ÉCRIT — l'écran les montre, il ne les avale pas ;
 *  · `cout`   : l'or contenu dans l'option, lu par `parseCout` — le SEUL
 *               lecteur de monnaie du dépôt, ancré des deux bouts.
 *  ⭐ LA QUANTITÉ SE LIT, ELLE NE SE DEVINE PAS : « 4 Handaxes » porte son
 *  compte devant, « Parchment (10 sheets) » le porte dans sa parenthèse. Les
 *  deux sont ÉCRITS dans la phrase ; ⛔ tout le reste vaut 1, et un morceau
 *  sans compte n'en reçoit pas un d'office. */
export function decouperOption(texte, parNom, declare) {
  const lignes = [];
  const refus = [];
  const couts = [];
  const absents = [];
  const outils = [];
  const dit = declare || {};
  const clefsAbsentes = new Set((dit.absents || []).map(clefDeNom));
  const clefOutil = dit.outil && typeof dit.outil.text === "string" ? clefDeNom(dit.outil.text) : null;
  for (const morceau of morceauxDeLOption(texte)) {
    const argent = parseCout(morceau);
    if (argent) { couts.push(argent); continue; }
    /* ⚖️ LOT 246 — LES DEUX DÉCLARATIONS SE LISENT SUR LE MORCEAU ENTIER, AVANT
       de lui retirer son compte et sa parenthèse : elles nomment le texte du
       LIVRE, mot pour mot, pas une forme intermédiaire que ce code fabrique.
       ⭐ La comparaison passe par `clefDeNom` — casse, espaces et apostrophes
       typographiques — parce que la phrase du moine porte « Artisan’s » avec
       une apostrophe courbe, et qu'une couche retapée à la main ne la porterait
       peut-être pas. ⛔ RIEN D'AUTRE n'est normalisé : pas de pluriel, pas de
       synonyme. */
    if (clefsAbsentes.has(clefDeNom(morceau))) {
      /* ⭐ UNE ABSENCE VOULUE N'EST PAS UN REFUS, et c'est le mot d'Eric du
         21/09 : *« Pas d'item spellbook, il sera matérialisé par la section
         sorts. Rien à ajouter ici. »* ⛔ Ne pas le poser dans Gear, et ⛔ ne pas
         le nommer au joueur comme un objet manquant — un écran qui s'excuse
         d'une absence délibérée envoie chercher un objet qui n'existe pas.
         ⚠️ Il sort des DEUX comptes : ni rapproché, ni refusé. */
      absents.push(morceau);
      continue;
    }
    if (clefOutil && clefDeNom(morceau) === clefOutil) {
      /* ⚖️ *« tu regardes le choix fait dans Skills »* — le morceau ne nomme pas
         un objet, il RENVOIE à une décision prise sur un autre écran. Ce qu'on
         en fait dépend de ce que le document porte, et `butinDuDepart` en
         décide : ici on se contente de dire que ce morceau EST la question. */
      outils.push({ texte: morceau, ...dit.outil });
      continue;
    }
    const compte = /^(\d+)\s+(.+)$/.exec(morceau);
    const sansCompte = compte ? compte[2] : morceau;
    const paren = /\s*\(([^)]*)\)\s*$/.exec(sansCompte);
    const nom = (paren ? sansCompte.slice(0, paren.index) : sansCompte)
      .replace(/^(?:an?|the)\s+/i, "").trim();
    const dansParen = paren ? /^(\d+)\s+\S/.exec(paren[1].trim()) : null;
    const quantity = compte ? Number(compte[1]) : (dansParen ? Number(dansParen[1]) : 1);
    const trouve = recordDuNom(parNom, nom);
    if (!trouve) { refus.push(morceau); continue; }
    lignes.push({ ref: trouve.ref, quantity, nom: trouve.nom, texte: morceau });
  }
  return { lignes, refus, absents, outils, cout: couts.length ? additionneCouts(couts) : null };
}

/** CE QUE LA SOURCE DÉCLARE SUR SA PROPRE PHRASE — `{absents, outil}`.
 *  ⭐ Les deux champs sont posés par `srfh-mecaniques-en`, la couche de ce qui
 *  est AMBIGU (ni le livre, ni Fate's Hand), montée dans LES DEUX piles. Une
 *  pile qui ne la monterait pas retrouve le comportement d'avant : le morceau
 *  refuse et se fait nommer. ⛔ Une absence de déclaration n'est jamais lue
 *  comme une permission. */
function declarationsDeLaSource(vue) {
  const data = (vue && vue.record && vue.record.data) || {};
  const absents = Array.isArray(data.starting_equipment_absent)
    ? data.starting_equipment_absent.filter((m) => typeof m === "string") : [];
  const brut = data.starting_equipment_tool;
  const outil = brut && typeof brut === "object" && typeof brut.text === "string"
    ? { text: brut.text, from_family: brut.from_family } : null;
  return { absents, outil };
}

/** LES DEUX SOURCES DE DÉPART ET LEURS OPTIONS — un seul lecteur, pour
 *  l'écran ET pour le geste.
 *  ⭐ `unique` EST LU DANS LA DONNÉE, PAS DANS LE NOM DE LA PILE. En SRD,
 *  l'origine porte « Choose A or B » : c'est un vrai choix. En Fate's Hand,
 *  la couche Inheritance ÉTEINT les quatre arrière-plans et pose `"50 GP"`,
 *  une chaîne nue : il n'y a rien à choisir. ⛔ Fabriquer un QCM à une seule
 *  réponse pour faire symétrique mentirait au joueur — la section devient une
 *  CONSTATATION. ⭐ Et c'est le témoin gratuit de ce lot : le même personnage,
 *  la même classe, rendu dans les deux piles, doit produire DEUX écrans
 *  différents. S'ils sont identiques, c'est que la pile n'est pas lue. */
export function departsDuPersonnage({ query, document: docu } = {}) {
  const q = typeof query === "function" ? query : () => null;
  const parNom = indexDesNoms(fabriquerChercheur(q));
  const refClasse = currentClassRef(docu);
  const vues = [
    { genre: "class", vue: refClasse ? q({ kind: "class", id: refClasse.id }) : null },
    { genre: "background", vue: origineDuDepart(q, docu) }
  ];
  return vues.map(({ genre, vue }) => {
    const lu = orDeLaSource(vue, genre);
    const declare = declarationsDeLaSource(vue);
    const options = optionsDeLaProse(lu.prose)
      .map((o) => ({ ...o, ...decouperOption(o.texte, parNom, declare) }))
      .map((o) => (o.outils.length ? { ...o, outils: o.outils.map((u) => ({
        ...u,
        /* ⭐ LES CANDIDATS SONT LUS ICI, UNE FOIS, et l'écran comme le geste
           lisent le MÊME résultat — la propriété du lot 182 étendue à ce
           morceau : ce que le récapitulatif montre EST ce que `Done` posera. */
        candidats: outilsChoisisDansSkills({ query: q, document: docu, famille: u.from_family }),
        /* ⚠️ « PAS ENCORE » N'EST PAS « AUCUN », ET C'EST UNE VRAIE DISTINCTION,
           pas un cas limite. Un joueur qui passe par Équipement AVANT Skills n'a
           encore rien choisi ; un joueur qui a fini Skills sans acheter d'outil
           a choisi de ne rien prendre. Les deux rendent zéro candidat, et ⛔ un
           écran qui dirait la même phrase aux deux mentirait à l'un des deux.
           📏 Ce qui les sépare se lit dans le DOCUMENT : `fh.skills.spend.*`
           existe-t-il, pour quoi que ce soit ? Une dépense sur une compétence
           suffit à prouver que le joueur est passé par Skills. */
        visiteSkills: aDepenseDansSkills(docu)
      })) } : o));
    return {
      genre,
      nom: lu.nom,
      mot: lu.nom || MOT_DE_LA_SOURCE[genre],
      prose: lu.prose,
      options,
      unique: options.length === 1,
      underived: options.length ? null
        : (lu.underived || "starting-equipment.phrase-unreadable")
    };
  });
}

/** CE QUE `Done` POSERA, pour un jeu de réponses `{class:"A", background:"B"}`.
 *  ⭐ L'ÉCRAN AFFICHE CETTE FONCTION ET LE GESTE EXÉCUTE CETTE FONCTION — c'est
 *  la propriété payée par le lot 182 (*« un écran qui annonce un montant et en
 *  pose un autre »*), étendue aux objets : le récapitulatif n'est pas une
 *  seconde description du butin, **c'est le butin**.
 *  · `complet` — toute source QUI POSE UNE QUESTION a reçu sa réponse ; une
 *    source illisible ne bloque pas `Done`, elle se fait nommer ;
 *  · `aEcrire` — ce que le document doit retenir pour se restaurer. ⛔ La
 *    coquille n'en compose aucune : elle écrit ce que ce lecteur lui rend. */
export function butinDuDepart({ query, document: docu, reponses } = {}) {
  const sources = departsDuPersonnage({ query, document: docu });
  const rep = reponses && typeof reponses === "object" ? reponses : {};
  const lignes = [];
  const refus = [];
  const faits = [];
  const questions = [];
  const couts = [];
  const aEcrire = [];
  let complet = true;
  for (const source of sources) {
    if (!source.options.length) {
      refus.push({ source: source.mot, texte: null, raison: source.underived });
      aEcrire.push({ genre: source.genre, valeur: source.underived });
      continue;
    }
    const choisie = source.unique
      ? source.options[0]
      : source.options.find((o) => o.lettre === rep[source.genre]);
    if (!choisie) { complet = false; continue; }
    for (const ligne of choisie.lignes) lignes.push(ligne);
    for (const morceau of choisie.refus) refus.push({ source: source.mot, texte: morceau, raison: null });
    /* ⚖️ LOT 246 — LE MORCEAU QUI RENVOIE À SKILLS, et ses TROIS sorties, qui
       sont les trois cas d'Eric au mot près :
         · UN candidat  → *« il a cet instrument »* : on le pose, sans question ;
         · DEUX ou plus → *« il aurait deux possibilités »* : une QUESTION de
           plus, et `Done` attend — ⛔ on ne pose rien d'office, choisir à la
           place du joueur serait pire que de ne rien poser ;
         · ZÉRO         → *« il n'a rien »* : un FAIT, ⛔ pas un refus. Rien à
           prendre dans Wares, rien à réparer.
       ⛔ ET CE N'EST PAS UN REFUS DANS LE COMPTE : le morceau a été COMPRIS. */
    for (const outil of (choisie.outils || [])) {
      const cands = outil.candidats || [];
      if (cands.length === 1) {
        lignes.push({ ref: cands[0].ref, quantity: 1, nom: cands[0].nom, texte: outil.texte });
        continue;
      }
      if (cands.length === 0) { faits.push({ source: source.mot, texte: outil.texte, visiteSkills: outil.visiteSkills }); continue; }
      const clef = cheminDeLOutil(source.genre);
      const pris = cands.find((c) => c.ref.id === rep[clef]);
      questions.push({ clef, source: source.mot, texte: outil.texte, candidats: cands, pris: pris ? pris.ref.id : null });
      if (!pris) { complet = false; continue; }
      lignes.push({ ref: pris.ref, quantity: 1, nom: pris.nom, texte: outil.texte });
      aEcrire.push({ genre: clef, valeur: pris.ref.id });
    }
    if (choisie.cout) couts.push(choisie.cout);
    aEcrire.push({ genre: source.genre, valeur: choisie.lettre || "only" });
  }
  return { sources, lignes, refus, faits, questions, aEcrire, complet,
    cout: couts.length ? additionneCouts(couts) : null,
    aPoser: posesDuButin(docu, lignes) };
}

/** LES ÉCRITURES `gear[N]` QUE LE BUTIN DEMANDE — `{ref, index, quantity, neuve}`.
 *
 *  🔴 CE QUE ÇA RÉPARE, ET LE MOTEUR L'A DIT AVANT MOI. Poser le kit ligne par
 *  ligne faisait JETER `rebuild` sur le personnage d'exemple :
 *    *« resolved.gear : deux entrées portent l'id "dagger" — l'ancre d'override
 *      "resolved.gear[dagger]" désigne les deux, et aucune ne gagne par défaut »*
 *  Ilyra porte déjà une dague ; le kit du Rogue en apporte deux. ⛔ Un `gear[]`
 *  n'admet pas deux lignes du même record — ce n'est pas une préférence
 *  d'écran, c'est un invariant du document, et il accuse au premier joueur qui
 *  a acheté quelque chose avant de répondre au QCM.
 *  ⭐ LA FUSION VIT DONC DANS LE LECTEUR, PAS DANS LE GESTE : la coquille et le
 *  harnais écrivent ce que cette fonction leur rend, ⛔ ils ne recalculent
 *  aucune quantité. Deux arithmétiques de la même quantité divergent.
 *  ⭐ ET L'INDEX NEUF EST ALLOUÉ ICI AUSSI, pour la même raison : deux objets
 *  neufs posés dans la même passe doivent recevoir deux index, et un écrivain
 *  qui relirait `nextGearIndex` entre deux écritures dépendrait de l'ordre des
 *  verbes. `nextGearIndex` garde son mot — il est appelé une fois, ici.
 *  ⛔ `quantity` EST LA VALEUR FINALE À ÉCRIRE, pas un supplément : un champ
 *  dont il faut se rappeler s'il s'ajoute ou s'il remplace est un champ qui
 *  sera lu de travers. */
function posesDuButin(docu, lignes) {
  const existantes = new Map();
  for (const l of currentGearLines(docu)) {
    if (l.ref && typeof l.ref.id === "string") existantes.set(l.ref.id, l);
  }
  let libre = nextGearIndex(docu);
  const poses = [];
  for (const ligne of lignes) {
    const deja = existantes.get(ligne.ref.id);
    if (deja) {
      const base = Number.isInteger(deja.quantity) ? deja.quantity : 0;
      deja.quantity = base + ligne.quantity;
      poses.push({ ref: ligne.ref, index: deja.index, quantity: deja.quantity, neuve: false });
      continue;
    }
    const neuve = { index: libre, quantity: ligne.quantity, ref: ligne.ref };
    libre += 1;
    existantes.set(ligne.ref.id, neuve);
    poses.push({ ref: ligne.ref, index: neuve.index, quantity: neuve.quantity, neuve: true });
  }
  return poses;
}

/** LES MOTS D'UNE OPTION — ce qu'elle DONNE, pas ce que la phrase dit.
 *  ⭐ ET C'EST DÉLIBÉRÉ : un libellé qui recopierait le texte SRD annoncerait
 *  des objets que le rapprochement n'a pas compris et qui n'arriveront pas
 *  dans Gear. Le bouton promet donc exactement ce que `Done` pose ; ce que le
 *  rapprochement a REFUSÉ se dit à part, sous la section, avec le texte du
 *  livre — visible AVANT de choisir. */
/** ⚖️ LOT 246 — CE QU'UNE SOURCE DIT AU JOUEUR EN PLUS DE SES OPTIONS, en UN
 *  SEUL ORGANE : la seconde question (l'outil de Skills), les faits, les refus.
 *
 *  🔴 POURQUOI UNE FONCTION ET PAS DEUX BOUCLES EN PLACE. L'affichage des refus
 *  vivait dans la branche « plusieurs options » ; la branche « une seule
 *  option » n'en affichait AUCUN et ⛔ personne ne pouvait le voir, parce que la
 *  seule source à une option de la pile (l'Inheritance, « 50 GP ») ne porte
 *  aucun morceau. ⭐ Un organe que deux branches fabriquent finit par diverger,
 *  et celui-ci avait déjà divergé. Les deux branches l'appellent maintenant.
 *
 *  L'ORDRE EST CELUI DE LA DÉCISION : ce qui demande une réponse d'abord, ce qui
 *  la constate ensuite, ce qui manque en dernier.
 *  ⛔ RIEN N'EST PEINT POUR UNE OPTION NON CHOISIE : `butin.questions` et
 *  `butin.faits` ne portent que l'option ÉLUE de chaque source. Un joueur qui
 *  prend la bourse ne se voit pas demander quel instrument il emporte. */
function ceQueLaSourceDit(source, butin, basculer) {
  const noeuds = [];
  for (const q of butin.questions.filter((x) => x.source === source.mot)) {
    /* ⚖️ ERIC, 21/09 : *« s'il en a choisi deux, il aurait deux possibilités »*
       — deux possibilités sont un CHOIX, donc une QUESTION de plus, ⛔ pas un
       objet posé d'office. Choisir à la place du joueur est pire que ne rien
       poser : il ne saurait jamais qu'on a choisi pour lui. */
    /* 📏 UNE LIGNE, PAS DEUX — mesuré au navigateur le 21/09 : *« Monk also
       gives you the tool you picked in Skills — Choose: »* rendait 34 blg (deux
       lignes) dans une carte qui déborde déjà. ⭐ C'est le geste exact du lot
       245, qui avait retiré les *« gives you a choice: »* parce que les
       rangées dessous le montraient déjà. ⛔ Le mot de la source n'est pas
       recopié ici : il est DANS le titre de la section, trois lignes plus haut,
       et le redire ne disait rien de neuf. */
    /* ⚖️ LOT 247, ERIC, 21/09 : *« Tu retires le mot tool sur chaque item. Tu
       fais **Tool : smith, glassblower etc.** — tu gagnes de l'espace. »*
       ⭐ LE LIBELLÉ DE FAMILLE ENTRE DANS LE FLUX, il ne le surplombe plus :
       c'est la phrase d'Eric au mot près, et c'est ce qui fait le gain.
       🔴 ET LE MOT COURT SEUL NE GAGNAIT RIEN — MESURÉ, avant de choisir cette
       lecture : raccourcir « Smith's Tools » en « smith » dans une rangée en
       colonne rendait la MÊME carte, **759 et 825 px**, au pixel près. La
       hauteur d'une rangée est celle de sa PASTILLE (44 déclarés, 60,02
       rendus), jamais celle de son mot — un libellé de deux lignes tient déjà
       sous 44. ⛔ Une lecture qui ne gagne rien ne peut pas être celle d'une
       phrase qui dit « tu gagnes de l'espace ». */
    const liste = el("div", "aiguilleur-options");
    liste.dataset.enLigne = "true";
    liste.append(el("p", "aiguilleur-soustitre", [text("Tool:")]));
    for (const cand of q.candidats) {
      const rangee = el("div", "aiguilleur-rangee");
      /* ⛔ LE RECORD N'A PAS CHANGÉ DE NOM, et c'est la borne de tout ce lot :
         `cand.nom` est intact partout ailleurs (le récapitulatif, le nom
         accessible du bouton, la ligne posée dans Gear) — seul CE libellé-ci
         est dérivé. Renommer `Smith's Tools` en `smith` DANS la donnée serait
         réécrire du SRD à la main. ⭐ Et le nom accessible garde le nom
         entier : le mot court en est un morceau, donc le bouton dit toujours
         ce qu'on lit. */
      rangee.append(el("p", "aiguilleur-option-mot", [text(nomCourtDOutil(cand.nom))]));
      const bo = button("", "aiguilleur-option",
        () => basculer(q.clef, cand.ref.id), `${cand.nom}, for ${source.mot}`);
      markPressed(bo, q.pris === cand.ref.id);
      rangee.append(bo);
      liste.append(rangee);
    }
    noeuds.push(liste);
  }
  for (const f of butin.faits.filter((x) => x.source === source.mot)) {
    /* ⭐ *« si aucun, il n'a rien »* — UN FAIT, ⛔ PAS UN REFUS. Rien à prendre
       dans Wares, rien à réparer.
       ⚠️ ET DEUX PHRASES, PAS UNE : *« pas encore »* n'est pas *« aucun »*. Un
       joueur qui n'a pas encore vu Skills doit lire qu'il y a quelque chose à
       y faire ; un joueur qui en revient les mains vides doit lire que c'est
       réglé. Une seule phrase mentirait à l'un des deux. */
    noeuds.push(el("p", "aiguilleur-texte aiguilleur-fait", [text(f.visiteSkills
      ? "No tool picked in Skills, so none comes with this kit."
      : "The tool for this kit is the one you pick in Skills — you have not been there yet.")]));
  }
  /* ⭐ LES REFUS SE DISENT AVANT LE CHOIX, PAS APRÈS. Un morceau de la phrase
     SRD que le rapprochement n'a pas compris ne partira pas dans Gear ; le
     joueur doit l'apprendre pendant qu'il choisit. ⛔ Un kit posé à moitié sans
     le dire est pire que pas de kit — et le texte montré est CELUI DU LIVRE,
     pour qu'il puisse prendre l'objet lui-même dans Wares. */
  for (const option of source.options) {
    for (const morceau of option.refus) {
      noeuds.push(el("p", "aiguilleur-texte aiguilleur-refus", [text(
        `${option.lettre ? `${option.lettre} · ` : ""}« ${morceau} » has no entry in this stack — not added. Pick it yourself in Wares.`)]));
    }
  }
  return noeuds;
}

export function motDuLot(option) {
  const { objets, somme } = piecesDuLot(option);
  const morceaux = somme ? [...(objets ? [objets] : []), somme] : (objets ? [objets] : []);
  return morceaux.length ? morceaux.join(", ") : "nothing";
}

/** ⚖️ LOT 248 — LES OBJETS D'UN CÔTÉ, LA SOMME DE L'AUTRE. Eric, 23/09 :
 *  *« mets toujours la somme en GP à la ligne »*. La monnaie n'est pas un objet
 *  de plus dans l'énumération : c'est ce avec quoi on ACHÈTE le reste, dans
 *  Wares. « …, and 4 GP » en queue de liste la faisait lire comme un huitième
 *  javelot.
 *  ⛔ ET LA COUPE NE SE FAIT PAS SUR LA CHAÎNE RENDUE : `option.cout` est un
 *  champ, il dit déjà où est la somme. Une expression régulière sur le texte
 *  aurait dérivé ce que la structure énonce — et elle se serait trompée le
 *  jour où un objet s'appelle « Pouch of 10 GP ».
 *  ⭐ UN SEUL ÉCRIVAIN : `motDuLot` lit cette fonction, il ne la double pas. */
export function piecesDuLot(option) {
  const objets = (option.lignes || []).map((l) => (l.quantity > 1 ? `${l.quantity} × ${l.nom}` : l.nom));
  return { objets: objets.join(", "), somme: option.cout ? formatCout(option.cout) : null };
}

/* Les deux chemins où la réponse au QCM se range — ⛔ un seul écrivain pour
   leur forme, lu par l'écran (qui se restaure) et par la coquille (qui écrit). */
export const cheminDuDepart = (genre) => `depart.${genre}`;
/** ⚖️ LOT 246 — LA SECONDE QUESTION D'UNE SOURCE porte le nom de la première,
 *  suffixé. ⭐ Une seule fabrique de chemin (`cheminDuDepart`), donc ⛔ pas de
 *  second écrivain du préfixe `depart.` : le jour où il change, il change une
 *  fois. La réponse retenue est l'ID DU RECORD de l'outil, pas son nom — un nom
 *  d'affichage change avec la pile (« Musical Instrument » en SRD, « Instrument
 *  (Strings) » en Fate's Hand), un id ne change pas. */
export const cheminDeLOutil = (genre) => `${genre}-tool`;
const DEPART_RE = /^depart\.(class|background)(-tool)?$/;

/** LE QCM A-T-IL DÉJÀ RÉPONDU ? — ⭐ ET LE SCALAIRE `depart` DES ANCIENS
 *  PERSONNAGES COMPTE. Du 26/08 au 21/09 la réponse s'écrivait `depart =
 *  "kit" | "purse"` ; un personnage sauvegardé la porte encore. ⛔ L'ignorer
 *  reposerait la question à quelqu'un qui a déjà répondu — et, pire, lui
 *  poserait un SECOND kit par-dessus le premier. C'est la même prudence que
 *  `addStartingPurse` tenait depuis le lot 182 : *« un clic, pas un effet de
 *  rendu, pour ne jamais réécrire une bourse déjà dépensée »*. */
export function departRepondu(docu) {
  const choices = docu && docu.build && Array.isArray(docu.build.choices) ? docu.build.choices : [];
  return choices.some((c) => typeof c.path === "string" && (c.path === "depart" || DEPART_RE.test(c.path)));
}

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

function button(label, className, onClick, ariaLabel) {
  const b = document.createElement("button");
  b.type = "button";
  if (className) b.className = className;
  b.textContent = label;
  if (ariaLabel) b.setAttribute("aria-label", ariaLabel);
  b.addEventListener("click", onClick);
  return b;
}

function numberField({ value, min, className, ariaLabel, onChange }) {
  const input = document.createElement("input");
  input.type = "number";
  if (min !== undefined) input.min = String(min);
  if (className) input.className = className;
  input.value = Number.isInteger(value) ? String(value) : "";
  if (ariaLabel) input.setAttribute("aria-label", ariaLabel);
  input.addEventListener("change", () => onChange(input.value));
  return input;
}

function searchField({ placeholder, className, ariaLabel, onInput }) {
  const input = document.createElement("input");
  input.type = "search";
  if (className) input.className = className;
  if (placeholder) input.placeholder = placeholder;
  if (ariaLabel) input.setAttribute("aria-label", ariaLabel);
  input.addEventListener("input", () => onInput(input.value));
  return input;
}

/* ══ LA LECTURE BRUTE, HORS `decisions[]` (aucun plan pour gear/currency) ══ */

/** Le choix `class` brut, lu dans `document.build.choices` — jamais
 *  `resolved` (cette lecture doit marcher MÊME si la dérivation entière n'a
 *  pas encore réussi, test 8 de la commande : « une classe non choisie »). */
function currentClassRef(document) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const entry = choices.find((c) => c.path === "class");
  return entry && entry.ref ? entry.ref : null;
}

/** Les lignes `gear[N]` déjà posées, indexées par N — aucun plan
 *  `decisions[]` ne les republie (mesuré : `gear` n'apparaît nulle part dans
 *  `decisions.mjs`). Une ligne peut être INCOMPLÈTE (ref sans quantity, ou
 *  l'inverse) : `derive.mjs` la déclare et la saute (`underived.gear-line-
 *  incomplete`) plutôt que de la refuser — ce lecteur rend donc TOUT ce qui
 *  existe, complet ou non, et laisse `renderGearRow` le dire. */
export function currentGearLines(document) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const byIndex = new Map();
  /* `location` (PIPELINE 24/08) : self | backpack | storage — facultative,
     absente = « backpack » (rien n'est porté sans geste). */
  /* `boite` (LOT 212) : l'emplacement CHOISI au doigt sur R — facultatif, une
     ligne sans boîte se range par son slot (`attribuerBoites`). */
  /* `attuned` · `locked` (LOT 213) : les deux états que la fiche X1 écrit —
     l'harmonisation du SRD, et le verrou qui *« empêche un item d'être bougé de
     son emplacement ou vendu »* (Eric, 17/09). 📏 Mesurés contre les verbes avant
     d'être posés : zéro violation, ils ressortent `unconsumed` — la fiche de
     personnage ne les lit pas encore, l'écran si. */
  /* `place` (LOT 214, seconde passe) : la PLACE de la ligne dans sa section — un
     entier, 0 pour la première case. ⚖️ Eric, 2026-09-18 : *« le rangement fait
     partie des caracs du perso ; ça doit survivre à la session au même titre que
     les autres changements »*. ⛔ C'est donc une écriture au DOCUMENT, pas un ordre
     d'écran comme l'était le tri de la première passe.
     ⭐ ET C'EST CE CHAMP QUI DONNE UN SENS À TOUT LE RESTE : une grille sans places
     se tasse toute seule — il n'y a alors ni trou à fermer (*« tighten up »*), ni
     page suivante où déborder, ni rangement à garder.
     📏 MESURÉ CONTRE LE MOTEUR AVANT D'ÊTRE POSÉ, même protocole que `boite`,
     `attuned` et `locked` : `rebuild` rend ZÉRO violation, zéro `underived` neuf,
     les chemins ressortent dans `unconsumed`, et `clear` ne laisse rien derrière.
     ⭐ UNE LIGNE SANS `place` GARDE SON RANG DE DOCUMENT : les personnages déjà
     sauvegardés s'ouvrent sans rien perdre, et la première remise en ordre leur en
     écrit une. Une absence n'est pas une faute, c'est l'état d'avant. */
  /* `bonus` · `powers[K]` · `plan` · `note` (LOT 265) : la RECETTE d'un objet crafté
     (`src/build/objet-crafte.mjs`) — la ligne pointe sur sa base, ces quatre
     chemins disent ce que le craft y a ajouté. */
  /* `variant` (LOT 277) : le mot de la variante d'un plan à variante (« Awareness »). */
  const pathRe = /^gear\[(\d+)\](?:\.(quantity|equipped|location|boite|attuned|locked|is|place|bonus|plan|note|variant|powers\[(\d+)\]))?$/;
  for (const choice of choices) {
    const match = typeof choice.path === "string" ? pathRe.exec(choice.path) : null;
    if (!match) continue;
    const index = Number(match[1]);
    if (!byIndex.has(index)) byIndex.set(index, { index });
    const line = byIndex.get(index);
    if (match[2] === "quantity") line.quantity = choice.value;
    else if (match[2] === "equipped") line.equipped = choice.value;
    else if (match[2] === "location") line.location = choice.value;
    else if (match[2] === "boite") line.boite = choice.value;
    else if (match[2] === "attuned") line.attuned = choice.value;
    else if (match[2] === "locked") line.locked = choice.value;
    else if (match[2] === "is") line.is = choice.value;
    else if (match[2] === "place") line.place = choice.value;
    else if (match[2] === "bonus") line.bonus = choice.value;
    else if (match[2] === "note") line.note = choice.value;
    else if (match[2] === "variant") line.variante = choice.value;
    else if (match[2] === "plan") line.plan = choice.ref;
    else if (match[3] !== undefined) (line.pouvoirs || (line.pouvoirs = []))[Number(match[3])] = choice.ref;
    else if (choice.ref) line.ref = choice.ref;
  }
  return [...byIndex.values()].sort((a, b) => a.index - b.index);
}

/* ══ LES SECTIONS DU SAC — lot 214 ═══════════════════════════════════════════
   ⚖️ Eric, 18/09 : les tuiles du sac s'appellent des SECTIONS, le joueur les crée,
   les renomme et les supprime quand elles sont vides.
   📏 MESURÉ CONTRE LE MOTEUR AVANT D'ÉCRIRE (même protocole que `attuned` et
   `locked`) : `backpack.sections[N].name` et `gear[N].boite` passent les verbes,
   `rebuild` rend ZÉRO violation, zéro `underived` neuf, et les deux ressortent
   dans `unconsumed`. ⭐ Le choix est donc de CONCEPTION, pas de moteur :
   · l'APPARTENANCE va dans `gear[N].boite` — le champ qui veut déjà dire « quelle
     case dans ce lieu » (`tete1` sur R, `sol1` au sol). ⛔ Pas de second nom ;
   · les NOMS vont dans `backpack.sections[N].name`, la forme de `gear[N].quantity`.
     ⛔ Pas un tableau sous un chemin unique : il se réécrirait en entier à chaque
     renommage, et le document perdrait la finesse de ses diffs. */
const SECTION_RE = /^backpack\.sections\[(\d+)\]\.name$/;
const RANG_RE = /^backpack\.sections\[(\d+)\]\.rang$/;
/* ⚖️ LE GENRE D'UNE SECTION — Eric, 2026-09-19 : *« outside your gear (horse, chest,
   house) »* · croquis « EDIT MODE 1 » : `OUTSIDE BACKPACK + SECTION` crée une place
   dorée, et 20/09 : *« je veux mon doré pour les other »*.
   🔴 CE CHEMIN MANQUAIT, ET C'EST TOUT CE QUI MANQUAIT : le `+` de droite créait une
   section ORDINAIRE. Le liseré doré existait, le genre existait à l'écran, et rien ne
   l'ÉCRIVAIT au document — donc il mourait au premier repeint. ⛔ Un genre qui ne
   persiste pas n'est pas un genre, c'est une couleur.
   ⭐ UN SCALAIRE, DE LA MÊME FORME QUE LE RANG : *« set n'accepte qu'un scalaire — une
   structure serait une règle déguisée »*. Le chemin existe ou il n'existe pas ; il n'y a
   pas de « faux » à écrire, et c'est ce qui rend la lecture sûre. */
const DEHORS_RE = /^backpack\.sections\[(\d+)\]\.dehors$/;
export const cheminDuDehors = (clef) => `backpack.sections[${clef}].dehors`;

/** Les sections rangées HORS du sac. ⛔ Leur contenu ne pèse pas sur le personnage —
 *  c'est la conséquence qu'Eric a dictée le 20/09 : *« ne compte pas dans l'équipement,
 *  c'est ailleurs : le cheval, un coffre dans le manoir »*. */
export function boitesDehors(document) {
  return new Set([...sectionsDehors(document)].map((i) => boiteDeSection(i)));
}

export function sectionsDehors(document) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const hors = new Set();
  for (const c of choices) {
    const m = typeof c.path === "string" ? DEHORS_RE.exec(c.path) : null;
    /* ⛔ UNE VALEUR FAUSSE EFFACE LE GENRE : le jour où un écran offrira de rapatrier une
       place, il écrira 0 ici plutôt que de retirer la ligne. */
    if (m && String(c.value) !== "0" && String(c.value) !== "false") hors.add(Number(m[1]));
  }
  return hors;
}
/* ⛔ LE PARTY BAG N'A PAS D'INDEX — sa clef est un MOT (§ `SECTION_PARTY`), donc son
   rang ne peut pas vivre sous `backpack.sections[N]`. Il a le SIEN, de même forme :
   une seule idée, deux lieux que la donnée impose. */
export const CHEMIN_RANG_PARTY = "backpack.party.rang";
export const cheminDuRang = (clef) =>
  (clef === SECTION_PARTY.clef ? CHEMIN_RANG_PARTY : `backpack.sections[${clef}].rang`);

/** Les sections déclarées, dans l'ordre de leur index. ⛔ Aucune n'est inventée :
 *  un sac neuf n'a pas de section, et l'écran le dira. */
export function currentSections(document) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const par = new Map();
  for (const c of choices) {
    const m = typeof c.path === "string" ? SECTION_RE.exec(c.path) : null;
    if (m) par.set(Number(m[1]), { index: Number(m[1]), nom: String(c.value ?? "") });
  }
  return [...par.values()].sort((a, b) => a.index - b.index);
}

/** ⚖️ LE RANG DE CHAQUE SECTION — la position que le JOUEUR a donnée à la roue.
 *  ⭐ Eric, 19/09 : *« on peut changer sa position [du party], mais pas l'effacer ni la
 *  renommer »* — donc l'ordre porte AUSSI le party, et c'est pourquoi il a son chemin.
 *  📏 MESURÉ CONTRE LE MOTEUR AVANT D'ÊTRE ÉCRIT (protocole P1, 19/09 au soir) : le
 *  scalaire passe propre — 0 violation, il ressort en `unconsumed`, `clear` ne laisse
 *  rien. ⛔ ET LA LISTE A ÉTÉ REFUSÉE : *« set n'accepte qu'un scalaire — une structure
 *  serait une règle déguisée »*. L'ordre est donc N scalaires, jamais un tableau. */
export function rangsDesSections(document) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const par = new Map();
  for (const c of choices) {
    if (typeof c.path !== "string") continue;
    if (c.path === CHEMIN_RANG_PARTY) { par.set(SECTION_PARTY.clef, Number(c.value)); continue; }
    const m = RANG_RE.exec(c.path);
    if (m) par.set(Number(m[1]), Number(c.value));
  }
  return par;
}

/* ══ LE PARTY INVENTORY — Eric, 2026-09-19 ══════════════════════════════════
   ⚖️ *« pour les sections du backpack, il faut que d'entrée de jeu il y ait un party
   inventory »*.
   ⭐ C'EST UNE SECTION QUI EXISTE SANS QUE PERSONNE NE L'AIT CRÉÉE, et c'est sa seule
   différence : elle a la grille, les places, le rangement et le glisser de toutes les
   autres. ⛔ Mais elle ne se supprime pas et ne se renomme pas — on n'efface pas une
   place qu'on n'a pas faite.
   🔴 SA CLEF EST UN MOT, PAS UN NUMÉRO, et c'est ce qui la rend sûre : `s0`, `s1`…
   sont distribués par `nextSectionIndex`, donc une section créée par le joueur
   finirait un jour sur le même numéro. `party` ne peut entrer en collision avec rien.
   ⚠️ ET LA SOURCE DU CHAPITRE DIT L'INVERSE, JE LE SIGNALE PLUTÔT QUE DE LE TAIRE :
   elle range `PARTY INVENTORY` parmi les quatre entrées qui *« dorment pendant la
   création »* — *« exige un inventaire DU GROUPE »*. Eric la réveille ici ; c'est sa
   page, et ce mot-ci est le plus récent. ⏳ L'artefact est à mettre à jour.
   ⚠️ ET CE QU'ELLE COÛTE, PARCE QUE ÇA NE SE VOIT PAS : une section du sac est DANS
   le sac, donc ce qu'on y range PÈSE sur le personnage et entre dans son encombrement.
   Si le party inventory ne doit pas peser, ce n'est pas une section — c'est un lieu,
   comme `storage`. ⏳ Question posée à Eric, non devinée. */
/* 📏 ET SON NOM EST MESURÉ, PAS CHOISI — Eric, 2026-09-19 : *« Party bag »*.
   ⛔ *« Party inventory dropdown »* NE POUVAIT PAS TENIR, et ce n'était pas une
   question de goût : le cran dominant offre **60,34 blg** de texte utile sur
   **2 lignes** (clamp), et le nom en demandait **125,76** — aucune coupure de mots
   ne tombant sous 60,34 (« Party inventory » 74,23 · « inventory dropdown » ~98).
   Il se tronquait donc, toujours, sur tous les écrans.
   ⭐ *« Party bag »* tient **sur une seule ligne**, et il dit le CONTENANT — ce qu'Eric
   avait déjà nommé le 19/09 : le party inventory est *« un autre backpack »*.
   ⛔ Et *« dropdown »* était un mot de la SOURCE, jamais un mot du joueur. */
export const SECTION_PARTY = Object.freeze({ clef: "party", nom: "Party bag" });

/* ══ LES SIX SECTIONS DU SAC — Eric, 2026-09-19 ════════════════════════════
   ⚖️ *« chaque section fait en 6. Backpack section 1 · Backpack section 2 · etc.
   6 en tout. »*
   ⭐ ELLES SONT LÀ D'ENTRÉE DE JEU, ET LE DOCUMENT N'EN SAIT RIEN TANT QU'ON N'Y
   TOUCHE PAS : six tiroirs vides ne sont pas six décisions du joueur. La première
   qu'il renomme s'écrit ; les autres restent des places que l'écran compose.
   ⭐ ET LEUR NOM TIENT SUR DEUX ÉTAGES, comme Eric l'écrit — c'est précisément ce
   pour quoi le cran a deux lignes depuis le 18/09 (*« on peut écrire sur deux étages
   aussi »*). ⛔ Le retour à la ligne n'est pas dans la donnée : c'est le cran qui
   replie, et un `\n` dans un nom se retrouverait dans l'`aria-label`.
   ⛔ SIX N'EST PAS UN PLAFOND : le `+` en ajoute au-delà, le `−` ne retire que
   celles-là. On ne supprime pas un tiroir qu'on n'a pas fait. */
/* ⚖️ LA LISTE, ARRÊTÉE PAR ERIC LE 19/09 : *« donc en somme : Party inventory
   dropdown · Backpack dropdown · Storage 1 · Storage 2 · Storage 3 »*.
   ⭐ CINQ, ET C'EST EXACTEMENT LE PLANCHER DU TAMBOUR : la roue est pleine dès le
   premier regard, sans trou ni répétition. ⛔ Ce n'est pas une coïncidence qu'on
   exploite — c'est une cote qui tombe juste, et je la nomme pour qu'on le voie si
   l'une des deux bouge.
   📌 QUATRE PORTENT UN INDEX (le dépôt, puis trois rangements) ; la cinquième, le
   party inventory, porte une CLEF EN MOT — voir `SECTION_PARTY`. */
export const SECTIONS_DU_SAC = 4;

/* ══ LE DÉPÔT DU SAC, ET LES CINQ RANGEMENTS — Eric, 2026-09-19 ═══════════════
   ⚖️ *« une des sections va s'appeler `backpack dropdown` ; tout ce qu'on met dans le
   backpack va dedans. Cette section ne s'efface pas non plus. »* · *« change `section`
   par : storage 1, storage 2 (c'est éditable) »* · *« pas backpack storage, juste
   storage »*.
   ⭐ LE DÉPÔT EST LA SECTION IMPLICITE, DEVENUE VISIBLE ET NOMMÉE. Une ligne du sac
   sans `boite` y tombait déjà — c'était « la première section » du rendu, anonyme.
   Elle a maintenant un nom, la première place, et une protection.
   ⛔ ELLE NE S'EFFACE PAS, et la raison n'est pas décorative : c'est là qu'atterrit
   tout ce que `Send to ▾ → Backpack` envoie. Une destination qu'on peut supprimer est
   une destination qui peut manquer au pire moment.
   ⭐ ELLE SE RENOMME, elle : Eric n'a interdit que l'effacement. ⛔ Le party inventory,
   lui, ne se renomme pas — son nom dit à QUI il est, pas ce qu'il contient.
   📌 ET LES CINQ AUTRES SONT DES `Storage`, PAS DES `Section` : *« juste storage »*.
   Un nom qui dit ce qu'on y met vaut mieux qu'un nom qui dit ce que c'est. */
export const SECTION_DEPOT = 0;
export const nomDeSectionParDefaut = (index) =>
  (index === SECTION_DEPOT ? "Backpack dropdown" : `Storage ${index}`);

/* 🔴 LA LISTE DES SECTIONS SE COMPOSE UNE FOIS, ET LES DEUX LECTEURS LISENT LA MÊME.
   ⛔ CE N'EST PAS UN RANGEMENT DE CONFORT — c'est la réparation d'une faute mesurée
   dans l'application le 19/09 au soir : le RENDU composait `[party, …les miennes]`
   (le party a pris la tête le 19/09), pendant que `surPlacer` recomposait
   `[…les miennes, party]` pour retrouver la section visée. Or `sectionSac` indexe
   ce qu'on VOIT. Les deux listes divergeaient donc d'un cran ET par leur source
   (`currentSections` seul contre le socle complété), et `Math.min(…, length - 1)`
   bornait l'écart au lieu de le crier.
   📏 CE QUE ÇA FAISAIT, MESURÉ : un objet lâché sur une case de `Backpack dropdown`
   partait dans `Party bag` — et comme la clef du party n'est pas `sN`, il finissait
   `location: "self"`, c'est-à-dire **équipé sur le corps**. Trois pas, aucun cri.
   ⭐ C'EST LA TROISIÈME VICTIME DU MÊME DÉPLACEMENT, après la boîte par défaut des
   envois et le viseur du `+`. *Une position déduite d'une liste qu'on réordonne est
   une bombe à retardement* — on ne la désamorce qu'en n'ayant qu'UNE liste. */
export function sectionsDuSac(document) {
  const declarees = currentSections(document);
  const parIndex = new Map(declarees.map((x) => [x.index, x]));
  /* ⭐ LES SIX SONT TOUJOURS LÀ ; celles que le joueur a nommées prennent la place de
     leur rang, les autres gardent leur nom par défaut. ⛔ `??` et non `||` : un nom
     VIDÉ par le `×` est un nom écrit, pas un nom absent. */
  /* ⭐ ET LE GENRE SE LIT AU DOCUMENT, ⛔ il ne se déduit pas du rang ni du nom : une
     place hors du sac peut s'appeler n'importe comment et vivre n'importe où dans
     l'ordre. C'est le joueur qui l'a dite dehors, en tapant le `+` doré. */
  const hors = sectionsDehors(document);
  const socle = Array.from({ length: SECTIONS_DU_SAC }, (_, i) => ({
    index: i, nom: (parIndex.get(i) || {}).nom ?? nomDeSectionParDefaut(i),
    renommable: i !== SECTION_DEPOT, ...(hors.has(i) ? { dehors: true } : {})
  }));
  const ajoutees = declarees.filter((x) => x.index >= SECTIONS_DU_SAC)
    .map((x) => (hors.has(x.index) ? { ...x, dehors: true } : x));
  /* ⭐ ET LE PARTY INVENTORY OUVRE LA LISTE — Eric, 19/09 : *« Party inventory
     dropdown · Backpack dropdown · Storage 1 · 2 · 3 »*. ⚠️ C'est l'ORDRE qui fait
     loi ; le cran s'appelle « Party bag » depuis le soir même (§ `SECTION_PARTY`). */
  const naturel = [{ index: SECTION_PARTY.clef, nom: SECTION_PARTY.nom,
                     party: true, fige: true, renommable: false }, ...socle, ...ajoutees];

  /* ⚖️ ET LE JOUEUR PEUT LES DÉPLACER — Eric, 19/09 au soir : *« edit mode comprenant
     le déplacement des storage »*, et pour le party : *« on peut changer sa position,
     mais pas l'effacer ni la renommer »*.
     ⭐ CE QUI N'A PAS DE RANG PASSE APRÈS, DANS SON ORDRE NATUREL — et c'est délibéré :
     une section créée APRÈS un rangement apparaît au bout, là où on l'attend. ⛔ Le
     contraire (l'ordre naturel qui reprend la main dès qu'un rang manque) aurait fait
     s'effondrer tout le rangement du joueur à la première section neuve.
     ⛔ ET LE TRI EST TOTAL : à rang égal — ce qui ne devrait pas arriver, puisqu'un
     déplacement RENUMÉROTE tout — c'est la place naturelle qui départage. Un tri qui
     laisse deux éléments interchangeables rend un ordre différent d'un rendu à l'autre,
     et personne ne voit pourquoi l'écran bouge. */
  const rangs = rangsDesSections(document);
  const clef = (s) => rangs.get(s.index);
  return naturel
    .map((s, naturelle) => ({ s, naturelle, rang: Number.isInteger(clef(s)) ? clef(s) : null }))
    .sort((a, b) => {
      if (a.rang === null && b.rang === null) return a.naturelle - b.naturelle;
      if (a.rang === null) return 1;
      if (b.rang === null) return -1;
      return a.rang - b.rang || a.naturelle - b.naturelle;
    })
    .map((x) => x.s);
}

/** ⚖️ LE LIEU D'UNE BOÎTE — UNE SEULE LOI, ET ELLE SE TESTE.
 *  ⛔ ELLE VIVAIT DANS `shell.mjs`, QUI N'EXPORTE RIEN : aucun garde ne pouvait donc
 *  l'interroger, et c'est précisément là qu'une faute a vécu jusqu'au 19/09 au soir.
 *  Le test portait sur la FORME de la clef (`/^s\d+$/`) ; or la clef du party bag est
 *  un MOT. Un objet déposé dans le sac commun tombait dans le `else` final et
 *  ressortait **équipé sur le personnage**.
 *  ⭐ ON TESTE DÉSORMAIS LA NATURE DU LIEU : `sN` et `party` sont deux écritures d'une
 *  même idée — *« ça se range, ça ne se porte pas »*.
 *  📌 `storage` pour le party : c'est la ligne **`Other`** du panneau, hors
 *  `Encumbrance` (`LIEUX_PESES` ne somme que `self + backpack`) — *« un autre backpack,
 *  partagé par tout le groupe »* (19/09) et *« other storage ne rentre pas dans
 *  encumbrance »* (18/09). ⏳ C'est la seule règle que ce lot tranche sans Eric ; elle
 *  se renverse ici, en un mot. */
export function lieuDeLaBoite(boite, horsDuSac) {
  const b = String(boite);
  if (b === boiteDeSection(SECTION_PARTY.clef)) return "storage";
  /* ⚖️ ET UNE SECTION DORÉE PESE COMME LE PARTY : Eric, 2026-09-20 : *« implication des
     other storage : ne compte pas dans l'équipement, c'est ailleurs — le cheval, un
     coffre dans le manoir »*.
     🔴 ET C'EST LA CONSÉQUENCE QUE J'AVAIS ÉCRITE DANS L'ENCART SANS QU'ELLE SOIT VRAIE DU
     CODE : une ligne rangée dans une place dorée gardait `backpack` et pèsait dans
     `Encumbrance`. ⛔ Un texte qui promet une règle que le code ne tient pas est pire
     qu'un texte absent — le joueur le croit.
     ⭐ LE MÉCANISME EXISTAIT DÉJÀ, ENTIER : le party bag rend `storage` pour cette
     raison exacte, et `LIEUX_PESES` ne somme que `self + backpack`. Il n'y avait rien
     à inventer, seulement à dire QUELLES boîtes sont dehors — et ça, seul le document
     le sait, donc ça se passe en argument. */
  if (horsDuSac && typeof horsDuSac.has === "function" && horsDuSac.has(b)) return "storage";
  if (/^s\d+$/.test(b)) return "backpack";
  if (/^sol\d+$/.test(b)) return "ground";
  return "self";
}

/** ⭐ Ce qui se RANGE ne se PORTE pas — le corollaire, nommé une fois. */
export const seRange = (boite, horsDuSac) => ["backpack", "storage"].includes(lieuDeLaBoite(boite, horsDuSac));

/** Le prochain index de section libre — même loi que `nextGearIndex` : un index
 *  qui a existé ne redevient pas anonyme.
 *  🔴 ET IL PART APRÈS LES SIX DU SOCLE (Eric, 19/09 : *« 6 en tout »*). ⛔ Sans ce
 *  plancher, le `+` d'un sac neuf écrivait l'index 0 — c'est-à-dire qu'il RENOMMAIT
 *  la première des six au lieu d'en créer une septième, et rien ne l'aurait dit.
 *  ⭐ Les six occupent 0..5 qu'elles soient écrites ou non : une place réservée l'est
 *  même vide, sinon elle n'est pas réservée. */
export function nextSectionIndex(document) {
  return currentSections(document)
    .reduce((max, s) => Math.max(max, s.index + 1), SECTIONS_DU_SAC);
}

/** La clef de boîte d'une section — `s0`, `s1`… ⭐ Elle se DÉDUIT de l'index, elle
 *  ne se stocke pas : deux sources pour une même appartenance divergeraient.
 *  ⭐ Sauf le party inventory, dont la clef est un MOT : voir `SECTION_PARTY`. */
export const boiteDeSection = (index) => (index === SECTION_PARTY.clef ? index : `s${index}`);
export const sectionDeBoite = (boite) => {
  const m = /^s(\d+)$/.exec(String(boite || ""));
  return m ? Number(m[1]) : null;
};

/* ══ LES PLACES D'UNE SECTION — lot 214, seconde passe ═══════════════════════
   ⚖️ Eric, 2026-09-18, en tranchant trois questions d'un coup :
   ① *« tighten up ok »* · ② *« plus de place, ça va dans la page suivante ou celle
   d'après, prochain emplacement dispo, voire ça crée une page supplémentaire si
   besoin »* · ③ *« le rangement fait partie des caracs du perso ; ça doit survivre
   à la session au même titre que les autres changements »*.

   ⭐ LES TROIS RÉPONSES NE FONT QU'UN SEUL MODÈLE, et c'est ce qui les rend courtes :
   **chaque objet du sac occupe une PLACE numérotée dans sa section**. La page n'est
   pas un organe, c'est une DIVISION de la suite des places — page = place ÷ 12. Dès
   lors : un trou est une place vide, donc *« tighten up »* veut dire quelque chose ;
   un objet qui arrive prend la première place libre, donc il déborde tout seul sur
   la page suivante ; et la place s'écrit au document, donc le rangement survit.
   ⛔ SANS CE CHAMP LES TROIS RÉPONSES ÉTAIENT IMPOSSIBLES À TENIR : une grille qui
   se tasse toute seule n'a ni trou, ni page suivante, ni rangement à garder. C'est
   pour ça que j'avais refusé d'écrire *« tighten up »* à la première passe.
   📏 Le chemin est mesuré contre le moteur — voir `currentGearLines`. */

/** Les lignes d'une section, RANGÉES PAR LEUR PLACE. ⭐ Une ligne sans place suit,
 *  dans l'ordre du document : un personnage sauvegardé avant ce lot s'ouvre sans
 *  rien perdre. */
export function lignesDeSection(lignes, boite, boiteParDefaut) {
  return lignes
    /* 🔴 UNE SECTION MONTRE CE QU'ELLE CONTIENT, ⛔ PAS SEULEMENT CE QUI PÈSE — faute
       mesurée dans l'application le 19/09 au soir. Ce filtre ne retenait que
       `location: "backpack"` ; or un objet envoyé au `Party bag` vit en `storage`
       (c'est la ligne `Other`, hors `Encumbrance`). Il était donc rangé POUR DE VRAI
       — le compte le disait, « Other 1 item » — et **sa section le montrait vide**.
       ⭐ LE DÉPARTAGE EST LA BOÎTE, PAS LE LIEU. Et il doit l'être finement, sinon on
       réveille des fantômes : la REMISE (SB3.3) porte elle aussi `location: "storage"`,
       mais SANS boîte — élargir sans cette condition l'aurait fait tomber tout entière
       dans le dépôt, qui est justement ce qui accueille les lignes sans boîte.
       ⚖️ DONC : une ligne du sac (`backpack`) peut ne pas nommer sa boîte — elle tombe
       au dépôt ; une ligne rangée AILLEURS (`storage`) n'entre que si elle NOMME sa
       section. ⭐ Et c'est déjà la porte des sections dorées à venir. */
    .filter((l) => {
      const lieu = l.location || "backpack";
      if (lieu === "backpack") return (l.boite || boiteParDefaut) === boite;
      if (lieu === "storage") return !!l.boite && l.boite === boite;
      return false;
    })
    .sort((a, b) => {
      const pa = Number.isInteger(a.place) ? a.place : Infinity;
      const pb = Number.isInteger(b.place) ? b.place : Infinity;
      return pa - pb || a.index - b.index;
    });
}

/** ⚖️ LA PLACE NEUVE D'UN OBJET DANS UNE SECTION — *« prochain emplacement dispo »*.
 *  🔴 CETTE FONCTION EXISTE POUR TENIR UN ARGUMENT QUI S'EST TROMPÉ. `lignesDeSection`
 *  prend DEUX boîtes : celle qu'on veut, et celle où vivent les lignes qui n'en
 *  nomment aucune. La coquille lui passait la MÊME aux deux places — donc, en envoyant
 *  vers le `Party bag`, tout le sac comptait comme déjà dans le party : la première
 *  place libre tombait à **7**, et l'objet atterrissait au milieu d'une section vide.
 *  Mesuré à l'écran le 19/09 au soir.
 *  ⭐ LA BOÎTE PAR DÉFAUT EST LE DÉPÔT, ET ELLE NE SE PASSE PLUS : elle se NOMME, ici,
 *  une fois. ⛔ Un défaut exprimé par la POSITION d'un argument est un défaut qu'on
 *  redonne faux un jour — c'est la même leçon que `SECTION_DEPOT` a déjà value. */
export function placeNeuveDans(lignes, boite, parPage) {
  return premierePlaceLibre(lignesDeSection(lignes, boite, boiteDeSection(SECTION_DEPOT)), parPage);
}

/** La grille d'une section : `places[i]` est la ligne posée à la place `i`, ou
 *  `null`. Sa longueur est un multiple de `parPage` — au minimum une page.
 *  ⭐ ELLE PORTE LES TROUS, et c'est tout son intérêt : c'est ce qui distingue
 *  « rangé » de « tassé ». */
export function grilleDeSection(lignes, parPage) {
  const places = [];
  const enAttente = [];
  for (const l of lignes) {
    if (!Number.isInteger(l.place) || l.place < 0) { enAttente.push(l); continue; }
    while (places.length <= l.place) places.push(null);
    /* ⛔ DEUX LIGNES SUR LA MÊME PLACE NE S'ÉCRASENT PAS — ça n'arrive pas par un
       geste de l'écran, mais un document édité à la main le peut. La seconde
       reprend la file : on ne perd jamais un objet pour une donnée douteuse. */
    if (places[l.place]) enAttente.push(l); else places[l.place] = l;
  }
  for (const l of enAttente) {
    let i = places.indexOf(null);
    if (i < 0) { i = places.length; places.push(null); }
    places[i] = l;
  }
  const pages = Math.max(1, Math.ceil(places.length / parPage));
  while (places.length < pages * parPage) places.push(null);
  return places;
}

/** La première place libre d'une section — ⚖️ *« prochain emplacement dispo, voire
 *  ça crée une page supplémentaire si besoin »*. ⛔ Elle ne se borne pas : une
 *  section peut avoir autant de pages qu'il le faut. */
export function premierePlaceLibre(lignes, parPage) {
  const grille = grilleDeSection(lignes, parPage);
  const libre = grille.indexOf(null);
  return libre >= 0 ? libre : grille.length;
}

/** Les quatre rangements du bouton `Sort`. ⚖️ Eric, 18/09 : *« on garde un sort
 *  local plus simple, on ne fait pas all sections ; tu peux rajouter quantity et
 *  tighten up »*. ⛔ `tasser` ne TRIE PAS : il ferme les trous en gardant l'ordre —
 *  c'est le seul des quatre qui respecte le rangement du joueur. */
export const RANGEMENTS = Object.freeze([
  { clef: "tasser", mot: "Tighten up" },
  { clef: "nom", mot: "A → Z" },
  { clef: "qte", mot: "Quantity" },
  { clef: "valeur", mot: "Value" }
]);

/** Ce qu'un rangement écrit : `[{ index, place }]`, une entrée par ligne de la
 *  section. ⛔ Elle ne touche pas au document — c'est le verbe qui écrit. */
export function rangement(lignes, mode, mesures) {
  const nom = (l) => String(mesures.nom(l) || "").toLocaleLowerCase();
  const suite = [...lignes];
  /* ⭐ LE NOM DÉPARTAGE TOUJOURS : deux piles de 4, deux objets à 5 gp — sans second
     critère leur ordre dépendrait de la stabilité du tri, donc de rien de lisible.
     Un rangement doit rendre le MÊME écran deux fois de suite. */
  if (mode === "nom") suite.sort((a, b) => nom(a).localeCompare(nom(b)));
  if (mode === "qte") suite.sort((a, b) => ((b.quantity || 1) - (a.quantity || 1)) || nom(a).localeCompare(nom(b)));
  if (mode === "valeur") suite.sort((a, b) => (mesures.valeur(b) - mesures.valeur(a)) || nom(a).localeCompare(nom(b)));
  /* `tasser` ne réordonne rien : `lignes` arrive DÉJÀ dans l'ordre des places. */
  return suite.map((l, i) => ({ index: l.index, place: i }));
}

/** Le prochain index `gear[N]` libre — jamais réutilisé après un retrait
 *  (un index qui a existé ne redevient pas anonyme, même loi que
 *  `emptyAbilityAssign`/`ABILITY_METHODS` : une carte simple, exportée pour
 *  que `shell.mjs` l'importe plutôt que d'en tenir une seconde copie). */
export function nextGearIndex(document) {
  return currentGearLines(document).reduce((max, line) => Math.max(max, line.index + 1), 0);
}

/** Les quatre clefs de `currency.*` déjà posées, lues brutes — une clef
 *  absente n'apparaît pas dans l'objet rendu (jamais un `0` inventé ici :
 *  c'est `resolved.currency` qui dit si la bourse est complète, ce lecteur
 *  ne fait que recopier ce que le joueur a VRAIMENT tapé). */
export function currentCurrency(document) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const out = {};
  for (const key of CURRENCY_KEYS) {
    const entry = choices.find((c) => c.path === `currency.${key}`);
    if (entry) out[key] = entry.value;
  }
  return out;
}

function recordLabel(view) {
  return view && view.record && typeof view.record.name === "string" ? view.record.name : null;
}

/* ⛔ `catalogue()` A ÉTÉ RETIRÉ ICI (lot 95). Il pliait `EQUIPMENT_RECORD_KINDS`
   en une liste plate, et PLUS RIEN NE L'APPELAIT depuis que le tambour a
   remplacé la molette. Le tambour lit maintenant le rangement, qui porte ses
   416 objets avec leur genre — la liste de genres n'a plus de lecteur. */

/* ══ LE TAMBOUR (lot 84) — DEUX ROUES, PUIS UNE GRILLE PAGINÉE ════════════
   Croquis d'Eric du 2026-08-23. Rayon → étagère → objet, où les deux
   premiers niveaux sont des ROUES (on se pose sur un cran, et s'y poser EST
   le choix) et le troisième une GRILLE qui PAGINE (elle montre, elle ne
   désigne pas).

   ⛔ ET C'EST LA RAISON D'ÊTRE DE LA GRILLE, pas un choix de forme : la règle
   d'Eric du 22/08 — « le joueur aurait acheté l'objet devant lequel il s'est
   arrêté » — doit rester IMPOSSIBLE. Une roue d'objets aurait un viseur, donc
   un objet courant ; une grille n'en a pas. En A et B se poser est choisir ;
   en C il faut un geste. */

/* ══ §4 — LA COUTURE DE DONNÉE, ET IL N'Y EN A QU'UNE ════════════════════

   🔴 CE BLOC DISAIT L'INVERSE JUSQU'AU 2026-08-24, ET IL AVAIT RAISON. Il
   mesurait qu'aucun record ne portait de taxonomie, et il en tirait la seule
   conclusion honnête : lire le GENRE du record et s'abstenir là où il n'y
   avait rien. C'est ce qui affichait `Armor · Gear · Item · Weapon` au premier
   niveau — des genres de données, présentés comme des rayons.

   ⛔ ERIC, LE 2026-08-24 : *« je devais pas voir armor au premier niveau,
   elles sont notées, on les respecte »*. Son rangement EXISTE, il est complet,
   et il est dans la donnée depuis le lot 90 de fh-srd — l'écran ne le lisait
   pas.

   ➡️ LA COUTURE A DONC CHANGÉ DE SOURCE, PAS DE FORME. Elle lit désormais la
   couche `srfh` (genre `shelving`, 416 records) : chaque record y déclare
   `data.shelf = {aisle, shelf}` et `data.extends` vers l'objet SRD qu'il
   habille. ⭐ Le rangement n'est plus DÉDUIT d'un champ de donnée, il est LU
   là où Eric l'a écrit. La table `ETAGERE_DE` a disparu : c'est elle qui
   fabriquait les faux rayons.

   ⛔ ET LES OBJETS RESTENT DES RECORDS SRD. `shelving` dit OÙ, jamais QUOI :
   le nom, le prix, le poids se lisent toujours sur le record que `extends`
   désigne. La couche habille, elle n'aplatit pas.

   🔴 UN LIBELLÉ N'EST PAS UNE IDENTITÉ — la leçon la plus chère de ce
   chantier, payée le 23/08 : les tables étaient indexées PAR LIBELLÉ, et
   l'écran affichait « Armor 19 » au-dessus d'une grille de 13 parce que deux
   étagères portaient ce mot. Ce n'est pas théorique dans la donnée actuelle :
   `marvels › clothing` ET `mundane › clothing` s'affichent tous deux
   « Clothing ». ⭐ L'identité d'une étagère est donc `aisle:shelf`, TOUJOURS,
   et le libellé ne sert qu'à être lu.

   ⚠️ LA LANGUE EST L'ANGLAIS, décision d'Eric du 23/08 (« ici pour le moment
   on construit autour de l'anglais »). La couche `srfh` n'existe qu'en
   anglais chez fh-srd, et le constructeur ne monte aujourd'hui AUCUNE couche
   française (`LAYER_FILES`). ⛔ Le jour où une pile FR sera montée, il lui
   faudra sa propre couche de rangement : cette fonction ne traduit rien et
   n'invente rien — elle DIT qu'elle n'a pas de rangement (§ ci-dessous). */

/** La valeur brute d'un champ, rendue lisible — et RIEN DE PLUS.
 *  ⛔ Pas de pluriel, pas de renommage, pas de table de correspondance : le
 *  libellé EST la valeur lue, seulement recasée. « wands-rods-staves » devient
 *  « Wands Rods Staves », jamais un joli nom choisi ici — une table de jolis
 *  noms serait une seconde écriture de la taxonomie, et deux écritures
 *  divergent. Les noms d'Eric vivent chez fh-srd, dans `src/shelving.py`. */
function titreDeValeur(valeur) {
  return String(valeur).split(/[-_\s]+/).filter(Boolean)
    .map((mot) => mot.charAt(0).toUpperCase() + mot.slice(1))
    .join(" ");
}

const parLibelle = (a, b) => a.label.localeCompare(b.label, "en");
const parNom = (a, b) => (recordLabel(a.view) || "").localeCompare(recordLabel(b.view) || "", "en");

/** Le genre `shelving` de la couche `srfh` — nommé une seule fois. */
const GENRE_RANGEMENT = "shelving";

/**
 * L'arbre du tambour : rayons → étagères → objets, LU dans le rangement
 * d'Eric (couche `srfh`, genre `shelving`).
 *
 * ⭐ TROIS ABSENCES SONT TRAITÉES, ET AUCUNE N'EST COMBLÉE EN SILENCE — une
 * absence n'est jamais une réponse :
 *   · pas de couche de rangement du tout → l'arbre est VIDE, et l'appelant
 *     l'affiche comme tel. ⛔ Pas de repli sur les genres : ce repli EST le
 *     défaut qu'on vient de retirer, et il reviendrait sans qu'on le voie ;
 *   · un record de rangement sans `aisle` ou sans `shelf` → il est COMPTÉ
 *     dans `orphelins`, jamais rangé de force sous une étiquette inventée ;
 *   · un `extends` qui ne résout pas → COMPTÉ dans `introuvables`. Un objet
 *     rangé dont le record a disparu est une pile incohérente, pas un vide.
 *
 * @param {Function} query `layers.verbs.query`
 * @returns {Array<{id:string,label:string,etageres:Array<{id:string,label:string,objets:Array}>}>}
 */
/** ⭐ LA POSE D'UN JETON DU CATALOGUE — ce que Wares donne à `corpsDuJeton`.
 *
 *  🔴 POURQUOI C'EST UNE FONCTION, ET C'EST LA RÉPARATION DU LOT 256, PAS SON ORNEMENT.
 *  Le 23/09, la diagonale du blueprint ne s'est jamais peinte sur le catalogue. Le
 *  prédicat était juste, le nœud était juste, la feuille était juste — ⛔ seule cette
 *  pose ne portait pas `recette`. Elle était une expression ANONYME au fond d'une
 *  closure de rendu, et c'est ce qui l'a rendue intouchable : **rien ne pouvait
 *  l'appeler**, donc rien ne pouvait l'éprouver. Le garde qu'on lui a opposé en
 *  urgence lisait sa SOURCE à la regex, et il le disait lui-même : faible.
 *  ⭐ Sortie ici, elle devient un organe comme un autre — l'écran l'appelle, le garde
 *  l'appelle, et le garde éprouve alors CE QUE L'ÉCRAN FABRIQUE, pas une copie de son
 *  texte. ⛔ C'est la doctrine du lot 214 appliquée à une pose au lieu d'un dessin :
 *  ce que deux lecteurs doivent voir pareil ne s'écrit qu'une fois.
 *
 *  ⚠️ `item.view` EST UNE VUE, PAS UN RECORD — mesuré : `recordLabel` lit
 *  `view.record.name`. Passer `item.view` à `estRecette` rendrait `{}`, et le prédicat
 *  ne verrait ni `category`, ni `rarity`, ni `contents`. C'est le défaut exact qui a
 *  coûté la diagonale, et il vit maintenant à UN seul endroit.
 *  ⛔ AUCUN PRIX ICI — la loi du 20/09 : le prix vit sur la fiche et dans la recherche.
 *
 *  @param {{view: {id: string, record: object}}} item une entrée de la pile rangée.
 *  @returns {{ref: string, nom: string, recette: boolean}} la pose, telle quelle. */
export function poseDeWares(item) {
  return {
    ref: item.view.id,
    nom: recordLabel(item.view) || item.view.id,
    recette: estRecette(item.view.record),
  };
}

export function rayonsEtEtageres(query) {
  const { rayons } = lireRangement(query);
  return rayons;
}

/** La lecture complète, refus compris. Séparée de `rayonsEtEtageres` pour que
 *  les tests puissent LIRE ce qui a été écarté : un compte d'écartés qu'aucun
 *  appelant ne peut obtenir est un compte que personne ne relira. */
export function lireRangement(query) {
  const rangements = query({ kind: GENRE_RANGEMENT }) || [];
  const orphelins = [];
  const introuvables = [];
  /* `Map` plutôt qu'objet : elle garde l'ordre de rencontre, remplacé ensuite
     par un tri explicite — jamais l'ordre du hasard. */
  const parRayon = new Map();

  for (const vue of rangements) {
    const data = (vue && vue.record && vue.record.data) || {};
    const shelf = data.shelf || {};
    const rayon = typeof shelf.aisle === "string" && shelf.aisle !== "" ? shelf.aisle : null;
    const etagere = typeof shelf.shelf === "string" && shelf.shelf !== "" ? shelf.shelf : null;
    if (!rayon || !etagere) {
      orphelins.push({ id: vue && vue.id, aisle: shelf.aisle, shelf: shelf.shelf });
      continue;
    }

    /* L'OBJET est le record SRD que `extends` désigne. ⚠️ `query` JETTE sur un
       genre inconnu (c'est sa force), donc `of_kind` est vérifié AVANT d'être
       passé : un rangement qui nommerait un genre absent du contrat ferait
       tomber tout l'écran au lieu d'être signalé. */
    const genre = typeof data.of_kind === "string" ? data.of_kind : null;
    const cible = typeof data.extends === "string" ? data.extends : null;
    const objet = genre && cible && isGenre(genre) ? query({ kind: genre, id: cible }) : null;
    if (!objet) {
      introuvables.push({ id: vue && vue.id, of_kind: data.of_kind, extends: data.extends });
      continue;
    }

    if (!parRayon.has(rayon)) parRayon.set(rayon, new Map());
    const etageres = parRayon.get(rayon);
    /* 🔴 L'IDENTITÉ EST `aisle:shelf`, JAMAIS LE LIBELLÉ. Deux rayons portent
       une étagère « Clothing » ; les confondre afficherait le compte de l'une
       au-dessus de la grille de l'autre. C'est arrivé le 23/08. */
    if (!etageres.has(etagere)) etageres.set(etagere, []);
    etageres.get(etagere).push({ kind: genre, view: objet });
  }

  const rayons = [...parRayon].map(([rayon, etageres]) => ({
    id: rayon,
    label: titreDeValeur(rayon),
    etageres: [...etageres].map(([etagere, objets]) => ({
      id: `${rayon}:${etagere}`,
      label: titreDeValeur(etagere),
      objets: objets.sort(parNom)
    })).sort(parLibelle)
  })).sort(parLibelle);

  return { rayons, orphelins, introuvables, lus: rangements.length };
}

/* ══ L'ATTENTE — ☆ ☉ ☾, ET CE QUI LES DÉCLENCHE ══════════════════════════
   Règle d'Eric, arrivée en cinq passes le 22/08 et étendue à la grille le
   23/08 : « dès qu'une roue BOUGE, tout l'aval cesse d'afficher un choix ;
   500 ms d'immobilité, et le choix reparaît ». Le compte mesure
   L'IMMOBILITÉ, pas le temps : il se réarme à chaque geste.

   ⭐ CE QUI A PRIS CINQ PASSES : le mécanisme n'a jamais changé, seul son
   MOMENT. Marqueurs sans délai → ça clignote à chaque cran franchi. Masquage
   complet → la moitié de l'écran disparaît à chaque geste.

   🔴 ET LE MOMENT ÉTAIT ENCORE FAUX — MESURÉ AU NAVIGATEUR LE 2026-08-23,
   après qu'Eric l'a vu sur son iPhone (*« j'ai bougé, la 2ᵉ et la 3ᵉ montrent
   des items ou une liste — pas normal »*). L'attente s'armait depuis `juger()`,
   qui rend la main AVANT `quandCran` quand le viseur n'a pas changé de cran
   (`if (i === dernier) return`). Le déclencheur n'était donc pas LE MOUVEMENT
   mais LE FRANCHISSEMENT D'UN CRAN.
   📏 L'instant observé, et il est nommé : la roue du haut poussée de **24 px**
   (un cran en vaut 82), état aval REMPLI. Relevé 6 s plus tard — `pisteB`
   `data-attente="non"` portant le cran « Gear », grille `data-attente="non"`
   portant ses quinze objets, titre « Gear ». **Aucun marqueur n'a jamais
   paru.** Tout début de geste, jusqu'au premier franchissement, vivait le même
   défaut ; un geste plus court que le demi-cran ne le quittait jamais.
   ➡️ Le déclencheur est donc l'ÉVÉNEMENT DE DÉFILEMENT lui-même (`quandBouge`),
   pas le verdict du viseur. */
const ATTENTE_MS = 500;

/** ⏱️ LA DURÉE D'UN BOND DE FLÈCHE — recette d'Archi 25 (logbook, « la roue de
 *  sélection ») : `behavior: "smooth"` dure ~400 ms et n'est PAS réglable ;
 *  une animation maison en **170 ms** avec `easeOutCubic` l'est. */
const GLISSE_MS = 170;

/** ⭐ ☆ ☉ ☾, DANS L'ORDRE, À CHAQUE ÉTAGE — Eric, 2026-08-23 : *« le 3 doit
 *  être des étoiles soleil lune, répartition dans l'ordre que j'ai dit, à
 *  chaque étage »*. La grille a TROIS colonnes : une rangée porte donc la
 *  série entière, et chaque rangée la répète.
 *  ⛔ IL N'Y A PLUS DE TIRAGE — donc plus la question du lot 84 (« se refait-il
 *  à chaque attente ou une fois pour toutes ? »). La retirer était la moitié de
 *  l'ordre : un commentaire qui pose une question morte est un commentaire
 *  faux. */
const SYMBOLES_ATTENTE = ["☆", "☉", "☾"]; // ☆ ☉ ☾

function symbolesDAttente(combien) {
  return Array.from({ length: combien }, (_, i) => SYMBOLES_ATTENTE[i % SYMBOLES_ATTENTE.length]);
}

/* ══ LA GRILLE — 5 LIGNES × 3 COLONNES ══════════════════════════════════
   ⭐ LE 15 N'EST PLUS ÉCRIT ICI, ET C'EST LE POINT (2026-08-26). C'est une
   norme du PRODUIT ENTIER — Eric, 23/08 : *« pour la liste des sorts niveau 1
   on fera ça, pour les maîtrises idem »* — donc elle vit au socle
   (`normes.mjs`, NORMES.md §5) et cet écran la LIT. Il ne la porte plus, et
   il n'a aucune raison de dévier : `LISTE_PAR_PAGE` nu, jamais un littéral.
   Le garde : `tests/listes.test.mjs`.
   ⛔ ET IL N'Y A PAS DE PLAFOND DE PAGES : `ceil(objets ÷ 15)`, toujours. Une
   étagère qui déborde des 35 visés (homebrew — « c'est prévu ») fait
   simplement plus de pages. */

/** ⏳ CE QU'UNE CASE PORTE — LE NOM, en attendant qu'Eric tranche.
 *  Sa question est ouverte (« les cases portent le NOM ou une IMAGE ? ») et
 *  elle décide de la taille des cases. La réponse d'ingénieur, pas d'arbitre :
 *  le contenu sort d'ICI et de nulle part ailleurs, et la taille d'une case
 *  est la seule variable `--fhpc-case-h` (`shell.css`). Le jour où il tranche,
 *  on change DEUX endroits, pas quinze.
 *  ⭐ Le nom, parce que c'est ce que le produit sait déjà afficher. */
function contenuDeCase(item) {
  return [text(recordLabel(item.view) || item.view.id)];
}

/* ══ LA ROUE — TROIS TOURS DE PISTE, ET LE SAUT QUI LES RECOUD ═══════════
   « Quand on arrive au bout on revient au début » (Eric, 22/08). On pose la
   liste TROIS FOIS bout à bout et on se tient dans le tour du milieu ; quand
   le défilement le quitte, on le ramène d'une longueur de tour. Le contenu
   est identique au pixel près, donc le saut ne se voit pas.

   🔴 ON FABRIQUE, ON NE CLONE PAS : `cloneNode(true)` ne copie pas les
   écouteurs, et un tiers de la roue serait mort — un tiers seulement, donc le
   défaut aurait l'air d'un caprice tactile.

   ⭐ UN BLOC DOIT ÊTRE LARGE, PAS SEULEMENT RÉPÉTÉ. Mesuré le 22/08 : avec
   3 crans, un bloc fait 3 × 121 = 363 px pour une fenêtre de 359 — on en sort
   au moindre geste, la couture tire en permanence, et l'œil la voit. Eric :
   « la roue A bien fluide, la roue B pas bien, ça clignote », À CODE
   IDENTIQUE. On répète donc la liste DANS le bloc jusqu'à MIN_BLOC crans.

   ⛔ EN DESSOUS DE TROIS CRANS, PAS DE ROUE : tripler une liste d'un ou deux
   crans fabrique une roue qui tourne sans avancer. Et le cas est RÉEL, pas
   théorique — « Gear » et « Armor » n'ont qu'une étagère, `scroll` n'a qu'un
   objet. */
const MIN_BLOC = 12;

function troisTours(liste, fabriquer) {
  const un = () => liste.map(fabriquer);
  if (liste.length < 3) return un();
  const tours = 3 * Math.ceil(MIN_BLOC / liste.length);
  const sortie = [];
  for (let t = 0; t < tours; t += 1) sortie.push(...un());
  return sortie;
}

/* ══ LES DEUX ORDONNANCEURS, ET POURQUOI ILS NE SONT PAS UN DRAPEAU ═══════
   🔴 UN GARDE BOOLÉEN SEMBLE ÉQUIVALENT ET NE L'EST PAS : si le
   `requestAnimationFrame` est demandé au moment où l'onglet passe en
   arrière-plan, il ne s'exécute JAMAIS — le drapeau reste levé et la roue est
   morte pour de bon. L'utilisateur revient, plus rien ne répond, et rien n'a
   rougi. Annuler puis replanifier donne le même throttle à une image, sans
   état qui puisse rester coincé.
   📌 Le repli `setTimeout` n'est pas du confort : hors navigateur il n'y a ni
   `requestAnimationFrame` ni mise en page, et tout ce qui suit se tait de
   lui-même (voir `pas()`). Ce qui compte, c'est que restaurer l'aimantation
   se fasse dans une AUTRE tâche — jamais dans celle qui l'a coupée. */
const demanderImage = typeof requestAnimationFrame === "function"
  ? (fn) => requestAnimationFrame(fn)
  : (fn) => setTimeout(fn, 16);
const annulerImage = typeof cancelAnimationFrame === "function"
  ? (id) => cancelAnimationFrame(id)
  : (id) => clearTimeout(id);

/* ══ LE TIC — UN CROCHET, PAS UNE PROMESSE ═══════════════════════════════
   `UISelectionFeedbackGenerator` — l'haptique qu'Apple réserve au passage
   entre valeurs discrètes — est NATIVE, et `navigator.vibrate()` n'existe pas
   sur Safari iOS. Une page servie dans Safari ne ticquera pas, quoi qu'on
   écrive ici ; le crochet est volontairement INERTE plutôt que remplacé par
   un ersatz visuel. Le jour où FHPC passe en WKWebView, le Swift n'a qu'à
   répondre au message.
   ⛔ ET IL NE TICQUE QU'AU CHANGEMENT DE CRAN, jamais à l'événement de
   défilement : un balayage rapide donne tic-tic-tic, un par cran franchi. */
function tic() {
  const pont = globalThis.webkit && globalThis.webkit.messageHandlers && globalThis.webkit.messageHandlers.haptic;
  if (pont) { try { pont.postMessage("selection"); return; } catch { /* pont muet */ } }
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") navigator.vibrate(8);
}

/** Ce que le navigateur a VRAIMENT accordé à la roue.
 *  ⚠️ `animation-timeline: view()` demande Chrome 115+ ou Safari 26+. En
 *  dessous, la déclaration est ignorée et les crans restent PLATS — une
 *  dégradation propre, mais muette. §6 de la commande : « fais dire à l'écran
 *  ce qu'il a obtenu » plutôt que de laisser deviner. Eric lit cette ligne sur
 *  son iPad et sait tout de suite s'il juge la roue ou son ombre. */
export function profondeurAccordee() {
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") return false;
  try {
    return CSS.supports("animation-timeline: view()") || CSS.supports("animation-timeline", "view()");
  } catch { return false; }
}

/* ══ UNE ROUE VIVANTE ════════════════════════════════════════════════════
   ⛔ CE QUI N'EST PAS ICI, ET C'EST TOUT LE §6 : AUCUNE ÉCRITURE DE
   TRANSFORMATION PAR IMAGE. Le défilement est composité sur un thread séparé ;
   du JS qui repeint les transformations est structurellement EN RETARD d'une
   image ou deux — pas trop lent, DÉSYNCHRONISÉ. Mesuré : passer de 0,448 ms à
   0,050 ms par image n'a rien changé à l'œil. La rotation vient donc de
   `animation-timeline: view()` (`shell.css`), évaluée par le compositeur.
   📌 Ce JS-ci ne fait plus que TROIS choses : dire quel cran est sous le
   viseur, recoudre la roue infinie, et armer l'attente de 500 ms.

   ⛔ ET IL N'ÉCRIT AUCUN `.style` : le garde 7 (`tests/ui-jetons.test.mjs`)
   l'interdit dans tout `ui/` hors du moteur de dés recopié. Couper
   l'aimantation le temps d'un bond passe donc par un ATTRIBUT, et la feuille
   fait le reste — ce qui est de toute façon la bonne place du décor. */
function monterRoue(piste, { longueur, rangCourant, quandCran, quandBouge }) {
  let pasCache = 0;
  let dernier = -1;
  let idImage = 0;
  let programmatique = 0;
  /* 🔴 LA POSITION QUE NOUS VENONS D'ÉCRIRE, ET ELLE EXISTE PARCE QUE LE COMPTE
     SEUL PERD LA COURSE — mesuré le 2026-08-23, au chargement de la page.
     Un `scroll` n'est PAS dispatché dans la tâche qui écrit `scrollLeft` : le
     navigateur l'émet à l'étape de rendu, APRÈS les rappels d'image. Or c'est
     un rappel d'image qui décrémente le compte. Le `scroll` de NOTRE PROPRE
     placement arrivait donc avec `programmatique === 0`, se faisait prendre
     pour un geste, et l'aval se révélait tout seul une seconde après le
     chargement — sans que personne n'ait touché l'écran.
     ⭐ LA POSITION, ELLE, NE COURT PAS : tant que le défilement est encore là où
     nous l'avons posé, il est de nous. Un doigt qui « bouge » jusqu'au pixel
     exact que nous venons d'écrire n'a pas bougé. */
  let positionEcrite = NaN;

  /** Le pas d'un cran, LU DANS LA MISE EN PAGE et mis en cache.
   *  ⭐ Il n'est écrit NULLE PART en JS : la cote vit dans `shell.css`
   *  (`--roue-cran-l` + `--roue-ecart`), et un nombre écrit deux fois est un
   *  nombre qui finit par se contredire.
   *  ⚠️ Il rend `0` tant que la mise en page n'a rien à dire — hors navigateur,
   *  ou avant le premier calcul. Tout ce qui en dépend se TAIT alors, au lieu
   *  de mesurer du vide. */
  function pas() {
    if (pasCache > 0) return pasCache;
    const enfants = piste.children;
    if (enfants.length >= 2) {
      const a = enfants[0].offsetLeft;
      const b = enfants[1].offsetLeft;
      if (Number.isFinite(a) && Number.isFinite(b) && b > a) pasCache = b - a;
    }
    return pasCache;
  }

  /** L'ÉCART entre deux crans, LU dans la mise en page comme le pas, et jamais
   *  recopié : la cote vit dans `shell.css` (`--roue-ecart`).
   *  ⭐ IL SERT DE SEUIL : rien de plus petit qu'un écart ne peut être un
   *  changement de choix. C'est la plus petite distance que le décor lui-même
   *  reconnaisse. Rend `0` tant que la mise en page ne dit rien — et un seuil de
   *  zéro ne laisse rien passer, ce qui est le bon défaut. */
  function ecart() {
    const enfants = piste.children;
    if (enfants.length < 2) return 0;
    const a = enfants[0];
    const b = enfants[1];
    const e = b.offsetLeft - (a.offsetLeft + a.offsetWidth);
    return Number.isFinite(e) && e > 0 ? e : 0;
  }

  /** ⭐ L'INDEX SORT DE `scrollLeft` ET DU PAS, JAMAIS D'UN RECTANGLE PAR
   *  ENFANT. Lire `getBoundingClientRect()` puis écrire, item par item, coûtait
   *  36 recalculs de mise en page PAR IMAGE (mesuré le 22/08). Ici : trois
   *  lectures pour toute la roue, et rien à écrire.
   *  📐 On cherche l'enfant dont le CENTRE est le plus proche du centre du
   *  champ. ⚠️ Et on part du premier enfant plutôt que de supposer qu'il est
   *  collé à zéro : une piste trop courte pour tourner porte une CALE (voir
   *  `data-court`), et cette cale décale tout. Mesuré : sans elle, la roue
   *  s'ouvrait sur le DEUXIÈME rayon (« Gear ») au lieu du premier — alors
   *  qu'Eric a posé la règle inverse au banc, « le premier est celui qui
   *  s'ouvre ». */
  function indexAuViseur() {
    const p = pas();
    const n = longueur();
    const premier = piste.children[0];
    if (p <= 0 || n <= 0 || !premier) return -1;
    const champ = piste.clientWidth;
    if (!(champ > 0)) return -1;
    const centre = piste.scrollLeft + champ / 2;
    const rang = Math.round((centre - premier.offsetLeft - p / 2) / p);
    return ((rang % n) + n) % n;
  }

  /** La position qui met le cran `rang` sous le viseur — l'inverse exact de
   *  `indexAuViseur`, et écrite comme telle pour que les deux ne puissent pas
   *  diverger. `depart` est le premier enfant du tour du milieu. */
  /* 🔴 ON LIT LE CRAN VISÉ, ON NE MULTIPLIE PLUS UN PAS — corrigé le
     2026-08-23 après qu'Eric a signalé trois fois un cran mal aligné avec
     celui du dessous, sur son iPhone.

     📏 LA CAUSE, MESURÉE DANS LA PAGE. `pas()` déduit le pas de l'écart entre
     les DEUX PREMIERS crans, et `offsetLeft` rend des ENTIERS : le pas réel de
     76,33 px se lisait **76**. `positionDe` multipliait ensuite ce 76 par le
     rang du cran — et le tiers de pixel perdu se cumulait :

         rang  0 (12 crans plus loin)   formule 837   exact 840   −3
         rang  3                        formule 1065  exact 1069  −4

     Plus on s'éloigne du départ, plus le cran est à gauche de son viseur.
     C'est exactement ce qu'Eric voyait, et ça grandissait avec la distance.

     ⛔ ET RIEN NE LE RATTRAPAIT, ce qui est la deuxième moitié du défaut :
     `sauter` coupe l'aimantation le temps d'écrire `scrollLeft` (`data-couture`),
     puis la remet. Or **remettre `scroll-snap-type` ne recale pas une position
     déjà posée** — le navigateur n'aimante qu'au défilement suivant. L'erreur
     restait donc à l'écran jusqu'au prochain geste.

     ⭐ LE CRAN SAIT OÙ IL EST : `offsetLeft` + la moitié de sa largeur, moins la
     moitié du champ. C'est mot pour mot ce que `scroll-snap-align: center` fait
     — donc on atterrit SUR un point d'aimantation, et non à côté.
     📌 « Tout en rapport au pas » reste la loi du DÉCOR (la courbure, la fuite,
     les 51 images) : là, le pas est un rapport, jamais une adresse. Pour
     DÉSIGNER un cran, on lit le cran. */
  function positionDe(rang) {
    const piste_ = piste;
    const champ = piste_.clientWidth;
    const n = piste_.children.length;
    if (!(champ > 0) || n === 0) return null;
    const depart = longueur() >= 3 && n >= 3 ? Math.round(n / 3) : 0;
    const cible = piste_.children[depart + rang];
    return centreDe(cible);
  }

  /** 🔴 NOS PROPRES ÉCRITURES DE `scrollLeft` ÉMETTENT UN `scroll`
   *  INDISTINGUABLE D'UN GESTE. Sans ce marquage, poser la roue au chargement
   *  armait le compte d'attente, et l'aval se révélait tout seul une seconde
   *  plus tard — donc LOIN de sa cause, ce qui rend le défaut introuvable.
   *  ⭐ Un COMPTE et pas un booléen : deux gestes programmatiques peuvent se
   *  chevaucher, et un booléen rendrait la main trop tôt. */
  function programmatiquement(faire) {
    programmatique += 1;
    faire();
    positionEcrite = piste.scrollLeft;
    demanderImage(() => { programmatique -= 1; });
  }

  /** Bond instantané, sans aimantation ni animation.
   *  🔴 RENDRE LA MAIN À LA PROCHAINE TÂCHE, PAS TOUT DE SUITE. Restaurer dans
   *  la même tâche, c'est n'avoir JAMAIS coupé l'aimantation : le navigateur ne
   *  voit que l'état final, re-snappe, et la roue saute — le « ça fait sauter
   *  l'écran » d'Eric venait aussi de là.
   *
   *  📌 CE BOND LAISSE UNE TRACE APRÈS LUI, ET ELLE EST MESURÉE — voir la
   *  tolérance de `deNous` dans l'écouteur de défilement : rendre l'aimantation
   *  fait RECALER la position d'environ un pixel, une image plus tard. */
  /* 🔴 LE BOND EST INSTANTANÉ, ET IL LE DIT LUI-MÊME — corrigé le 2026-08-23,
     deuxième moitié du cran mal aligné qu'Eric a signalé trois fois.

     📏 CE QUI SE PASSAIT, MESURÉ EN CLIQUANT QUATRE FOIS LA FLÈCHE : le cran
     visé s'arrêtait à 10,9 px du viseur, puis 15,7, puis 19,0, puis 21,4 — un
     décalage qui GRANDIT à chaque saut au lieu de se répéter. Un bond qui rate
     sa cible d'une constante est une erreur de calcul ; un bond qui rate de
     plus en plus est un bond qui n'a pas fini avant qu'on relance le suivant.

     ⛔ LA CAUSE ÉTAIT UNE DÉPENDANCE À L'ORDRE DES RECALCULS, et c'est le genre
     de chose qui marche neuf fois sur dix. La feuille coupe bien le défilement
     doux pendant la couture (`.roue-piste[data-couture="oui"]` → `scroll-behavior:
     auto`), mais poser l'attribut et écrire `scrollLeft` dans la MÊME tâche ne
     garantit pas que le style soit recalculé entre les deux. L'écriture partait
     donc en défilement DOUX ; l'image suivante retirait la couture, rendant
     l'aimantation au milieu de l'animation ; et le bond s'arrêtait où il en
     était. ⭐ Rien ne le rattrapait ensuite : remettre `scroll-snap-type` ne
     recale pas une position déjà posée, le navigateur n'aimante qu'au
     défilement suivant.

     ⭐ `behavior: "instant"` DIT L'INTENTION DANS L'APPEL, au lieu de l'espérer
     d'une feuille : ce bond-ci ne s'anime jamais, quelle que soit la cascade et
     quel que soit l'ordre des recalculs. La couture reste — elle coupe
     l'aimantation, ce qui est son autre rôle — mais plus rien ne dépend du
     moment où elle prend effet. */
  function sauter(cible) {
    piste.dataset.couture = "oui";
    programmatiquement(() => {
      if (typeof piste.scrollTo === "function") piste.scrollTo({ left: cible, behavior: "instant" });
      else piste.scrollLeft = cible;
    });
    demanderImage(() => { piste.dataset.couture = "non"; });
  }

  /** Recoud la roue : quand le défilement quitte le tour du milieu, il y
   *  revient d'un bond invisible — le contenu est identique au pixel près.
   *  ⛔ Sous trois crans il n'y a pas de roue, donc rien à recoudre. */
  function enrouler() {
    const p = pas();
    const n = piste.children.length;
    if (p <= 0 || longueur() < 3 || n < 3) return;
    const tour = (n / 3) * p;
    if (!(tour > 0)) return;
    const x = piste.scrollLeft;
    if (x < tour * 0.5) sauter(x + tour);
    else if (x > tour * 1.5) sauter(x - tour);
  }

  function juger() {
    /* La couture d'abord : on recentre AVANT de juger, pour que le verdict
       porte sur la position définitive et pas sur celle d'avant le bond. */
    enrouler();
    const i = indexAuViseur();
    if (i < 0) return;
    for (const enfant of piste.children) {
      enfant.dataset.vise = String(Number(enfant.dataset.rang) === i);
    }
    if (i === dernier) return;
    /* ⛔ PAS DE TIC AU TOUT PREMIER JUGEMENT : `dernier` vaut −1 au montage et
       à chaque remplissage. Ticquer là ferait vibrer l'appareil à l'ouverture
       de l'écran — un retour qui ne répond à aucun geste. */
    if (dernier !== -1 && programmatique === 0) tic();
    dernier = i;
    quandCran(i, programmatique > 0);
  }

  /* 🔴 DEUX CHOSES ARRIVENT SUR UN `scroll`, ET ELLES N'ONT PAS LE MÊME
     MOMENT. `juger` attend une image, parce qu'il LIT la mise en page et
     qu'une lecture par événement coûterait 36 recalculs. `quandBouge`, lui,
     n'a rien à lire : il dit « ça bouge », et c'est vrai TOUT DE SUITE.
     ⭐ C'est ce décalage qui a fait le défaut du 23/08 : l'attente vivait
     dans `juger`, donc derrière le verdict du viseur — elle ne s'armait qu'au
     franchissement d'un cran, jamais au mouvement. Mesuré : 24 px de geste,
     aucun marqueur, jamais.
     ⛔ ET IL RESTE BORNÉ PAR DEUX GARDES, PAS UN : nos propres écritures de
     `scrollLeft` (le placement au montage, la couture, le repos après un
     remplissage) ne sont pas des gestes, et les compter rearmerait l'attente en
     boucle.

     🔴 LE COMPTE SEUL A ÉTÉ MESURÉ INSUFFISANT, ET AUCUN NOMBRE D'IMAGES NE LE
     SAUVE. Relevé au chargement, sans qu'un doigt touche l'écran :

         scrollLeft 1024,5   écrit 1024,5   fenêtre ouverte   → de nous
         scrollLeft 1023     écrit 1024,5   fenêtre FERMÉE    → pris pour un geste

     Le second n'est pas un geste : c'est l'AIMANTATION qui recale notre propre
     bond quand on la lui rend. ⛔ Et la fenêtre ne peut pas être élargie pour le
     couvrir : un `scroll` est distribué à l'étape de rendu, APRÈS les rappels
     d'image de cette même étape — un compte fermé par `demanderImage` arrive
     toujours en avance, quel que soit le nombre d'images qu'on lui donne.
     Essayé, mesuré, faux.
     ⭐ D'OÙ UN SEUIL, ET IL SE LIT DANS LA MISE EN PAGE : un déplacement plus
     petit que l'ÉCART entre deux crans n'est pas un choix, c'est un arrondi.
     📏 Ce qu'il sépare, aux deux bouts : le recalage mesuré vaut **1,5 px**, le
     geste le plus court qu'Eric ait signalé en vaut **24**, et l'écart tombe
     entre les deux. ⛔ Aucune cote recopiée — `ecart()` mesure les crans, comme
     `pas()`. */
  piste.addEventListener("scroll", () => {
    const deNous = programmatique > 0 || Math.abs(piste.scrollLeft - positionEcrite) <= ecart();
    if (!deNous && quandBouge) quandBouge();
    annulerImage(idImage);
    idImage = demanderImage(juger);
  }, { passive: true });

  /* ⛔ CE BLOC DÉCRIVAIT LA FLÈCHE ET SON « défilement natif (`scroll-behavior:
     smooth`) » — retiré le 2026-08-26, parce que NI L'UN NI L'AUTRE N'EXISTE
     PLUS. Les chevrons sont partis le 24/08 avec `avancer` ; `scroll-behavior:
     smooth` a été retiré de `.roue-piste` le même jour. Un commentaire qui
     nomme deux organes morts envoie chercher au mauvais endroit — c'est
     littéralement ce qui est arrivé en cherchant `glisserVers`. */
  /* ⭐ CENTRER UN CRAN, ET LE LIRE SUR LE CRAN — l'organe unique dont
     `positionDe`, `avancer` et `viser` manquaient chacun à sa façon.
     C'est mot pour mot ce que fait `scroll-snap-align: center` : on atterrit
     donc SUR un point d'aimantation, jamais à côté. */
  /* 🔴 EN SOUS-PIXEL, ET C'EST CE QUI SUPPRIME LE PETIT SAUT — Eric, après
     essai au doigt : *« ça arrive un peu sur la droite et l'aimantage le remet
     au milieu »*. Le bond visait donc À CÔTÉ d'un point d'aimantation, et
     l'aimant faisait un SECOND mouvement pour rattraper. Deux mouvements pour
     un geste : c'est ce qu'il voyait.

     ⛔ LA CAUSE EST ENCORE L'ARRONDI, MAIS D'UN AUTRE CÔTÉ. `offsetLeft`,
     `offsetWidth` et `clientWidth` rendent des ENTIERS : un cran de 73,81 px se
     lit 74, un champ de 226,5 se lit 226. La cible tombait donc à un demi-pixel
     près — assez pour que l'aimantation ait quelque chose à corriger.

     ⭐ ON LIT DONC LA MISE EN PAGE EN FRACTIONS : la largeur calculée du cran et
     l'écart calculé de la piste sont des réels. Le pas exact est leur somme, et
     le rang du cran suffit à le placer — sans accumuler quoi que ce soit,
     puisqu'on multiplie une valeur EXACTE et non un entier arrondi.
     ⛔ ET SURTOUT PAS `getBoundingClientRect()` SUR UN CRAN : les crans portent
     la transformation de la roue (translation, fuite, rotation). Leur rectangle
     à l'écran est donc celui de l'ILLUSION, pas celui de la mise en page — s'en
     servir pour viser reviendrait à courir après le décor. `offsetLeft` ignore
     les transformations, et c'est exactement pour ça qu'on le garde comme
     origine. La piste, elle, n'est pas transformée : son rectangle est fiable,
     et il est fractionnaire. */
  function centreDe(noeud) {
    const premier = piste.children[0];
    if (!noeud || !premier) return null;
    const rang = [...piste.children].indexOf(noeud);
    if (rang < 0) return null;
    const largeur = parseFloat(getComputedStyle(premier).width);
    const ecart = parseFloat(getComputedStyle(piste).columnGap) || 0;
    /* 🔴 LE RECTANGLE EST EN PIXELS PEINTS, LA LARGEUR CALCULÉE EN BLG — et
       sous `zoom` (lot 85) ce ne sont plus les mêmes unités : mesuré, un bloc
       de 200 blg rend `rect.width` 600 au cran 3 quand `getComputedStyle`
       rend toujours 200. Les soustraire l'un de l'autre donnait une cible
       fausse × le cran. On ramène donc le champ dans la famille des autres.
       ⭐ Et la RAISON du rectangle tient toujours : c'est lui qui donne la
       FRACTION que `clientWidth`, entier, arrondit — le demi-pixel qui faisait
       corriger l'aimantation.

       🔴 CORRIGÉ LE 30/08 AU SOIR — LA LIGNE D'AVANT NE TENAIT PAS CETTE
       PROMESSE, ET LA NOTE LE PRÉTENDAIT QUAND MÊME. Elle écrivait
       `rect(piste) / facteurZoom(piste)` ; or `facteurZoom(n)` vaut
       `rect(n) / offset(n)`, donc le quotient se simplifie en `piste.offsetWidth`
       — un ENTIER, précisément ce que le rectangle servait à éviter. Le facteur
       se mesure donc sur la RACINE D'ÉCHELLE (`.app`), jamais sur le nœud
       qu'on convertit. */
    const champ = piste.getBoundingClientRect().width / facteurZoomCourant();
    if (!(largeur > 0) || !(champ > 0)) return null;
    return premier.offsetLeft + rang * (largeur + ecart) + largeur / 2 - champ / 2;
  }

  /** Le cran actuellement sous le viseur — lu dans la mise en page, jamais
   *  déduit d'un compteur qui pourrait avoir dérivé. */
  function cranSousLeViseur() {
    const champ = piste.clientWidth;
    if (!(champ > 0)) return null;
    const cible = piste.scrollLeft + champ / 2;
    let meilleur = null, ecart = Infinity;
    for (const cran of piste.children) {
      const d = Math.abs(cran.offsetLeft + cran.offsetWidth / 2 - cible);
      if (d < ecart) { ecart = d; meilleur = cran; }
    }
    return meilleur;
  }

  /* 🔴 UNE FLÈCHE VISE LE CRAN VOISIN, ELLE N'AJOUTE PLUS UN PAS — corrigé le
     2026-08-23, même racine que `positionDe` et `viser`.
     📏 CE QUE FAISAIT L'ANCIENNE : `scrollLeft += sens * pas()`. Or `pas()` se
     déduit de l'écart entre les deux premiers crans, et `offsetLeft` rend des
     ENTIERS : le pas réel de 76,33 px se lit **76**. Chaque flèche perdait donc
     un tiers de pixel, et l'erreur s'ajoutait à la précédente au lieu de se
     corriger — dix pressions, trois pixels et demi de dérive, sans que rien ne
     la remette d'aplomb.
     ⛔ ET L'AIMANTATION NE SAUVE PAS : elle ne recale qu'au défilement suivant,
     jamais une position déjà posée.
     ⭐ Viser le VOISIN plutôt qu'ajouter un pas rend la dérive impossible par
     construction : chaque bond repart de ce que la page montre, pas de ce qu'un
     compteur croit. Il n'y a plus rien à accumuler. */
  /* ⛔ `avancer` A DISPARU AVEC LES CHEVRONS (2026-08-24) : ils étaient son
     seul appelant. Un organe qui ne sert plus personne est un nom mort, et le
     garde le dirait.

     🔴 ET LE COMMENTAIRE QUI TENAIT ICI ÉTAIT FAUX — corrigé le 2026-08-26.
     Il affirmait que `glisserVers` « survit » et « reste employé par `viser` ».
     📏 MESURÉ : le même commit qui a retiré `avancer` (`de88997`) a retiré
     `glisserVers` avec lui, et n'a PAS suivi son appel. Chrome 151, page
     servie en local, un clic sur un cran du tambour :

         Uncaught ReferenceError: glisserVers is not defined

     ⛔ Le clic ne faisait donc RIEN : ni bond, ni rayon, ni étagère. Seul le
     doigt (ou la molette) choisissait encore.
     ⭐ LA LEÇON N'EST PAS « il manquait une fonction », c'est QU'UN MESSAGE DE
     COMMIT AFFIRMAIT LA SURVIE D'UN ORGANE QUE SON PROPRE DIFF SUPPRIMAIT, et
     que rien dans le dépôt ne pouvait le contredire — aucun test ne CLIQUAIT un
     cran, et aucun test ne lisait les appels de `ui/`. Les deux gardes sont
     posés depuis (`tests/viseur-tambour.test.mjs`).

     ⛔ ET RIEN NE GLISSE PLUS AUJOURD'HUI, il faut le dire plutôt que le
     laisser deviner. Les 170 ms `easeOutCubic` sont parties avec la fonction ;
     `scroll-behavior: smooth` a été retiré de `.roue-piste` le 24/08 EN
     ÉCHANGE de ces 170 ms. Le seul organe qui amène encore la piste à une
     position est `sauter` — et c'est déjà par lui que `reposer` pose la roue
     sur le cran courant. `viser` le rejoint : un seul chemin, pas deux.
     ⏳ CE QUI RESTE À TRANCHER, ET C'EST À ERIC : le cran se pose donc
     INSTANTANÉMENT sous le viseur au lieu de s'y rendre en 170 ms. La cote
     `GLISSE_MS` (170) est gardée juste au-dessus, inemployée, parce qu'elle
     est la recette d'Archi 25 ; le corps de `glisserVers` est dans
     l'historique (`git show de88997^:ui/builder/equipment-step.mjs`). */

  /** Reposer la roue après un remplissage : les enfants sont neufs, l'ancien
   *  `dernier` désigne un nœud mort, et la position doit revenir sur le tour du
   *  milieu — sinon le PREMIER geste déclencherait un bond de recouture au lieu
   *  d'un défilement.
   *  ⚠️ TOUT LE GESTE EST PROGRAMMATIQUE, y compris quand il n'y a rien à
   *  sauter (une roue à un ou deux crans) : sans ça, remplir une étagère
   *  ressemblerait à un geste et rearmerait l'attente en boucle. */
  function reposer() {
    dernier = -1;
    /* 🔴 LA FENÊTRE PROGRAMMATIQUE S'OUVRE ICI, PAS À LA PROCHAINE IMAGE.
       Le remplissage vient de remplacer les crans, et ce remplacement peut
       émettre un `scroll` AVANT que l'image demandée ne s'exécute. Non marqué,
       ce `scroll` ressemble à un geste : depuis que `quandBouge` écoute
       l'événement lui-même, il rearmerait l'attente en boucle — c'est
       exactement le risque que le commentaire d'à côté nommait déjà. */
    programmatique += 1;
    demanderImage(() => programmatiquement(() => {
      /* ⭐ « Le premier est celui qui s'ouvre » — règle d'Eric au banc. La roue
         ne se pose donc pas au hasard du tour du milieu : elle se pose sur le
         cran COURANT, qui vaut 0 tant que rien n'a été choisi. C'est aussi ce
         qui restitue sa position après un `refresh()` de la coquille. */
      const cible = positionDe(rangCourant());
      if (cible !== null) sauter(cible);
      juger();
      demanderImage(() => { programmatique -= 1; });
    }));
  }

  /** Amener UN cran donné sous le viseur — le clic sur un cran.
   *  ⭐ « Se poser sur un cran EST le choix » : le clic ne choisit pas
   *  directement, il AMÈNE le cran sous le viseur, et c'est le viseur qui
   *  choisit. Un clic qui poserait le choix sans bouger la roue ferait deux
   *  chemins pour un seul geste, et ils divergeraient. */
  /* 🔴 VISER, C'EST CENTRER — corrigé le 2026-08-23, troisième endroit de la
     même faute. L'ancienne écriture (`noeud.offsetLeft - base - p`) plaçait le
     cran « un pas après le bord gauche », ce qui n'est le centre que si le
     champ vaut exactement trois pas ET si le pas n'est pas arrondi. Deux
     conditions, dont aucune n'est garantie : d'où un cran qui se posait à côté
     de son viseur. */
  function viser(noeud) {
    const cible = centreDe(noeud);
    if (cible === null) return;
    /* ⭐ LE MÊME ORGANE QUE `reposer` : `sauter` est le seul qui amène la piste
       à une position, et il y atterrit EXACTEMENT sur un point d'aimantation
       (`behavior: "instant"` + la couture). Deux mouvements différents pour un
       même acte — poser la roue, viser un cran — divergeraient au premier
       réglage. */
    if (typeof quandBouge === "function") quandBouge();
    sauter(cible);
  }

  reposer();
  return { reposer, viser };
}

/* ══ LES FABRIQUES DE NŒUDS ══════════════════════════════════════════════ */

/** UN CRAN — le même fabricant pour les deux roues, et c'est délibéré : ce qui
 *  doit différer est le NIVEAU (un attribut sur la roue), pas le balisage.
 *  Deux fabricants auraient laissé les deux roues diverger par distraction.
 *  ⚠️ `aria-current` et pas `aria-pressed` : un cran n'est pas une bascule,
 *  c'est « celui-ci est le courant ». Même geste que `.equipment-cat`. */
function faireCran(libelle, rang, courant, onClic) {
  const cran = document.createElement("button");
  cran.type = "button";
  cran.className = "roue-cran";
  cran.dataset.rang = String(rang);
  cran.dataset.vise = "false";
  /* 🔴 DEUX RÔLES, DEUX ATTRIBUTS — DETTE SOLDÉE (lot 94 → lot 95). Le cran
     courant est RÉPÉTÉ dans la piste : 9 copies sur la roue A, 6 sur la B.
     `aria-current` était posé sur CHACUNE, et un lecteur d'écran annonçait
     donc NEUF FOIS « courant ». ⛔ Retirer l'attribut des copies aurait cassé
     le visuel : c'est lui que le CSS coiffait.
     ➡️ Le VISUEL passe sur `data-courant` (toutes les copies, c'est ce que
     l'œil doit voir sur une roue qui tourne) et l'ANNONCE reste sur
     `aria-current`, posée sur UNE SEULE copie par `annoncerCourant`. */
  cran.dataset.courant = courant ? "true" : "false";
  cran.textContent = libelle;
  /* ⛔ LE NŒUD, PAS L'ÉVÉNEMENT — payé le 24/08 : les appelants écrivent
     `(noeud) => viser(noeud)`, et `centreDe(Event)` rendait null en silence.
     Le CLIC d'un cran ne faisait RIEN depuis la refonte du glissement — au
     doigt on glisse, personne ne cliquait, et aucun garde ne cliquait non
     plus. Le parcours headless du pipeline l'a dit le premier. */
  cran.addEventListener("click", () => onClic(cran));
  return cran;
}

/** N'annonce le cran courant QU'UNE FOIS, sur la première de ses copies.
 *  ⚠️ `aria-current="false"` n'est pas retiré des autres : l'attribut absent
 *  et l'attribut à `false` disent la même chose aux lecteurs d'écran, mais
 *  le garder rend la mesure lisible — on voit qu'on a répondu, pas qu'on a
 *  oublié. Une absence n'est jamais une réponse, ici non plus. */
export function annoncerCourant(piste) {
  let annonce = false;
  for (const enfant of piste.children) {
    const estCourant = enfant.dataset && enfant.dataset.courant === "true";
    const premier = estCourant && !annonce;
    if (premier) annonce = true;
    if (enfant.setAttribute) enfant.setAttribute("aria-current", premier ? "true" : "false");
  }
}

/** UN MARQUEUR D'ATTENTE — ni bouton, ni cible : une bande qui tourne invite à
 *  choisir, une bande figée dit qu'il n'y a rien à choisir.
 *  ⚠️ `aria-hidden` : un lecteur d'écran n'a rien à faire de trois glyphes
 *  décoratifs, et les annoncer serait pire que le silence. */
function faireMarqueur(symbole, className) {
  const marqueur = el("span", className);
  marqueur.textContent = symbole;
  marqueur.setAttribute("aria-hidden", "true");
  return marqueur;
}

/** UNE CASE DE LA GRILLE — le jeton seul, et le STANDARD DU GLISSER s'y
 *  applique enfin en entier (croquis 23/08, vault §2) :
 *      tap → B1, la fiche · glisser sur une cible → l'acte de la cible ·
 *      glisser à vide → RIEN.
 *  ⛔ Le clic n'ajoute PLUS de ligne : c'était l'action d'attente d'avant B1
 *  (le commentaire d'alors le disait — « B1 n'existe pas »). B1 existe.
 *  📌 Le jeton porte son id en `data-ref-id` ; la résolution id → item vit
 *  dans `itemsDeLaPage`, remplie par `remplirGrille` — une seule écriture. */
const itemsDeLaPage = new Map();
function faireCase(item) {
  const nom = recordLabel(item.view) || item.view.id;
  const case_ = el("div", "grille-case");

  const jeton = document.createElement("button");
  jeton.type = "button";
  jeton.className = "grille-jeton";
  jeton.setAttribute("aria-label", nom);
  jeton.dataset.refId = item.view.id;
  for (const enfant of contenuDeCase(item)) jeton.append(enfant);
  case_.append(jeton);
  return case_;
}

/* ⛔ PLUS DE CHEVRONS SUR LE TAMBOUR — Eric, 2026-08-24 : *« enlève les chevrons
   du haut à côté des tambours, ça fait trop moche »*. C'est la deuxième fois
   qu'il les retire (déjà le 15/08 : *« les flèches gauche et droite font moche,
   on les dégage »*) — ⭐ deux fois le même verdict à neuf jours d'écart, ce
   n'est plus une humeur.

   ⛔ ET LA SOURIS N'EST PAS PRISE AU PIÈGE, vérifié avant de couper : un cran
   est cliquable et `viser` le ramène sous le viseur (`faireCran`, plus bas).
   ⭐ L'affordance devient donc le CONTENU lui-même — on clique le mot qu'on
   veut, on ne cherche pas un bouton à côté. C'est la même langue que le reste
   de l'écran : *« y'a pas besoin d'œil, le jeton EST le contrôle »*.

   📌 LA GOUTTIÈRE RESTE, SEUL LE CHEVRON PART. `--roue-fleche-l` continue de
   réserver sa largeur dans le calcul du pas : sans elle la piste s'élargirait
   d'un coup, les trois crans passeraient à 121 px et le tambour ne tomberait
   plus sur les colonnes de la grille. ⏳ Et cette place vide est exactement
   celle où Eric posera ce qu'il trouvera de plus joli. */
function faireEtage(niveau, nom, piste) {
  const roue = el("div", "roue");
  roue.dataset.niveau = niveau;
  roue.dataset.nom = nom;
  roue.append(piste);
  return roue;
}

/* ══ LA POSITION DU TAMBOUR — DE L'ÉTAT D'ÉCRAN, PAS UN CHAMP DU PERSONNAGE ══
   🔴 ET IL FAUT LE DIRE, PARCE QUE C'EST UNE CONTRAINTE DE LA COQUILLE :
   `shell.mjs` reconstruit TOUTE la carte à chaque `refresh()`, et poser un
   objet (`addGearLine`) en déclenche un. Sans cette mémoire, le joueur qui
   ajoute une potion retrouve la roue sur « Armor », page 1 — c'est
   exactement le défaut que le banc a mesuré le 22/08 (« relevé 0/21 après
   quatre clics »), vu depuis l'autre bout.
   ⛔ CE N'EST PAS UN CHAMP DU DOCUMENT : trois valeurs qui meurent avec
   l'onglet, de la même famille que `state.equipmentCategory` dans
   `shell.mjs`. Rien ici n'atteint jamais `build.choices`.
   ⭐ `rayon: null` EST L'ÉTAT D'ATTENTE DU CROQUIS : rien n'a encore été
   choisi, donc l'aval montre ses marqueurs. */
const positionDuTambour = { rayon: null, etagere: null, page: 0 };

/**
 * LE TAMBOUR — deux roues et une grille paginée.
 * Rend DEUX nœuds séparés parce que le croquis les sépare : les roues en haut,
 * la grille en dessous. ⛔ Plus rien entre les deux : la barre de recherche que
 * l'écran R posait là a été retirée le 2026-08-23 (*« dégage search »*).
 */
function renderTambour({ query, onAction }) {
  const arbre = rayonsEtEtageres(query);
  const symboles = symbolesDAttente(LISTE_PAR_PAGE);

  const pisteA = el("div", "roue-piste");
  const pisteB = el("div", "roue-piste");
  const compte = el("span", "grille-compte");
  /* ⭐ LE COMPTE D'OBJETS DE L'ÉTAGÈRE — Eric, 2026-08-23 : *« mets le compte
     des items sous le chevron gauche »*, juste après avoir fait dégager les
     chiffres collés aux crans de la roue.
     🔴 CE N'EST DONC PAS LE MÊME GESTE QUE LE RETRAIT : le besoin du 21/08
     (« une catégorie affiche toujours son compte » — savoir ce qui attend avant
     de cliquer) est CONSERVÉ, il change de PLACE. Ce qui était du bruit sur un
     cran qui défile devient une donnée stable dans une gouttière.
     ⭐ Et il se lit en face de son jumeau : le total à gauche, la page à
     droite. Combien il y en a · où l'on est. Deux chiffres, deux gouttières,
     la même écriture. */
  const total = el("span", "grille-compte");
  const cases = el("div", "grille-cases");
  /* 🔴 UNE SEULE PAGE N'A PAS DE FLÈCHES — Eric, 2026-08-26 : *« quand il y a 3
     tokens, on n'affiche que 3 tokens, pas besoin de flèches »*.
     ⭐ CE N'EST PAS UNE NOUVEAUTÉ, C'EST UNE GÉNÉRALISATION : `glisser.mjs` le
     fait depuis le lot A, et sa note disait mot pour mot *« un mot d'Eric le
     renverse »*. Le mot est venu, et il CONFIRME — donc la règle cesse d'être
     le choix prudent d'un lot pour devenir celle du site.
     ⛔ ET ÉQUIPEMENT NE POUVAIT PAS COPIER LE GESTE DE `glisser.mjs`, qui est
     de ne PAS créer les gouttières : ici la grille est bâtie UNE fois et
     `remplirGrille()` la recharge à chaque cran du tambour — l'étagère change
     sous le même DOM, donc le nombre de pages aussi. Ce qui se décide au
     montage ne peut pas suivre. On publie donc le compte à chaque remplissage
     et la feuille décale : **le JS compte, la feuille cache** — la consigne est
     déjà écrite vingt lignes plus bas pour la dernière rangée.
     ⚠️ « 1 » AU DÉPART, PAS « 0 » NI RIEN : tant qu'aucune étagère n'est
     chargée, la grille montre des dos de cartes — deux flèches mortes au-dessus
     d'une attente seraient le pire moment pour les afficher. */
  /* ⚠️ ET LA RANGÉE NAÎT ICI, PAS EN BAS : c'est `remplirGrille()` qui la
     recompose à chaque cran du tambour, et une `const` déclarée après la
     fonction qui la lit serait dans sa zone morte — l'écran planterait au
     premier remplissage. Elle est simplement déclarée où on s'en sert. */
  const gaucheG = el("div", "grille-gouttiere");
  gaucheG.append(button("‹", "grille-fleche", () => tournerPage(-1), "Previous page"), total);
  const droiteG = el("div", "grille-gouttiere");
  droiteG.append(button("›", "grille-fleche", () => tournerPage(1), "Next page"), compte);
  const rang = el("div", "grille-rang");

  let rayonId = positionDuTambour.rayon;
  let etagereId = positionDuTambour.etagere;
  let page = positionDuTambour.page;
  /* Vrai tant que le joueur n'a rien touché : c'est l'état de départ du
     croquis — rayons remplis, étagères ☆ ☉ ☾, grille ☆ ☉ ☾. */
  let vierge = positionDuTambour.rayon === null;
  let minuteur = 0;
  let roueA = null;
  let roueB = null;

  const rayonCourant = () => arbre.find((r) => r.id === rayonId) || arbre[0] || null;
  const etageresCourantes = () => (rayonCourant() ? rayonCourant().etageres : []);
  const etagereCourante = () => etageresCourantes().find((e) => e.id === etagereId) || etageresCourantes()[0] || null;

  /* ── LE COMPTE D'IMMOBILITÉ ────────────────────────────────────────────
     Il mesure L'IMMOBILITÉ, pas le temps : chaque geste le réarme. Et il ne
     s'arme QUE sur un geste — nos écritures de `scrollLeft` sont marquées
     (voir `programmatiquement`), sans quoi l'aval se révélerait tout seul une
     seconde après le chargement. */
  function armer(faire) {
    clearTimeout(minuteur);
    minuteur = setTimeout(faire, ATTENTE_MS);
  }

  function marquerCourant(piste, rang) {
    for (const enfant of piste.children) {
      /* Le visuel sur TOUTES les copies… */
      enfant.dataset.courant = String(Number(enfant.dataset.rang) === rang);
    }
    /* …et l'annonce sur une seule. */
    annoncerCourant(piste);
  }

  /* ── L'ATTENTE ─────────────────────────────────────────────────────────
     ⛔ ON NE DÉMONTE PAS LA PISTE : on remplace son contenu. Démonter mettrait
     `scrollWidth` à zéro, et la roue perdrait sa couture au moment précis où
     elle en a besoin. L'attribut coupe l'aimantation, la perspective et les
     `pointer-events` — une bande figée dit qu'il n'y a rien à choisir.

     🔴 ET LES DEUX SONT IDEMPOTENTES, PARCE QUE LEUR APPELANT A CHANGÉ. Depuis
     que l'attente s'arme sur l'ÉVÉNEMENT de défilement, elles sont appelées à
     chaque image d'un geste — soixante fois par seconde. Reconstruire les
     quinze marqueurs à chaque fois, c'est soixante `swapContent` pour un
     écran qui ne change pas : un mur qu'on repeint pendant qu'on le regarde.
     Sortir tôt quand on est DÉJÀ en attente rend le geste gratuit. */
  function attendreB() {
    if (pisteB.dataset.attente === "oui") return;
    pisteB.dataset.attente = "oui";
    swapContent(pisteB, symboles.slice(0, 3).map((s) => faireMarqueur(s, "roue-cran roue-marqueur")));
  }
  function attendreGrille() {
    /* ⚠️ L'ATTENTE COMPOSE LA RANGÉE ELLE AUSSI, et l'oublier a fait
       DISPARAÎTRE LA GRILLE ENTIÈRE au montage — attrapé par le test 16, dont
       le témoin est *« la grille est bien montée »*. Depuis que la rangée se
       recompose au lieu de se cacher, elle naît VIDE : le seul chemin du
       démarrage (`if (vierge) { attendreB(); attendreGrille(); }`) ne passe pas
       par `remplirGrille()`, donc plus personne n'y mettait les cases.
       ⛔ ET L'ATTENTE GARDE SES DEUX GOUTTIÈRES, contrairement à ce que j'avais
       écrit d'abord. Mon raisonnement — *« rien n'est chargé, donc aucune page
       à tourner »* — était cohérent et il était HORS SUJET : Eric a parlé des
       listes COURTES (*« quand il y a 3 tokens »*), pas de l'écran qui charge.
       ⭐ Et trois tests ratifiés disent que cet état porte ses gouttières, dont
       le test 11 qui le nomme *« l'état de départ du CROQUIS »*. Un croquis
       d'Eric prime sur ma déduction : étendre sa consigne à un état dont il n'a
       rien dit, ce serait décider à sa place. */
    swapContent(rang, [gaucheG, cases, droiteG]);
    if (cases.dataset.attente === "oui") return;
    cases.dataset.attente = "oui";
    /* 🔴 LE DOS DE CARTE DE TAROT REMPLACE LES ☆ ☉ ☾ — Eric, 2026-08-23 :
       *« mets le dos de carte de tarot à la place des étoiles sur les items au
       début »*, puis *« quart de tour de la carte bien sûr »*.
       ⭐ ET C'EST PLUS JUSTE QUE CE QUE ÇA REMPLACE : une case en attente ne
       montre pas un symbole décoratif, elle montre UNE CARTE FACE CACHÉE — ce
       qui est exactement son état. Le joueur lit « il y a quelque chose là,
       tu ne sais pas encore quoi », sans qu'on ait à l'écrire.
       ⛔ AUCUN CARACTÈRE DERRIÈRE L'IMAGE : la case en attente est vide de
       texte, et la carte est peinte par la feuille (`.grille-marqueur`). Un
       symbole laissé dessous se devinerait en transparence et se lirait par un
       lecteur d'écran comme si l'écran disait deux choses.
       📌 LES ROUES GARDENT LEURS ☆ ☉ ☾ : l'ordre d'Eric nomme « les items ».
       Un cran de roue n'est pas une carte à retourner, c'est un nom masqué. */
    swapContent(cases, symboles.map(() => faireMarqueur("", "grille-case grille-marqueur")));
    /* ⛔ LES DEUX CHIFFRES S'ÉTEIGNENT ENSEMBLE : pendant l'attente, aucun des
       deux ne décrit ce qu'on voit. Un total qui survivrait au tiret des pages
       parlerait d'une étagère que la grille ne montre plus. */
    compte.textContent = "—";
    total.textContent = "—";
  }

  /* ── LA GRILLE ─────────────────────────────────────────────────────────
     ⛔ LE NOMBRE DE PAGES EST DÉRIVÉ, JAMAIS ÉCRIT À CÔTÉ DU COMPTE : un
     compte écrit deux fois est un compte qui finit par se contredire.
     ⭐ ET LA GRILLE NE TOURNE PAS : ni perspective, ni aimantation, ni
     `animation-timeline`. Deux pièces différentes, deux mécaniques
     différentes, et c'est voulu. */
  function remplirGrille() {
    const etagere = etagereCourante();
    if (!etagere) { attendreGrille(); return; }
    /* ⭐ TOUTE L'ARITHMÉTIQUE EST DEHORS (`pageDeListe`, au socle) — ce qui reste ici est
       du rendu, et rien d'autre. */
    const vue = pageDeListe(etagere.objets, page);
    page = vue.page;
    cases.dataset.attente = "non";
    /* ⭐ LA PAGE COURANTE EST LA LISTE DE B1 (« un x/x permet de passer d'un
       objet au suivant sans revenir à R ») — on la publie pour le pilote. */
    itemsDeLaPage.clear();
    for (const item of vue.objets) itemsDeLaPage.set(item.view.id, item);
    swapContent(cases, vue.objets.map((item) => faireCase(item)));
    /* 🔴 LA DERNIÈRE RANGÉE SE CENTRE QUAND ELLE EST INCOMPLÈTE — Eric,
       2026-08-23 : *« règle identique sur tous les tokens, toujours centrer les
       items du bas si la ligne est incomplète »*.
       ⭐ ET C'EST DÉJÀ LA RÈGLE AILLEURS : le vivier des sorts centre ses
       rangées depuis le 19/08 (« exact taille et centrage »). Ce qui manquait,
       c'est que la grille de R, elle, est une VRAIE grille à trois colonnes —
       elle ne centrait rien, elle alignait à gauche.
       ⛔ ON DIT LE RESTE, ON NE DÉPLACE RIEN ICI : le JS compte, la feuille
       décale. Poser un style en ligne serait interdit (garde 7) et ferait vivre
       la mise en page à deux endroits.
       📌 Ça ne contredit pas « la grille ne se recompose pas » (norme des
       listes, §5) : un objet garde son RANG et sa RANGÉE. Seule la dernière
       ligne, celle qui n'a pas de voisin à droite, se recentre sur elle-même. */
    cases.dataset.reste = String(vue.objets.length % 3);
    compte.textContent = `${vue.page + 1}/${vue.pages}`;
    /* 🔴 UNE SEULE PAGE : LA RANGÉE N'EST QUE SES TOKENS — Eric, 2026-08-26 :
       *« quand il y a 3 tokens, on n'affiche que 3 tokens, pas besoin de
       flèches »*. Les deux gouttières sortent ENTIÈRES, le `1/1` avec elles.
       ⭐ CE N'EST PAS UNE NOUVEAUTÉ MAIS UNE GÉNÉRALISATION : `glisser.mjs` ne
       construit pas les siennes depuis le lot A, et sa note disait mot pour mot
       *« un mot d'Eric le renverse »*. Le mot est venu, et il CONFIRME — la
       règle cesse d'être la prudence d'un lot pour devenir celle du site.

       ⛔ ET SURTOUT PAS `display: none` : je l'avais écrit ainsi, le garde 4 de
       `ui-jetons.test.mjs` l'a refusé, et **il avait raison** — c'est le défaut
       n°3 du dépôt, *« effacer un mot au lieu de recomposer »*. Une flèche
       masquée garde sa place dans la grille et reste atteignable au clavier :
       on retirerait l'image du problème en laissant le problème.
       ⭐⭐ LE GARDE ET ERIC DISENT LA MÊME CHOSE : *« on n'affiche que 3
       tokens »*, c'est-à-dire que la rangée EST ses trois tokens, pas une
       rangée à cinq places dont deux se taisent. On recompose.
       ⚠️ Par `swapContent` et rien d'autre : `removeChild`/`replaceChildren`
       sont sur la liste noire de `socle.test.mjs`, et `socle.mjs` est le seul
       remplaçant du dépôt (il préserve au passage la position de défilement).
       Les trois nœuds sont les MÊMES d'un appel à l'autre — on les re-parente,
       on ne les reconstruit pas : les écouteurs des flèches survivent. */
    swapContent(rang, vue.pages > 1 ? [gaucheG, cases, droiteG] : [cases]);
    /* ⛔ LE TOTAL EST CELUI DE L'ÉTAGÈRE, PAS DE LA PAGE : c'est ce qui attend
       le joueur, pas ce qu'il a sous les yeux. Et il vient de la MÊME source
       que les cases (`etagere.objets`) — un compte calculé à côté finirait par
       contredire ce que la grille montre. */
    total.textContent = String(etagere.objets.length);
    if (!vierge) positionDuTambour.page = page;
  }

  function tournerPage(sens) {
    if (!etagereCourante() || vierge) return;
    page += sens;
    remplirGrille();
  }

  /* ── LES DEUX ROUES ────────────────────────────────────────────────────
     ⭐ AUCUN DE CES GESTES NE PASSE PAR `onAction`, ET C'EST LE CŒUR DU LOT :
     `shell.mjs` répond à toute action par un `refresh()` qui reconstruit la
     carte entière. Un cran franchi qui dispatcherait ferait donc démonter la
     roue AU MILIEU DU GESTE. Le tambour se met à jour lui-même, par
     `swapContent`, et ne parle à la coquille que pour les deux actes du
     joueur : poser un objet, et ouvrir son texte. */
  function remplirB() {
    const liste = etageresCourantes();
    if (liste.length === 0) { attendreB(); return; }
    const choisie = etagereCourante();
    etagereId = choisie ? choisie.id : null;
    if (!vierge) positionDuTambour.etagere = etagereId;
    pisteB.dataset.attente = "non";
    /* ⛔ SOUS TROIS CRANS, PAS DE ROUE — et le cas est RÉEL : « Gear » et
       « Armor » n'ont qu'une étagère. Une piste droite ne peut pas amener son
       unique cran au milieu toute seule : la feuille lui pose une CALE d'un
       pas de chaque côté (`data-court`), et `indexAuViseur` la lit au lieu de
       la supposer. C'est la cale d'un tiers que le banc gardait, et il ne faut
       pas la jeter avec la roue de C. */
    pisteB.dataset.court = liste.length < 3 ? "oui" : "non";
    swapContent(pisteB, troisTours(liste, (etagere) => faireCran(
      etagere.label, liste.indexOf(etagere), etagere.id === etagereId,
      (noeud) => roueB.viser(noeud)
    )));
    annoncerCourant(pisteB);
    roueB.reposer();
  }

  /* ── CE QUE FAIT UN MOUVEMENT, ET C'EST LA PHRASE D'ERIC MOT POUR MOT ────
     *« dès que la roue du haut bouge, tout ce qui est en dessous cesse
     d'afficher un choix »* — et ne le retrouve qu'après une demi-seconde
     d'immobilité.
     ⭐ CES DEUX-LÀ NE LISENT NI LE VISEUR NI LE RANG : ils ne savent que « ça
     bouge », qui est la seule chose vraie au premier pixel. Le RANG, lui,
     arrive plus tard par `quandCran` — une image plus tard au mieux, un cran
     plus tard au pire, et c'est précisément ce retard qui faisait le défaut
     du 23/08.
     ⚠️ `vierge` TOMBE ICI AUSSI. Un geste réel qui n'aurait pas encore
     franchi de cran laissait le drapeau levé, et l'aval restait figé sur ses
     marqueurs sans jamais rien remplir — l'autre moitié de ce qu'Eric a vu
     (« la 2ᵉ reste inactive »). */
  function bougeRayon() {
    vierge = false;
    attendreB();
    attendreGrille();
    armer(() => { remplirB(); remplirGrille(); });
  }

  function bougeEtagere() {
    vierge = false;
    attendreGrille();
    armer(remplirGrille);
  }

  function quandRayon(rang, programmatique) {
    if (!programmatique) vierge = false;
    const rayon = arbre[rang];
    if (!rayon) return;
    if (rayon.id !== rayonId) {
      rayonId = rayon.id;
      /* ⏳ CHOIX PAR DÉFAUT ASSUMÉ — CHANGER DE RAYON REPART SUR LA PREMIÈRE
         ÉTAGÈRE (le mode « A » du banc : le bas OUBLIE). Le mode « B » — chaque
         rayon garde la sienne — n'a jamais été tranché au doigt ; il tient en
         une carte `rayon → étagère` ici. */
      etagereId = null;
      page = 0;
    }
    if (!vierge) { positionDuTambour.rayon = rayonId; positionDuTambour.etagere = etagereId; }
    marquerCourant(pisteA, rang);
    /* L'état de départ du croquis : tant que rien n'a été touché, l'aval reste
       en marqueurs — même quand notre propre placement traverse un cran. */
    if (vierge) { attendreB(); attendreGrille(); return; }
    if (programmatique) { remplirB(); remplirGrille(); return; }
    attendreB();
    attendreGrille();
    armer(() => { remplirB(); remplirGrille(); });
  }

  function quandEtagere(rang, programmatique) {
    if (!programmatique) vierge = false;
    const etagere = etageresCourantes()[rang];
    if (!etagere) return;
    if (etagere.id !== etagereId) {
      etagereId = etagere.id;
      page = 0;
      if (!vierge) positionDuTambour.etagere = etagereId;
    }
    marquerCourant(pisteB, rang);
    if (vierge) { attendreGrille(); return; }
    if (programmatique) { remplirGrille(); return; }
    attendreGrille();
    armer(remplirGrille);
  }

  /* ── LE MONTAGE ────────────────────────────────────────────────────────
     La roue des rayons est TOUJOURS remplie — c'est la ligne du haut du
     croquis. Ce sont l'étagère et la grille qui attendent. */
  pisteA.dataset.court = arbre.length < 3 ? "oui" : "non";
  swapContent(pisteA, troisTours(arbre, (rayon) => faireCran(
    rayon.label, arbre.indexOf(rayon), rayon.id === rayonId,
    (noeud) => roueA.viser(noeud)
  )));
  annoncerCourant(pisteA);
  roueA = monterRoue(pisteA, {
    longueur: () => arbre.length,
    rangCourant: () => Math.max(0, arbre.findIndex((r) => r.id === rayonId)),
    quandCran: quandRayon,
    quandBouge: bougeRayon
  });
  roueB = monterRoue(pisteB, {
    longueur: () => etageresCourantes().length,
    rangCourant: () => Math.max(0, etageresCourantes().findIndex((e) => e.id === etagereId)),
    quandCran: quandEtagere,
    quandBouge: bougeEtagere
  });

  if (vierge) { attendreB(); attendreGrille(); } else { remplirB(); remplirGrille(); }

  const roues = el("section", "equipment-drum");
  roues.append(faireEtage("rayons", "aisle", pisteA));
  roues.append(faireEtage("etageres", "shelf", pisteB));
  /* ⛔ LA LIGNE « Wheel depth » N'EST PLUS DANS L'ÉCRAN — Eric, 2026-08-23, en
     la montrant pour la troisième fois : *« enlève ça »*. Elle disait §6 (« ce
     que le navigateur a vraiment accordé, dit plutôt que deviné ») et elle
     avait raison de le dire — mais pas ICI : c'est de l'anglais de
     développeur dans un écran que le joueur regarde, et elle pesait 15,5 px
     dans une carte de 440.
     ⭐ LE BESOIN SURVIT, LA LIGNE DÉMÉNAGE : `profondeurAccordee` est exportée,
     et c'est le BANC (`ecran-r.html`, son relevé) qui la lit. Eric garde sa
     réponse — il la lit là où l'on regarde l'écran, pas dedans. */

  /* ── LA GRILLE ET SES DEUX GOUTTIÈRES ──────────────────────────
     🔴 LA BARRE HORIZONTALE A DISPARU — Eric, 2026-08-23 : *« les flèches peuvent
     être à droite et à gauche des tokens ; le titre n'a pas lieu d'être, il est
     porté par le rouleau »*. Le nom de l'étagère vivait à DEUX endroits — sur le
     cran de la roue et dans cette barre — et un nom écrit deux fois est un nom
     qui finit par diverger. Il ne reste que celui du rouleau.
     ⚠️ MAIS LE COMPTE `x/x` RESTE : Eric n'a retiré QUE le titre. Il compte des
     PAGES, donc il vit avec ce qui tourne les pages — dans la gouttière, sous la
     flèche « suivante », celle qui le fait changer. ⭐ ET IL NE COÛTE AUCUNE
     HAUTEUR : la gouttière fait déjà toute la hauteur de la grille, la flèche
     n'en occupe qu'un `--touch`.
     ⚠️ LA CIBLE TACTILE DES FLÈCHES NE RÉTRÉCIT PAS. Une flèche de bord reste un
     bouton qu'un pouce doit atteindre : la feuille lui garde son `--touch`. Une
     flèche décorative qui rate le doigt est pire qu'une flèche absente. */
  /* ⚠️ LES GOUTTIÈRES SE CONSTRUISENT ICI MAIS N'ENTRENT PAS D'OFFICE : c'est
     `remplirGrille()` qui décide, à chaque étagère, si la rangée en a besoin
     (voir la note qu'il porte). Tant qu'aucune étagère n'est chargée la grille
     montre des dos de cartes — deux flèches mortes au-dessus d'une attente
     seraient le pire moment pour les afficher. */
  const grille = el("section", "equipment-grille");
  grille.append(rang);

  return { roues, grille };
}




/* ══ B8.3 — CHAQUE ITEM TIENT SUR DEUX LIGNES ════════════════════════════
   « Ligne 1 : le titre. Ligne 2 : prix et poids. `+` et `👁` à droite, et ils
   occupent les deux lignes en hauteur. »


/** LE TEXTE ASSOCIÉ À UN RECORD — recopié, jamais résumé. Les genres n'ont
 *  pas les mêmes champs : une arme porte ses dégâts et ses propriétés, une
 *  armure sa CA et son malus de discrétion (mesuré au §B8.0). On lit ce qui
 *  existe, dans l'ordre où le record le porte.
 *
 *  🔴 ET DEPUIS QUE `item` EST AU CATALOGUE (lot 84), CET ŒIL MONTRE UN DÉFAUT
 *  D'EXTRACTION QU'IL NE FAUT PAS PRENDRE POUR LE SIEN. Cinq objets magiques
 *  anglais n'existent pas dans le corpus : leur texte a été AVALÉ par le record
 *  qui les précède alphabétiquement. Vérifié ligne à ligne le 2026-08-23 —
 *  les cinq absents (Dancing Sword, Frost Brand, Luck Blade, Sword of Life
 *  Stealing, Sword of Wounding) et les cinq qui les portent (Dagger of Venom
 *  1437 car., Folding Boat 1449, Lantern of Revealing 1120, Sun Blade 1313,
 *  Sword of Sharpness 710). L'œil posé sur « Dagger of Venom » montre donc
 *  DEUX objets dans un seul, et rien ne rougit.
 *  ⛔ ON NE RÉPARE RIEN ICI : c'est `fh-srd`, un autre dépôt, un autre lot —
 *  qui connaît déjà le défaut et l'a gravé (garde `POLLUTED_BY_EXTRACTION`,
 *  `src/correspond.py`, et son test d'acceptation). Ce commentaire existe pour
 *  qu'on ne cherche pas le défaut ici. */
export function recordProse(view, recette = null) {
  const data = (view && view.record && view.record.data) || {};
  /* ⭐ LOT 266 — LA RECETTE D'UN OBJET CRAFTÉ ENTRE DANS SON TEXTE. 🔴 Eric, 25/09 :
     *« le texte de la breastplate +1 dit AC 14, pas bon ça »* — la fiche recopiait la
     BASE. Le +N s'ajoute à la CA de base, la ligne `Bonus` dit ce qu'il fait, et
     chaque pouvoir apporte son propre texte. ⛔ Rien n'est recopié dans la fiche : le
     texte se recompose, comme le nom. */
  const plus = recette ? lireLeBonus(recette.bonus) : null;
  const lignes = [];
  if (typeof data.description === "string" && data.description) lignes.push(data.description);
  for (const [label, valeur] of [
    ["Damage", data.damage],
    ["Mastery", data.mastery],
    ["Properties", Array.isArray(data.properties) ? data.properties.join(", ") : data.properties],
    ["AC", Number.isInteger(data.ac_base) && plus ? data.ac_base + plus : data.ac_base],
    ["Strength", data.strength],
    ["Stealth", data.stealth_disadvantage ? "disadvantage" : null]
  ]) {
    if (valeur !== undefined && valeur !== null && valeur !== "") lignes.push(`${label}: ${valeur}`);
  }
  if (plus) {
    /* un bouclier n'a pas de CA de base (`ac_bonus`) : le +N ne s'y voit pas plus haut */
    const inclus = Number.isInteger(data.ac_base) ? " (included above)" : "";
    lignes.push(recette.kind === "armor" ? `Bonus: +${plus} to AC${inclus}`
      : `Bonus: +${plus} to attack and damage rolls`);
  }
  for (const p of (recette && recette.pouvoirs) || []) {
    const d = (p && p.data) || {};
    const nom = (p && p.name) || d.name;
    if (nom) lignes.push(typeof d.description === "string" && d.description ? `${nom}. ${d.description}` : nom);
  }
  /* ⭐ LOT 277 — la VARIANTE dit laquelle des formes du texte est la sienne, et sa rareté. */
  if (recette && typeof recette.variante === "string" && recette.variante) {
    const v = variantesDe(data).find((x) => x.mot === recette.variante);
    lignes.push(`Variant: ${recette.variante}${v ? ` (${v.rarete})` : ""}`);
  }
  if (recette && typeof recette.note === "string" && recette.note) lignes.push(recette.note);
  return lignes.length > 0 ? lignes.join("\n") : "No further detail on this record.";
}

/* ══ LE SAC — la liste des lignes déjà posées, plus le chercheur ═════════ */
function renderGearBlock({ query, onAction }) {
  const wrap = el("section", "equipment-gear-block");

  /* ══ ⛔ IL N'Y A PLUS RIEN SOUS LA CARTE — Eric, 2026-08-23 ══════════════
     *« tout ce qu'il y a en dessous dégage »*, dit en regardant l'écran une
     fois la carte montée. Ce qui vivait là et qui part :
       · le titre `Gear` .......... R n'a pas de titre, le rouleau le porte
       · `Armor Class: N` ......... c'est une lecture de `B3`, le dressing
       · ce qu'on possède déjà .... `B3` aussi, derrière le bouton `GEAR`
       · la barre de recherche .... *« dégage search »*, dit deux fois
       · la bourse ................ `B1`/`B2` la portent, et la barre
                                    flottante l'affiche déjà en haut
     ⭐ ET C'EST LE CROQUIS À LA LETTRE : R montre le tambour, les jetons, les
     collecteurs et quatre boutons. Rien d'autre. Un écran qui porte en plus ce
     que trois autres écrans porteront est un écran qui ment sur ce qu'il est.
     ⚠️ CE QUE ÇA COÛTE, ET IL FAUT LE DIRE : tant que `B2` et `B3` ne sont pas
     construits, l'équipement déjà possédé n'est plus atteignable depuis cette
     étape. C'est un choix d'Eric, pas un oubli — et les organes qui le
     rendaient sont dans l'historique, prêts à déménager. */

  /* ══ LA CARTE DE L'ÉCRAN R ENTRE DANS LE BUILDER ═══════════════════════
     Eric, 2026-08-23 : *« mets ça dans le vrai builder »*. Le tambour et la
     grille ne sont plus posés à plat dans le bloc : ils sont les deux organes
     que la CARTE reçoit, avec ses collecteurs et ses boutons. C'est le même
     nœud que le banc `ecran-r.html` montre — la même fonction, pas une copie.
     ⛔ ET LA RECHERCHE N'EST PLUS ENTRE LES DEUX : *« dégage search »*. */
  const { roues, grille } = renderTambour({ query, onAction });
  const carte = construireLaCarteR({ tambour: roues, grille });
  wrap.append(carte.noeud);
  return wrap;
}


/**
 * @param {object} ctx
 * @param {object} [ctx.document] le document brut du dernier `rebuild()` — seule source de `class`, `gear[N]`, `currency.*`
 * @param {object} [ctx.resolved] la fiche dérivée — `resolved.ac`, `resolved.gear`, `resolved.currency`, jamais recalculés
 * @param {Function} ctx.query    `layers.verbs.query`
 * @param {(action:{kind:string, [key:string]:*}) => void} onAction  `set`/`clear` ordinaires, plus les trois gestes
 *   composites de `shell.mjs` : `addGearLine` ({ref,quantity,equipped}), `removeGearLine` ({index}), `addStartingPurse` ()
 */
/* ══ B8.1 — LE BANDEAU DU HAUT, ET IL FLOTTE ════════════════════════════
   « Le budget en pièces, SANS TROP PRENDRE DE PLACE » · « une molette
   horizontale qui catégorise les équipements » · « un point d'interrogation
   à côté du budget » qui rappelle « What you already have ».

   ⏳ LA LOUPE — Eric l'a formulée AU CONDITIONNEL : « SI on a la place pour
   poser une loupe dans les flottants pour invoquer la barre de recherche, ce
   serait pas mal ». C'est donc une PRÉFÉRENCE, pas une exigence — et la
   place existe, mesurée : le bandeau tient sur deux lignes de 44 px comme
   celui de Compétences. La loupe est là, et elle évite une CINQUIÈME barre
   fixe (le point que B7.6 signalait). */

export const EQUIPMENT_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "weapon", label: "Weapons" },
  { id: "armor", label: "Armor" },
  { id: "gear", label: "Gear" }
];



/**
 * @param {object} ctx
 * @param {object} ctx.document   le document brut
 * @param {object} ctx.resolved   la fiche dérivée — l'AC et la bourse
 * @param {Function} ctx.query    `layers.verbs.query`
 * @param {string} [ctx.category] le filtre courant de la molette
 * @param {boolean} [ctx.search]  la barre de recherche est-elle invoquée
 */
/* ══ LE PILOTE DE L'ÉTAPE — SEPT ÉCRANS, UNE SEULE VUE À LA FOIS ════════════
   Mandat d'Eric (24/08) : *« enchaîne R/B1/B2/B3/SB3.1/2/3 · INVERSE les
   positions de R et de B3 · fais le pipeline — les échanges à l'intérieur du
   personnage. Pas de Craft, pas de Companions, pas de groupe/DM. »*

       B3 (dressing) ─ Equipment → R ─ tap/TO GEAR DROP → B1
        │                │─ SHOPPING LIST → panier · CART → B2
        │─ Send → SB3.2  │─ GEAR → retour B3
        │─ Gear weight › Backpack → SB3.1 · › Storage → SB3.3 (⏳ improvisé)

   `vueEquipement` et `ficheEnCours` sont de l'ÉTAT D'ÉCRAN (même loi que la
   position du tambour) : ils survivent aux re-rendus de la coquille, jamais
   au personnage — rien d'eux n'est une donnée. */
let vueEquipement = "gear";
let ficheEnCours = null;
/* ⭐ LOT 262 — LA FICHE X5 OUVERTE : le plan d'où l'on vient et l'état des choix.
   ⛔ L'écran ne garde rien, il redessine : c'est ici que vit l'état, comme pour X2.
   `{ plan: ref, choix: { base, bonus, pouvoirs, qte, status, destination }, retour }` */
let ficheX5 = null;
/* ⭐ LOT 270 — l'aperçu du jeton de X5 : `{ nom, base, bonus, pouvoirs, cote, status }`. */
let apercuX5 = null;
let piloteEquipement = null;
/* LOT 212 — l'état du collecteur d'envoi : les index `gear[N]` retenus, et la
   destination choisie au dropdown. De l'ÉTAT D'ÉCRAN, comme la vue : il
   survit au `refresh()` de la coquille, jamais au personnage — Send le vide. */
const collecteEnvoi = new Set();
/* ⛔ L'ÉTAT D'UN POPUP VIT DANS L'ÉCRAN, PAS AU DOCUMENT : il ne se sauvegarde
   pas, il ne se partage pas, et rouvrir le chapitre le referme. Même espèce que
   `vueEquipement` — une question d'affichage, jamais une décision du personnage. */
let bourseOuverte = false;
let destinationEnvoi = "backpack";
/* LOT 213 — l'objet dont la fiche X1 est ouverte : son INDEX `gear[N]`, jamais
   une copie de la ligne. ⭐ Un index survit à un rebuild du document, une copie
   non — et la fiche montrerait alors l'état d'avant le geste qu'on vient d'y
   faire. `null` = aucune fiche ouverte.
   ⛔ ET C'EST DE L'ÉTAT D'ÉCRAN : rouvrir le chapitre referme la fiche. */
/* ⭐ LA SECTION QU'ON REGARDE est de l'ÉTAT D'ÉCRAN, comme `vueEquipement` : une
   question d'affichage, ⛔ jamais une décision du personnage. Elle ne s'écrit donc
   pas au document. */
/* 🔴 `null` VEUT DIRE « PAS ENCORE CHOISIE », ET CE N'EST PAS UN DÉTAIL : depuis
   qu'Eric a mis le party inventory EN TÊTE de la liste (19/09), un `0` faisait ouvrir
   le sac sur le commun du groupe — vide à la création. ⛔ Quatre gardes l'ont dit
   avant qu'Eric le voie : ils ouvrent le sac et n'y trouvaient plus rien.
   ⭐ Le sac s'ouvre donc sur le DÉPÔT, là où atterrit tout ce qu'on lui envoie. Et la
   position se CALCULE au premier rendu : une position écrite en dur aurait suivi le
   prochain réordonnancement de la liste sans rien dire. */
let sectionSac = null;
/* ── L'ÉTAT DE WARES (lot 218) ─────────────────────────────────────────────────
   ⛔ TROIS NOMBRES, ET PAS UN DE PLUS : le rang de la catégorie, celui de la sous-catégorie,
   et la page. ⭐ Ils sont des RANGS, jamais des identités — l'écran est un tambour, et un
   tambour désigne par position. L'identité `aisle:shelf` reste dans l'arbre, qui la porte. */
let rayonWares = 0;
let etagereWares = 0;
let pageWares = 0;
/* ⭐ LE MODE ÉDITION DE LA ROUE — Eric, 18/09 : *« le bouton pack devient sections,
   et la roue passe en mode édition »*. ⛔ État d'écran lui aussi : on ne rouvre pas
   le sac en train d'éditer ses sections. */
let editionSac = false;
/* ⭐ LE CHAMP NE S'OUVRE QUE PAR LA POIGNÉE `/` — Eric, 19/09. ⛔ État d'écran : on
   rouvre le sac en le LISANT, pas en train de le modifier. */
let renommageSac = false;
/* ⚖️ LA SECTION QU'ON DÉPLACE — croquis d'Eric, 19/09 : *« hold one section for 1,5
   second and this mode comes on »*. ⭐ `null` = personne ; sinon, la POSITION du cran
   tenu dans la liste affichée. ⛔ De l'état d'ÉCRAN, pas de document : ce qui s'écrit,
   c'est l'ORDRE (`backpack…rang`), jamais « qui est en train d'être déplacé ». */
/* 🔴 LE REPEINT DU SAC, ATTEIGNABLE DEPUIS UN GESTE QUI A COMMENCÉ AVANT LUI.
   ⛔ `peindre()` écrit dans LE NŒUD DE SON RENDU (`swapContent(section, …)`), et la
   coquille en fabrique un neuf à chaque `act`. Or le déplacement d'une section ÉCRIT à
   chaque croisement — donc, au moment du lâcher, la fermeture qu'on tient est celle
   d'AVANT, et elle repeint un nœud détaché : le mode restait allumé à l'écran alors que
   l'état était déjà retombé. Mesuré dans l'application le 19/09 au soir.
   ⭐ C'EST LA MÊME LOI QUE `NORMES` ÉNONCE POUR LA MARGE — *« un glisser qui fait
   défiler l'écran sous lui doit LIRE l'état au moment du DÉPÔT, jamais celui du rendu
   qui l'a armé »* — et elle vaut aussi pour ÉCRIRE : le repeint se relit, il ne se
   capture pas. */
let repeindreLeSac = () => {};
/* ⭐ LA PAGE QU'ON REGARDE DANS LA SECTION — état d'écran : on rouvre le sac à sa
   première page, jamais là où on l'avait laissé. ⛔ Ce qui SURVIT, c'est la place de
   chaque objet (`gear[N].place`), pas le regard qu'on porte dessus.
   ⚖️ Le RANGEMENT, lui, a quitté l'écran le 18/09 : Eric — *« oui, évidemment, le
   rangement fait partie des caracs du perso ; ça doit survivre à la session au même
   titre que les autres changements »*. Il s'écrit donc au document, par le verbe
   `rangerSection`, et il n'y a plus d'ordre d'écran du tout. */
let pageSac = 0;
let ficheX1 = null;
/* ⚖️ D'OÙ LA FICHE A ÉTÉ OUVERTE — Eric, 20/09 : *« je visite un item et je le
   referme, je ne reviens pas au point d'origine, je reviens dans gear »*.
   ⛔ LA FICHE NE DÉCIDE PAS DE SON RETOUR, elle le REÇOIT. C'est exactement ce que
   X2 fait depuis toujours (`ficheEnCours.retour`) ; X1, plus récent, nommait
   `"gear"` en dur — le calcul réemployé sans ce qui l'entoure.
   ⭐ ET C'EST `vueEquipement` LUI-MÊME, pris à l'instant du tap : aucune seconde
   vérité à tenir d'accord, juste la vue courante mise de côté avant qu'on la quitte. */
let origineX1 = "gear";
let nombreX1 = 1;
/* LOT 213 — LE MODE LECTURE de la fiche : l'œil de la marge droite retire tout ce qui
   n'est pas le texte et les quatre portes (Eric, 17/09 au soir). ⛔ C'est de l'ÉTAT
   D'ÉCRAN, comme la bourse : il ne se sauvegarde pas, et fermer la fiche le rend à
   `false` — on rouvre un objet pour le VOIR, pas pour retrouver un réglage. */
let lectureX1 = false;
/* LOT 212 — le mot que chaque vue écrit dans la 3ᵉ ligne du belt. Les
   BRANCHES écrivent ; ⛔ une fiche (X1, X2) n'écrit pas — elle garde le mot de la
   branche d'où on l'a ouverte (Eric, 16/09 : « les x ne s'inscrivent pas dans
   le belt »). `recherche` et `b2` sont des vues de Wares. */
/* ⛔ `sac` Y MANQUAIT, ET LE BELT SE TAISAIT — trouvé à l'audit du lot 214 : la 3ᵉ
   ligne de la ceinture NOMME la fenêtre ouverte, et le sac n'y avait pas de mot.
   L'écran s'ouvrait sans que rien ne dise où l'on était. ⭐ `x1` n'y est pas non
   plus, ni `x2`, mais c'est une LOI (le rang X ne s'inscrit pas dans le belt) ; ici
   c'était
   un oubli. */
const FENETRE_DE = { gear: "Gear", sac: "Backpack", sb31: "Backpack", sb33: "Backpack", r: "Wares", recherche: "Wares", b2: "Wares", sb32: "Tally" };

/** Un item de grille → la matière de X2/du panier. Le PRIX vient du record
 *  (`fabriqueDeValeur` : `data.cost` quand il existe, sinon la valeur de la
 *  rareté selon `srd:item-value`), jamais d'un tarif écrit ici. */
/* ⚠️ UNE FABRIQUE, PAS UN SECOND ARGUMENT — et c'est un piège évité, pas un style.
   Les trois appelants écrivent `.map(ficheItem)` : `Array.map` passe `(élément,
   INDEX, tableau)`. Un `ficheItem(item, valeurDe)` recevrait donc l'index à la
   place de l'organe, et `valeurDe(record)` planterait sur `3(record)` — ou pire,
   un jour, ne planterait pas. `ficheItemAvec(valeurDe)` rend la fonction à un
   seul argument que `.map` attend. */
function ficheItemAvec(valeurDe) {
  return function ficheItem(item) {
    const record = (item.view && item.view.record) || null;
    const { cout, poids, rarete, craft } = valeurDe(record);
    return {
      ref: { kind: item.kind, id: item.view.id },
      nom: recordLabel(item.view) || item.view.id,
      coutTexte: cout || "",
      cout: parseCout(cout),
      poidsTexte: poids || "",
      prose: recordProse(item.view),
      /* ⚖️ LOT 279 — la rareté à côté du prix, la note de craft en pied (Eric, 26/09) */
      rarete: rarete || "",
      noteCraft: texteDeLaNote(craft),
    };
  };
}

/** Les genres d'objets que le rangement d'Eric CONTIENT, lus dans la donnée
 *  (`shelving.of_kind`) — jamais une liste écrite à la main.
 *
 *  🔴 CETTE FONCTION EXISTE PARCE QUE LE LOT 95 A RETIRÉ SA LISTE D'UN
 *  ENDROIT ET L'A LAISSÉE DANS L'AUTRE. Le commentaire de `EQUIPMENT_RECORD_
 *  KINDS`, en tête de ce fichier, dit « plus de liste » — et `fabriquerChercheur`
 *  en gardait une, identique, cinq genres en dur, pendant que le tambour lisait
 *  la donnée. 📏 MESURÉ LE 2026-09-08 avec les 54 gemmes du lot 181 : la ligne
 *  d'équipement d'une azurite achetée affichait `fh:gem:en:azurite` — SON ID NU
 *  — au lieu de « Azurite », et la recherche ne la trouvait pas. L'objet était
 *  visible au tambour et introuvable partout ailleurs.
 *  ⭐ La leçon est celle d'`item-value` (lot 93) : une liste de genres écrite à
 *  la main ne dit jamais qu'elle est incomplète. Elle le dit d'autant moins
 *  qu'elle vit à côté d'un commentaire qui annonce sa disparition.
 *
 *  ⛔ `isGenre` filtre AVANT `query`, qui JETTE sur un genre inconnu : un
 *  rangement homebrew nommant un genre absent du contrat ne doit pas faire
 *  tomber l'écran entier. Le tri est explicite — jamais l'ordre du hasard. */
export function genresDuRangement(rangements) {
  const genres = new Set();
  for (const vue of rangements || []) {
    const data = (vue && vue.record && vue.record.data) || {};
    if (typeof data.of_kind === "string" && isGenre(data.of_kind)) genres.add(data.of_kind);
  }
  return [...genres].sort();
}

/** id → record (toutes sortes), et id de base → slot (la couche `shelving`
 *  du lot 95 : `data.slot.slot`, dix valeurs qui recopient les dix ancrages
 *  d'Eric). Une passe par rendu, jamais une recherche par ligne. */
function fabriquerChercheur(query) {
  const parId = new Map();
  const slotParBase = new Map();
  const tous = [];
  let rangements = [];
  try { rangements = query({ kind: GENRE_RANGEMENT }) || []; }
  catch { /* la couche absente n'est pas une panne : les boîtes restent vides */ }
  for (const kind of genresDuRangement(rangements)) {
    let vues = [];
    try { vues = query({ kind }); } catch { vues = []; }
    for (const v of vues) {
      parId.set(v.id, v.record || v);
      tous.push({ kind: v.kind || kind, view: v });
    }
  }
  for (const v of rangements) {
    const d = (v.record && v.record.data) || {};
    const slot = d.slot && typeof d.slot.slot === "string" ? d.slot.slot : null;
    if (d.extends && slot) slotParBase.set(d.extends, slot);
  }
  /* ⭐ LA VALEUR SE FABRIQUE AVEC LE CHERCHEUR, une passe par rendu : la pile peut
     changer (un World qu'on allume), et une table de valeurs figée au chargement
     survivrait à la pile qui l'a produite. */
  const valeurDe = fabriqueDeValeur(query);
  return {
    record: (ref) => parId.get(ref && ref.id) || null,
    slot: (ref) => slotParBase.get(ref && ref.id) || null,
    valeur: (record) => valeurDe(record),
    tous: () => tous,
  };
}

/** LES PORTÉS DANS LEURS BOÎTES — slot (donné par la couche) → boîte, via
 *  `SLOT_VERS_BOITES` (⏳ PROVISOIRE, déclaré dans `b3-disposition.mjs`, à
 *  faire ratifier par Eric). Première boîte libre de la liste du slot ; un
 *  objet sans slot va aux poches ; plus de place = la ligne reste listée par
 *  SB3.x, jamais perdue. */
function candidatesDuSlot(slot) {
  /* la règle ratifiée : les boîtes du slot, PUIS les poches — pour tous. */
  return [...((slot && SLOT_VERS_BOITES[slot]) || []), ...POCHES_DEBORD];
}
function attribuerBoites(portees, cherche) {
  const prises = new Map();
  const pose = (ligne, boite) => prises.set(boite, {
    nom: ligne.nomAffiche, qte: ligne.quantity || 1, index: ligne.index,
    equipped: ligne.equipped === true,
    /* ⭐ LOT 213 — LES DEUX AUTRES VOYANTS S'ALLUMENT ENFIN. L'écran R dessine ♥
       et 🔒 depuis le lot 212 ; il leur manquait un écrivain, et c'est la fiche
       X1. ⛔ La dette du 16/09 (*« pas de lecteur tant que X1 n'écrit pas la
       donnée »*) est donc payée ici, pas contournée. */
    attuned: ligne.attuned === true,
    locked: ligne.locked === true,
    /* ⚖️ LA DIAGONALE DE LA RECETTE — Eric, 2026-09-23. Le drapeau se DÉRIVE du
       record (`estRecette`, dans le pipeline), il ne se liste pas : une liste
       de noms serait périmée au premier ajout. ⛔ Et il vit sur la POSE, pas
       dans l'écran : le sac dessine le même jeton.
       ⭐ ET LES SEPT KITS EN SONT, depuis *« les kits d'aventuriers sont des
       blueprints aussi »* : leur record porte `contents` (les 64 éléments lus
       dans la prose du SRD), et c'est ce champ que le prédicat lit. */
    recette: estRecette(cherche.record(ligne.ref))
  });
  /* ⭐ LOT 212 — D'ABORD LA BOÎTE CHOISIE AU DOIGT (Eric : « les items peuvent se
     déplacer dans tous les sens ») : une ligne qui porte `boite` y va, si elle
     est libre ; la règle du slot ne sert qu'aux autres. */
  for (const ligne of portees) {
    if (ligne.boite && !prises.has(ligne.boite)) pose(ligne, ligne.boite);
  }
  for (const ligne of portees) {
    if (ligne.boite && prises.get(ligne.boite)?.index === ligne.index) continue;
    const libre = candidatesDuSlot(cherche.slot(ligne.ref)).find((b) => !prises.has(b));
    /* LOT 212 — la boîte porte aussi l'INDEX (le collecteur retient des lignes)
       et l'état ÉQUIPÉ (le voyant ⭕) ; LOT 213 — et les deux autres états, que la
       fiche X1 écrit maintenant. */
    if (libre) pose(ligne, libre);
  }
  return Object.fromEntries(prises);
}

export function renderEquipmentStep(ctx, onAction) {
  const query = ctx.query || (() => []);
  const act = onAction || ctx.onAction || (() => {});
  const docu = ctx.document || null;
  const section = el("section", "equipment-step");

  const bourse = currentCurrency(docu);
  /* ⭐ LES RÉPONSES DU QCM VIVENT ICI, PAS AU MODULE ET PAS AU DOCUMENT.
     · pas au document : rien ne s'écrit avant `Done` (⛔ un choix à moitié
       posé serait un kit à moitié posé) ;
     · pas au module, contrairement à `vueEquipement` : le QCM ne dure que le
       temps d'une réponse, et un état de module suivrait le joueur d'un
       personnage à l'autre. ⭐ Il survit à `peindre()`, qui est dans cette
       fermeture — et c'est tout ce dont le récapitulatif a besoin pour se
       recalculer : un clic d'option ne repasse jamais par la coquille. */
  const reponsesDuQcm = {};
  /** ⭐ LA BASCULE, UNE SEULE FOIS POUR TOUTES LES QUESTIONS DE LA CARTE — la
   *  question d'option et la question d'outil se répondent du MÊME geste :
   *  taper pose, retaper efface. ⛔ Deux bascules écrites séparément auraient
   *  divergé au premier ajout (l'une se serait mise à écrire, l'autre non), et
   *  c'est le patron de `renderPicker` et de `renderTierButtons` — jamais un
   *  second geste à apprendre.
   *  ⛔ ELLE N'ÉCRIT PAS AU DOCUMENT : elle repeint l'étape EN PLACE. `Done`
   *  reste le SEUL moment d'écriture. */
  const basculerLaReponse = (clef, valeur) => {
    if (reponsesDuQcm[clef] === valeur) delete reponsesDuQcm[clef];
    else reponsesDuQcm[clef] = valeur;
    peindre();
  };
  const cherche = fabriquerChercheur(query);
  const lignes = currentGearLines(docu).filter((l) => l.ref);
  /* ⭐ LOT 265 — LE NOM D'UNE LIGNE, UN SEUL ÉCRIVAIN. Un objet crafté se nomme par
     sa recette, et par la fonction du MOTEUR (`nomCrafte`) : l'écran et
     `resolved.gear` disent le même nom, par construction.
     🔴 ILS ÉTAIENT TROIS À NOMMER UNE LIGNE — l'écran R (`nomAffiche`), le sac
     (`enMots`) et le tri par nom — chacun par `rec.name`. Vu au navigateur : la
     Breastplate +1 craftée s'affichait « Breastplate » dans le sac. Les trois
     appellent désormais celle-ci (garde 8 de `objet-crafte.test.mjs`). */
  const nomDeLaLigne = (l) => {
    const rec = cherche.record(l.ref);
    /* ⭐ LOT 277 — une variante se nomme par le MOTEUR aussi (`nomDUneVariante`). */
    if (rec && typeof l.variante === "string" && l.variante) {
      return nomDUneVariante({ ...(rec.data || {}), name: (rec.data && rec.data.name) || rec.name }, l.variante);
    }
    const base = (rec && rec.name) || motDUnRecordAbsent(l.ref.id);
    const pouvoirs = (l.pouvoirs || []).filter(Boolean).map((p) => {
      const r = cherche.record(p);
      return (r && r.name) || motDUnRecordAbsent(p.id);
    });
    return nomCrafte({ base, bonus: l.bonus, pouvoirs });
  };
  for (const l of lignes) l.nomAffiche = nomDeLaLigne(l);
  /* ⭐ LOT 266 — LE PRIX, LE POIDS ET LE TEXTE D'UNE LIGNE, par la même porte que son
     nom. Un objet ordinaire rend ceux de son record ; un objet crafté, ceux de sa
     RECETTE (`valeurDUnObjetCrafte`, `recordProse(…, recette)`). 🔴 Sans elle, la
     fiche X1 d'une Breastplate +1 disait « AC: 14 » et le prix de la Breastplate nue. */
  const recetteDeLaLigne = (l) => estCrafte({ bonus: l.bonus, pouvoirs: (l.pouvoirs || []).filter(Boolean), variante: l.variante })
    ? { kind: l.ref && l.ref.kind, bonus: l.bonus, note: l.note, variante: l.variante || null,
        plan: l.plan ? cherche.record(l.plan) : null,
        pouvoirs: (l.pouvoirs || []).filter(Boolean).map((p) => cherche.record(p)).filter(Boolean) }
    : null;
  /* ⭐ LOT 270 — UNE RECETTE SE LIT PAR UNE SEULE PORTE, qu'elle soit POSÉE (une ligne) ou
     encore en CRÉATION (l'aperçu du jeton de X5). ⛔ Deux lectures de la même recette
     diraient deux prix. */
  const valeurDUneRecette = (rec, r) => {
    /* ⭐ LOT 277 — une variante vaut ce que vaut l'objet FINI qu'elle désigne, par l'organe
       de Wares (`fabriqueDeValeur`) : ⛔ le plan, lui, n'a pas de prix de catalogue — et une
       variante que le record ne connaît plus n'en prend pas un par défaut. */
    const fini = r && r.variante ? recordDUneVariante(rec, r.variante) : null;
    const v = cherche.valeur(fini || rec);
    if (!r) return v;
    if (r.variante) return fini ? v : { cout: null, poids: v.poids };
    /* ⭐ LOT 280 — la cote du barème SRFH donne le prix, la rareté affichée et la note de
       craft d'un objet crafté posé, comme `fabriqueDeValeur` les donne d'un objet fini. */
    const cote = coteDUnObjetCrafte({ base: rec, plan: r.plan, bonus: r.bonus, pouvoirs: r.pouvoirs });
    if (!cote || !cote.legal) return { cout: null, poids: v.poids, rarete: null, craft: null };
    return { cout: `${cote.venteUnitaire.toLocaleString("en-US")} GP`, poids: v.poids, rarete: cote.categorie,
      craft: { jours: cote.jours, cout: cote.craftUnitaire, rarete: cote.categorie } };
  };
  const proseDUneRecette = (rec, r) => recordProse({ record: rec || null }, r);
  const valeurDeLaLigne = (l) => valeurDUneRecette(cherche.record(l.ref), recetteDeLaLigne(l));
  const proseDeLaLigne = (l) => proseDUneRecette(cherche.record(l.ref), recetteDeLaLigne(l));

  /* ⭐ LES MATIÈRES DE X5, UNE PASSE PAR RENDU — des RECORDS, pas des vues :
     `craft.mjs` est strict (lot 258), et c'est ce qui a coûté la diagonale au 256. */
  /* ⭐ LOT 265 — ET LEUR RÉFÉRENCE, relevée DANS LA MÊME PASSE : `Send` pose des
     `{kind, id}` dans la fiche, et le record seul ne porte pas toujours son id. ⛔ Pas
     de seconde lecture par nom — deux lectures de la même chose divergent. */
  const refDuRecord = new Map();
  const lireRecords = (kind) => { try { return (query({ kind }) || []).map((v) => {
                                    refDuRecord.set(v.record, { kind, id: v.id }); return v.record; }); }
                                  catch { return []; } };
  const basesDuCraft = [...lireRecords("weapon"), ...lireRecords("armor")];
  const itemsDuCraft = lireRecords("item");
  const magiquesDuCraft = itemsDuCraft.filter((r) => String((r && r.data && r.data.subtype) || "").trim());
  /* ⭐ LOT 277 — les plans à variante, lus dans leurs records (`variantesDe`) : le menu PLAN
     de X5 y prend les frères de catégorie. ⛔ Aucune liste de noms. */
  const plansAVariante = itemsDuCraft.filter((r) => variantesDe(r && r.data).length >= 2);
  /* ⚖️ LA PILE PORTE-T-ELLE FATE'S HAND ? — elle le dit par ses propres records : une
     couche FH monte des ids `fh:…`, une pile SRD seule n'en porte aucun. ⛔ Pas un
     drapeau recopié ici : c'est la donnée qui répond. (`srfh:` n'est pas `fh:`.) */
  const pileFH = cherche.tous().some((t) => String(t.view && t.view.id).startsWith("fh:"));

  const montrer = (vue) => {
    vueEquipement = vue;
    /* la branche écrit son mot au belt ; la coquille repeint (et `peindre` sert
       le cas où personne ne l'écoute — les bancs, les tests) */
    if (FENETRE_DE[vue]) act({ kind: "fenetre", mot: FENETRE_DE[vue] });
    peindre();
  };

  /* ⭐ L'ARBITRE DU PORTAGE — la règle ratifiée d'Eric (24/08) : *« si c'est
     libre l'item prend son slot, sinon Pocket, sinon backpack »*. Le tri se
     fait AU MOMENT DU GESTE (un rendu n'écrit rien) : une destination
     « self » sans boîte libre devient « backpack », l'objet va au sac. */
  function actArbitre(a) {
    if ((a.kind === "addGearLine" || a.kind === "moveGearLine" || a.kind === "splitGearLine") && a.location === "self") {
      const prises = new Set(Object.keys(attribuerBoites(surR(), cherche)));
      const ref = a.ref || (lignes.find((l) => l.index === a.index) || {}).ref;
      const libre = candidatesDuSlot(cherche.slot(ref)).some((b) => !prises.has(b));
      if (!libre) a = { ...a, location: "backpack", equipped: false };
    }
    act(a);
  }

  /* le PILOTE que la carte R appelle (tap, dépôts) — voir `soignerLesCases` */
  /* ⚖️ LOT 267 — UN PLAN MÈNE DIRECTEMENT À X5 — Eric, 25/09 : *« je réalise que de
     passer par X2 est inutile. un blueprint doit mener directement à X5 »*.
     ⭐ UNE SEULE PORTE POUR LES TROIS CHEMINS qui ouvraient X2 depuis le catalogue (le
     tap sur R, le tap dans Wares, la recherche) : chacun posait son `ficheEnCours` à
     la main, et une règle ajoutée à l'un aurait manqué aux deux autres.
     ⛔ Seuls les plans que X5 SAIT composer y vont (`seCrafteDansX5`, la même question
     que le menu `Craft` de X2) : un pack, un Wondrous à choix, un parchemin gardent X2
     tant que leur famille n'a pas d'écran. `Cancel` de X5 rend l'écran d'où l'on vient. */
  function ouvrirLObjet(liste, index, retour) {
    const f = liste[index];
    const rec = f && f.ref ? cherche.record(f.ref) : null;
    if (rec && seCrafteDansX5(rec, basesDuCraft, magiquesDuCraft)) {
      const o = ouvertureX5(rec, magiquesDuCraft, basesDuCraft);
      if (o) {
        ficheX5 = { plan: { kind: "item", id: o.plan.id || f.ref.id }, planRecord: o.plan,
                    choix: o.choix, retour: retour || "r" };
        montrer("x5");
        return;
      }
    }
    ficheEnCours = { liste, index, retour };
    montrer("x2");
  }

  piloteEquipement = {
    ouvrirFiche(item) {
      const liste = [...itemsDeLaPage.values()].map(ficheItemAvec(cherche.valeur));
      ouvrirLObjet(liste, Math.max(0, liste.findIndex((f) => f.ref.id === item.view.id)));
    },
    mettreAuPanier(item) {
      /* le panier vit au DOCUMENT : l'acte passe par la coquille, et le
         compteur du CART se remet à jour au refresh qui suit. */
      act({ kind: "cartAdd", ref: { kind: item.kind, id: item.view.id } });
    },
  };

  /* ══ LOT 212 — L'ÉCRAN R (Gear) : le pilote monte le hub. Les branches vivent
     derrière ses portes : Backpack → la liste du sac (SB3.1 d'aujourd'hui, en
     attendant le lot B1) · Wares → le catalogue (le « Equipment Browser », en
     attendant le lot B2) · Send → vide le collecteur vers la destination
     choisie, ou, s'il est vide, ouvre la liste d'envoi · Tally → cette même
     liste (X3, en attendant son lot) · Purse ⏳ → le popup de la bourse, dont
     la cote arrive par la table. */
  function envoyer() {
    if (collecteEnvoi.size === 0) { montrer("sb32"); return; }
    /* ⚠️ VIDÉ AVANT LE PREMIER GESTE, pas après : chaque geste fait repeindre la
       coquille (`refresh`), et une collecte vidée APRÈS aurait été peinte pleine
       — mesuré au navigateur : « 1 to send » survivait à l'envoi. */
    const retenus = [...collecteEnvoi];
    collecteEnvoi.clear();
    /* ⚖️ ENVOYER VERS LE PARTY BAG, C'EST DÉSIGNER UNE BOÎTE, PAS UN LIEU — Eric,
       19/09 : *« les envois vers party bag »*. ⭐ `moveGearLine` EFFACE la boîte (à
       raison : où l'objet atterrit dans son nouveau lieu appartient à l'écran
       d'arrivée). Le party, lui, EST la boîte d'arrivée — c'est donc `placerGearLine`
       qui le porte, le même verbe que le glisser, ⛔ pas une seconde écriture.
       ⭐ ET LE RESTE NE CHANGE PAS : `Backpack` sans boîte tombe dans le DÉPÔT, ce qui
       est exactement *« quand je fais un send to backpack, ça va dans backpack
       dropdown »* (Eric, 19/09) — le défaut le dit déjà, on ne le redit pas ici. */
    for (const index of retenus) {
      if (destinationEnvoi === SECTION_PARTY.clef) {
        actArbitre({ kind: "placerGearLine", index, boite: boiteDeSection(SECTION_PARTY.clef) });
      } else {
        const location = destinationEnvoi === "self" ? "self" : "backpack";
        actArbitre({ kind: "moveGearLine", index, location });
      }
    }
    peindre();
  }
  /* les lignes qui vivent sur R : portées (self) et au sol (ground — « tu portes
     pas, tu n'équipes pas », Eric 16/09) ; le sac et la remise sont ailleurs */
  const surR = () => lignes.filter((l) => ["self", "ground"].includes(l.location || "backpack"));
  function construireGear() {
    const { noeud } = construireLEcranGear({
      boites: attribuerBoites(surR(), cherche),
      bourse,
      compteTally: cartCompte(docu),
      collecte: collecteEnvoi,
      destination: destinationEnvoi,
      surPorte: (porte) => {
        /* 🔴 LA PORTE REVIENT SUR L'ANCIEN SAC — 18/09. Le nouveau (`sac`) a été
           branché puis DÉPLOYÉ alors qu'il n'était pas fini : dalle sans matière,
           aucune image, cinq organes sans glyphe. ⛔ Un écran à moitié fait dans le
           chemin du joueur est pire que l'ancien qui marche.
           ⭐ Il n'est pas supprimé : il vit, avec ses gardes et son banc
           (`banc-sac.html`), et il reprendra cette porte quand il sera fini —
           construit depuis la SOURCE du chapitre, pas depuis un premier jet. */
        if (porte === "backpack") montrer("sac");
        if (porte === "wares") montrer("r");
        if (porte === "send") envoyer();
      },
      surBouton: (id) => {
        if (id === "tally") montrer("sb32");
        /* ⚖️ LA BOURSE EST UN POPUP, PAS UNE VUE — Eric, 16/09 : *« ça prend la place
           que ça doit, c'est un popup »*. ⛔ Elle ne passe donc PAS par `montrer()` :
           une vue remplacerait l'écran et écrirait la 3ᵉ ligne du belt. Un popup
           recouvre et n'écrit rien — même loi que les fiches X (*« les x ne
           s'inscrivent pas dans le belt »*). Retaper la bourse la referme. */
        if (id === "purse") { bourseOuverte = !bourseOuverte; peindre(); }
      },
      bourseOuverte,
      surFermerBourse: () => { bourseOuverte = false; peindre(); },
      /* ⛔ `setCurrency` tient déjà le plancher à zéro (« une bourse n'a pas de
         dette ») : on ne le redit pas ici, on s'appuie dessus. */
      surMonnaie: (key, value) => act({ kind: "setCurrency", key, value }),
      /* un seul objet dans le collecteur (Eric, 16/09) — la cible se ferme, ceinture ici */
      surCollecte: (index) => { if (collecteEnvoi.size === 0) { collecteEnvoi.add(index); peindre(); } },
      /* posé sur un emplacement : la boîte devient un choix du personnage */
      surPlacer: (index, boite) => { collecteEnvoi.delete(index); act({ kind: "placerGearLine", index, boite }); },
      surDestination: (valeur) => { destinationEnvoi = valeur; },
      /* ⭐ LOT 213 — LE TAP OUVRE LA FICHE. Eric, 16/09 : *« maintenant, clic droit
         ou tap sur un token doit produire une fiche X1 »*. La fiche s'ouvre sur
         l'objet tapé, avec son nombre à envoyer remis à 1 : un envoi est une
         intention, elle ne se garde pas d'un objet à l'autre. */
      surJeton: (index) => { origineX1 = vueEquipement; ficheX1 = index; nombreX1 = 1; lectureX1 = false; montrer("x1"); },
    });

    return noeud;
  }

  function construireCatalogue() {
    const catalogue = renderGearBlock({ query, onAction: act });
    const boutons = catalogue.querySelectorAll(".carte-r-bouton, .carte-r-loupe");
    for (const b of boutons) {
      if (b.dataset.mot === "GEAR") b.addEventListener("click", () => montrer("gear"));
      if (b.dataset.mot === "CART") {
        b.dataset.compte = String(cartCompte(docu));
        b.addEventListener("click", () => montrer("b2"));
      }
      if (b.dataset.mot === "LOUPE") b.addEventListener("click", () => montrer("recherche"));
      /* 🌱 LOT 198 — NEXT DÉCLARE SON VERBE, LA COQUILLE L'EXÉCUTE (NORMES §6 pré
         quater). 📏 MESURÉ AU NAVIGATEUR LE 10/09 : ce bouton ne faisait RIEN.
         Le commentaire disait « NEXT appartient à la coquille », et la coquille
         (`renderBoutonsDEtape`) disait l'inverse — *« l'écran R porte son propre
         NEXT »* — et ne posait donc pas sa paire sur Equipment. Deux organes qui
         se renvoient un geste, et personne ne le fait : Eric, 10/09, *« Il manque
         encore Équipement »*. Le verbe est `done`, celui que toute étape emploie
         pour avancer (`pressDone` → `equipmentValidate`, toujours prêt, →
         `cranVoisin(1)`) — Sheet en pile SRD, Sheet en pile Fate's Hand.
         CRAFT reste inerte : exclu du mandat du 24/08. */
      if (b.dataset.mot === "NEXT") b.addEventListener("click", () => act({ kind: "done" }));
    }
    return catalogue;
  }

  /* ══ X1 — LA FICHE D'UN OBJET POSSÉDÉ (lot 213) ═════════════════════════
     ⭐ TOUT CE QU'ELLE MONTRE SE LIT, RIEN NE SE RECOPIE : le nom, le prix, le
     poids et la prose viennent du RECORD par le chercheur ; la quantité, la
     position et les trois états viennent du DOCUMENT. La fiche n'a pas de
     mémoire à elle — sauf le nombre à envoyer, qui est une intention d'écran. */
  /* ══ LE SAC (SB3.1) — lot 214 ══════════════════════════════════════════════
     ⛔ L'ÉCRAN NE SAIT RIEN DU DOCUMENT, et c'est ce qui le rend regardable au
     banc : cette fonction traduit le document en ce qu'il attend — des sections,
     douze places, trois lignes de poids déjà mises en mots.
     ⭐ LES DOUZE PLACES SONT DES PLACES, PAS UNE LISTE : une case vide est un
     creux qui dit « pose ici », et une grille qui se tasserait toute seule
     effacerait le rangement que le joueur a fait. */
  function construireSac() {
    /* ⚖️ UN SAC NEUF N'A AUCUNE SECTION, et on ne lui en invente pas au document :
       l'écran en montre UNE, implicite, qui porte tout ce qui n'a pas de boîte.
       ⭐ Elle n'existe que le temps du rendu — le premier `+` en écrit une vraie.
       ⚖️ ET LE PARTY INVENTORY EST LÀ D'ENTRÉE DE JEU — Eric, 19/09. ⭐ EN DERNIER, et
       c'est un choix : le sac s'ouvre sur TES affaires ; le commun vient après. */
    /* ⭐ LES SIX SONT TOUJOURS LÀ ; celles que le joueur a nommées prennent la place
       de leur rang, les autres gardent leur nom par défaut. `fige` marque celles
       qu'on ne supprime pas — les six et le party — ⛔ mais elles se RENOMMENT
       toutes, sauf le party : renommer un tiroir, c'est le sien. */
    /* 🔴 LES SIX NE SONT PLUS IMMORTELLES — Eric : *« le mode edit et delete ne sont
       pas effectifs »*. Je les avais marquées `fige`, donc le `×` refusait sur TOUTES
       les sections et ne servait jamais à rien. ⛔ Un bouton qui refuse toujours est un
       bouton mort — c'est la faute que ce lot a passé deux jours à corriger ailleurs.
       ⭐ SIX EST UN POINT DE DÉPART, PAS UNE LOI : c'est ce que porte un sac neuf. Seul
       le party inventory reste figé — *« on peut changer sa position, mais pas
       l'effacer ni la renommer »* (Eric, 19/09).
       ⛔ `??` ET NON `||` : un nom VIDÉ par le `×` est un nom écrit, pas un nom absent.
       Avec `||` il serait retombé sur son nom par défaut, et le vidage n'aurait rien
       fait de visible. */
    /* ⚖️ *« les storage sont éditables »* · *« et la backpack dropdown non plus »* —
       Eric, 19/09. ⭐ Le dépôt ne se renomme donc PAS : son nom dit sa fonction, et
       c'est la seule chose qui garantit qu'on sait où atterrit un envoi. */

    /* ⭐ ET LE PARTY INVENTORY OUVRE LA LISTE, il ne la ferme plus — Eric, 19/09 :
       *« Party inventory dropdown · Backpack dropdown · Storage 1 · 2 · 3 »*.
       ⚠️ C'EST L'ORDRE QUI FAIT LOI ICI, PAS LE MOT : le premier cran s'appelle
       « Party bag » depuis le 19/09 au soir (§ `SECTION_PARTY`). La citation garde
       le mot d'Eric à sa date, ⛔ elle ne dit pas le nom courant.
       🔴 Je l'avais mis EN DERNIER la veille, avec une raison qui semblait bonne : le
       sac s'ouvre sur tes affaires, le commun vient après. ⛔ Elle était fausse — ce
       qui ouvre une liste est ce qu'on veut voir d'abord, et le commun se consulte
       plus souvent qu'un rangement. */
    const sections = sectionsDuSac(docu);
    if (sectionSac === null) {
      const depot = sections.findIndex((x) => x.index === SECTION_DEPOT);
      sectionSac = depot >= 0 ? depot : 0;
    }
    if (sectionSac >= sections.length) sectionSac = 0;
    const boite = boiteDeSection(sections.length ? sections[sectionSac].index : 0);
    /* les lignes DU SAC, celles de la section regardée, RANGÉES PAR LEUR PLACE
       ⚖️ ET CE QUI ARRIVE SANS BOÎTE TOMBE DANS LE DÉPÔT — Eric, 19/09 : *« quand je
       fais un send to backpack, ça va dans backpack dropdown »*.
       🔴 LE DÉFAUT ÉTAIT « LA PREMIÈRE SECTION DE LA LISTE », ET ÇA A CASSÉ IL Y A UNE
       MINUTE : le party inventory vient d'en prendre la tête, donc tout ce qu'on
       envoyait au sac serait tombé dans le COMMUN DU GROUPE. ⛔ Un défaut exprimé par
       une POSITION suit les réordonnancements ; un défaut nommé, non.
       ⭐ Il se nomme donc : `SECTION_DEPOT`, et rien ne le déplace. */
    const dedans = lignesDeSection(lignes, boite, boiteDeSection(SECTION_DEPOT));
    /* ══ LA GRILLE, LES TROUS ET LES PAGES — Eric, 18/09 : *« plus de place, ça va
       dans la page suivante ou celle d'après, prochain emplacement dispo, voire ça
       crée une page supplémentaire si besoin »*.
       ⭐ LA PAGE N'EST PAS UN ORGANE, C'EST UNE DIVISION DE LA SUITE DES PLACES :
       page = place ÷ 12. Rien à stocker, rien à tenir d'accord — le nombre de pages
       se DÉDUIT de la place la plus haute. */
    const grille = grilleDeSection(dedans, CASES_DU_SAC);
    const pages = Math.max(1, Math.ceil(grille.length / CASES_DU_SAC));
    if (pageSac >= pages) pageSac = pages - 1;
    const enMots = (l) => {
      if (!l) return null;
      return { index: l.index, nom: nomDeLaLigne(l),
        qte: l.quantity || 1, equipped: l.equipped === true,
        attuned: l.attuned === true, locked: l.locked === true };
    };
    const places = grille.slice(pageSac * CASES_DU_SAC, (pageSac + 1) * CASES_DU_SAC).map(enMots);

    /* 🎯 LE RUBAN DE DALLES — Eric, 2026-09-19 : *« je fais défiler une tuile à travers
       le viseur, je fais défiler une dalle en même temps… ils sont liés »*.
       ⭐ ON LES CONSTRUIT TOUTES, pour toutes les sections : c'est ce qui permet de changer
       de section SANS REPEINDRE. Le repeint était le vrai coût de cet écran — mesuré à 40 ms
       d'intervalle le 19/09, c'est lui qui faisait montrer son début au ruban et c'est de lui
       que venaient les trois fantômes. ⛔ Ce qui n'existe plus ne peut plus se tromper.
       ⚠️ ET UNE SECTION PEUT VALOIR DEUX DALLES : *« plus de place, ça va dans la page
       suivante… voire ça crée une page supplémentaire »* (18/09). Le lien roue ↔ dalles
       n'est donc pas une multiplication, c'est une LECTURE — chaque dalle dit à quelle
       section elle appartient. */
    const dallesDuSac = [];
    for (let i = 0; i < sections.length; i += 1) {
      const bi = boiteDeSection(sections[i].index);
      const gi = grilleDeSection(lignesDeSection(lignes, bi, boiteDeSection(SECTION_DEPOT)),
                                 CASES_DU_SAC);
      const pagesI = Math.max(1, Math.ceil(gi.length / CASES_DU_SAC));
      for (let pg = 0; pg < pagesI; pg += 1) {
        dallesDuSac.push({ section: i, page: pg,
          objets: gi.slice(pg * CASES_DU_SAC, (pg + 1) * CASES_DU_SAC).map(enMots) });
      }
    }
    const dalleCourante = Math.max(0,
      dallesDuSac.findIndex((d) => d.section === sectionSac && d.page === pageSac));
    /* ⚖️ QUATRE LIGNES DE POIDS — Eric, 18/09 : *« Gear · Backpack · Encumbrance =
       (Gear + Backpack) »*, puis *« other storage ne rentre pas dans encumbrance »*.
       ⛔ La remise n'entre pas dans le total, le sol non plus — mais la remise SE
       LIT, et c'est la 4ᵉ ligne que la source du chapitre réclame (16/09 : *« l'encart
       passe donc de trois à quatre lignes, sur R et sur B1 »*). ⭐ Un objet rangé
       ailleurs doit se compter quelque part, sans quoi il disparaît de l'écran. */
    const p = poidsParLieu(lignes, (ref) => ({ data: cherche.record(ref)?.data }));
    /* ⭐ DEUX FORMES POUR DEUX RÔLES — Eric, 19/09 : le TOTAL se lit en entier et nomme
       son calcul ; le DÉTAIL est court, trois parts sur une ligne. ⛔ Le détail ne
       répète ni « obj. » ni l'unité : elle est dite une fois, au-dessus. */
    const unite = p.unite || "lb";
    const rond = (x) => Math.round(x * 10) / 10;
    /* 🔴 CHAQUE PART EST UN COUPLE, PAS UNE CHAÎNE — et j'ai livré la faute : l'écran
       lit `{ poids, compte }` depuis le croquis du 19/09 (*« j'ai mis le nombre
       d'items sous les Gear, Back, Other »*), pendant que ce module rendait encore la
       chaîne d'avant. ⛔ Une chaîne n'a pas de `.poids` : la ligne du détail sortait
       VIDE, et aucun garde ne l'a dit — ils lisent des fichiers, pas un écran branché
       sur un document. C'est Eric qui l'a vue, en ligne, après avoir vidé ses cookies.
       ⭐ La leçon est celle du lot : *un contrat changé d'un côté se change des DEUX*. */
    /* ⚖️ CHAQUE COMPOSANT DIT SON UNITÉ — Eric, 2026-09-21 : *« Encumbrance 34 lb · Gear 0 lb ·
       Backpack 34 lb · Other 0 lb »*. ⛔ Et c'est le MÊME juge que le total (`uniteAffichee`),
       sinon deux lignes voisines pourraient afficher deux unités pour une seule pesée. */
    const mot = (compte, somme, inconnus, titre) => ({
      poids: motDUnPoids(titre, somme, inconnus, p),
      compte: `${compte} item${compte === 1 ? "" : "s"}`
    });
    /* ⚖️ JUSTE `Encumbrance` — Eric, 19/09 : *« Encumbrance (gear + backpack), c'est
       moche. Juste Encumbrance. »* ⭐ Et il a raison pour une raison qui se mesure :
       la parenthèse disait ce que la LIGNE DU DESSOUS montre déjà, en toutes lettres
       et avec les chiffres. Une ligne qui explique la suivante se lit deux fois pour
       rien.
       🔄 AMENDÉ LE 21/09 — L'UNITÉ REVIENT, ET L'ARGUMENT QUI L'AVAIT RETIRÉE EST MORT.
       Il disait : *« sans l'unité non plus : elle est dite trois fois juste dessous »*. 📏 Relevé
       sur le site déployé : les trois lignes du dessous rendent `Gear 0`, `Backpack 0`,
       `Other 0` — **aucune ne porte d'unité**. Le nombre d'encombrement était donc seul au monde,
       et Eric l'a demandé : *« rajoute l'unité d'encombrement »*.
       ⭐ UNE JUSTIFICATION QUI S'APPUIE SUR UN VOISIN MEURT QUAND LE VOISIN CHANGE, et rien ne
       prévient : le commentaire continue d'affirmer ce qui n'est plus vrai.
       ⛔ ET ELLE NE S'INVENTE PAS : `p.unite` est celle du LIVRE (`lb` en anglais, `kg` en
       français) ; elle vaut `null` quand les objets en MÉLANGENT plusieurs, et `p.melange` le
       dit. Afficher `lb` sur un total qui additionne des kilos serait un chiffre qui ment.
       ⭐ Le repli sur `lb` ne vaut donc que pour l'absence de mesure (aucun objet pesé), pas
       pour le mélange — c'est l'idiome déjà employé par `equipement-pipeline.mjs` et
       `b3-scene.mjs`, ⛔ pas une règle neuve. */
    /* ⭐ LE LIBELLÉ EST DESCENDU DANS `equipement-pipeline.mjs` — un seul écrivain pour « comment
       un encombrement se dit », et un garde qui le tient. ⛔ Le refaire ici en ferait un second. */
    const motTotal = (e) => motDeLEncombrement(e, p);
    const { noeud } = construireLeSac({
      /* ⚖️ LA LISTE DES CHAMPS VIENT DE L'ÉCRAN, ⛔ ELLE NE SE RETAPE PAS ICI — Eric,
         20/09 : *« absolument rien de bleu »*. Cette ligne gardait `nom` et `fige` et
         jetait `party`, `dehors` et `renommable` : le genre n'arrivait jamais à la tuile.
         ⛔ Le banc, lui, passe les objets entiers — donc le genre était VERT au banc et
         absent à l'écran, et j'ai cherché une teinte pendant qu'il manquait un champ.
         ⭐ `CHAMPS_DE_SECTION` est désormais LA liste : un champ de plus la traverse tout
         seul, et il n'y a plus deux endroits qui doivent rester d'accord. */
      sections: sections.map((s) => Object.fromEntries(
        CHAMPS_DE_SECTION.filter((c) => s[c] !== undefined).map((c) => [c, s[c]]))),
      section: sectionSac,
      dalles: dallesDuSac,
      dalle: dalleCourante,
      /* 🔴 ET CELUI-CI NE REPEINT PAS, C'EST TOUT SON INTÉRÊT. La dalle centrée EST la
         section regardée ; il n'y a rien à reconstruire, seulement un état à noter pour le
         prochain rendu (celui qu'une vraie action déclenchera). ⛔ Un `peindre()` ici
         rebâtirait le ruban sous le doigt qui le fait glisser. */
      surDalle: (k) => {
        const d = dallesDuSac[k];
        if (!d) return;
        sectionSac = d.section;
        pageSac = d.page;
      },
      edition: editionSac,
      renommage: renommageSac,
      objets: places,
      poids: {
        gear: mot(p.compte.self, p.somme.self, p.inconnus.self, "Gear"),
        backpack: mot(p.compte.backpack, p.somme.backpack, p.inconnus.backpack, "Backpack"),
        encombrement: motTotal(p.encombrement),
        autre: mot(p.compte.storage, p.somme.storage, p.inconnus.storage, "Other")
      },
      /* ⚖️ LE COMPTE ET LA PAGE — LA SOURCE DU CHAPITRE : *« le compte à gauche de la
         grille est le total d'objets (23 au backpack) ; la fraction à droite est la
         page (1/2) »*.
         ⭐ ET LA « PAGE » DU SAC EST SA SECTION. La source décrit un sac d'avant les
         sections : il se feuilletait par pages. Eric les a remplacées le 18/09 par
         des compartiments nommés, et le tambour EST le feuilleteur — la fraction dit
         donc où l'on en est dans la liste des sections. ⛔ Inventer un second
         paginateur aurait donné deux organes pour un seul geste.
         📌 Le compte, lui, reste celui du SAC ENTIER : c'est ce qu'annonce la source
         (« 23 au backpack »), et c'est le seul chiffre qu'on ne peut pas lire ailleurs. */
      compte: `${p.compte.backpack} item${p.compte.backpack === 1 ? "" : "s"}`,
      /* ⭐ LA FRACTION DIT LA PAGE DE LA SECTION — et c'est la lecture de la source
         du chapitre, retrouvée par la réponse d'Eric du 18/09 : une section déborde
         sur une page suivante, donc une section a des pages. ⛔ Ce n'est PAS le
         numéro de section : le tambour le dit déjà, et deux organes pour un seul
         fait, c'est deux occasions de se contredire. */
      page: `${pageSac + 1}/${pages}`,
      pages,
      surPage: (sens) => { pageSac = ((pageSac + sens) % pages + pages) % pages; peindre(); },
      /* ⭐ LE COLLECTEUR DU SAC EST CELUI DE R, ET IL PARTAGE SON ÉTAT : un objet
         retenu l'est pour le chapitre entier, pas pour un écran. ⛔ Deux collectes
         auraient laissé un objet « dans le panier » sur un écran et pas sur l'autre. */
      retenu: [...collecteEnvoi][0] ?? null,
      surCollecte: (index) => { if (collecteEnvoi.size === 0) { collecteEnvoi.add(index); peindre(); } },
      /* ⭐ POSÉ SUR UNE CASE, L'OBJET REJOINT LA SECTION QU'ON REGARDE : dans le sac
         une case n'a pas d'identité propre (la grille se tasse), donc le dépôt dit
         « ici », c'est-à-dire cette SECTION. C'est `gear[N].boite` qui l'écrit. */
      /* ⚖️ POSÉ SUR UNE CASE PRÉCISE, L'OBJET Y RESTE — c'est ce que *« le rangement
         fait partie des caracs du perso »* veut dire au doigt. ⭐ La place se DÉDUIT
         de la case et de la page : `case-2-3` en page 2 → 12 + 5. ⛔ Aucun nombre
         retapé : la largeur de la grille vient du plan.

         🔴 ET LA SECTION SE RELIT AU MOMENT DU DÉPÔT, ⛔ PAS À CELUI DU RENDU — c'est
         le défilement par la marge qui a révélé le piège, et il n'existait pas avant
         lui. Le glisser survit au repeint (ses écouteurs vivent sur `document`), donc
         le rappel qui s'exécute au dépôt est celui de l'écran D'AVANT le défilement.
         S'il refermait sur `boite` et `pageSac`, on aurait glissé jusqu'à la section
         3 pour voir l'objet atterrir dans la 1 — et rien n'aurait crié.
         ⭐ `sectionSac` et `pageSac` sont de l'état de MODULE : les relire ici, c'est
         lire l'écran qu'on a sous les yeux au moment où l'on lâche. */
      surPlacer: (index, creneau) => {
        collecteEnvoi.delete(index);
        /* ⛔ LA LISTE RELUE EST LA LISTE COMPOSÉE, party inventory compris : sans lui
           un jeton glissé jusqu'à la section du groupe atterrirait dans la dernière
           des miennes. C'est le même piège que le défilement par la marge, un cran
           plus loin. */
        /* 🔴 LA MÊME LISTE QUE CELLE QU'ON REGARDE — ⛔ plus de seconde composition.
           `sectionsDuSac` est l'écrivain unique ; la relire ICI (et non à la fermeture)
           reste indispensable, parce que le glisser survit au repeint : on lâche sur
           l'écran d'APRÈS le défilement par la marge, pas sur celui qui a armé. */
        const vivantes = sectionsDuSac(docu);
        const vive = boiteDeSection(vivantes[Math.min(sectionSac, vivantes.length - 1)].index);
        const m = /^case-(\d+)-(\d+)$/.exec(String(creneau || ""));
        const place = m
          ? pageSac * CASES_DU_SAC + (Number(m[1]) - 1) * COLS_GRILLE + (Number(m[2]) - 1)
          : undefined;
        act({ kind: "placerGearLine", index, boite: vive, place });
      },

      /* ⚖️ LE PARCHEMIN EST PERMANENT, C'EST SON HALO QUI PARLE — la source du
         chapitre, 15/09 : *« le Tally est toujours présent sur toutes les fiches à
         droite ; dès le premier item il porte un halo, et reste ainsi jusqu'à ce
         qu'il soit vidé »* — sur R, B1 et B2. ⛔ Le Group Tally n'existe qu'EN JEU :
         à la création la donnée ne le porte pas, sa place lui est réservée. */
      compteurs: { tally: cartCompte(docu), "party-tally": 0 },
      /* ⚖️ LA BOURSE DU SAC EST CELLE DE R — Eric, 19/09 au soir : *« purse »*. Son
         bouton existait depuis le 18/09 et n'était câblé NULLE PART ; il appelait
         `surPorte("purse")`, que le sac ne connaissait pas. ⛔ Un organe posé sans son
         fil est un organe mort — la faute que ce lot a déjà payée trois fois.
         ⭐ MÊME ÉTAT, MÊME ORGANE, MÊMES GESTES : `bourseOuverte` est de l'état de
         MODULE, donc la bourse ouverte sur R l'est encore quand on passe au sac. Deux
         états auraient laissé une bourse ouverte d'un côté et fermée de l'autre. */
      bourse, bourseOuverte,
      surFermerBourse: () => { bourseOuverte = false; peindre(); },
      surMonnaie: (key, value) => act({ kind: "setCurrency", key, value }),
      destinations: DESTINATIONS, destination: destinationEnvoi,
      surSection: (i) => { sectionSac = i; peindre(); },
      /* ⚖️ DÉPLACER UNE SECTION — Eric, 2026-09-19 au soir, croquis « EDIT MODE 1 » :
         *« les flèches permettent de déplacer le storage à droite et à gauche »*, et
         *« il n'y a désormais qu'un seul edit mode »*.
         🔴 CE QUI DISPARAÎT ICI EST TOUT UN GESTE : le maintien de 1,5 s ouvrait un second
         mode, on portait la section, on la faisait croiser ses voisines, et l'ordre
         s'écrivait à chaque croisement. ⛔ Un mode qu'on découvre en maintenant est un
         mode que personne ne trouve.
         ⭐ CE QUI LE REMPLACE TIENT EN UNE PERMUTATION : la section regardée échange sa
         place avec sa voisine, et le viseur la SUIT — sans quoi on déplace une section et
         on se retrouve à en regarder une autre.
         ⛔ ET LA BORNE SE LIT SUR LA LISTE, pas sur un compte à part : au bout de la
         course la flèche est éteinte, mais un clavier peut encore l'atteindre. */
      surDeplacerSection: (sens) => {
        const vers = sectionSac + sens;
        if (vers < 0 || vers >= sections.length) return;
        const ordre = sections.map((x) => x.index);
        const [pris] = ordre.splice(sectionSac, 1);
        ordre.splice(vers, 0, pris);
        sectionSac = vers;
        act({ kind: "ordonnerSections", ordre });
      },
      /* ⛔ EN ÉDITION LE RUBAN NE BOUCLE PAS, ET IL PORTE UNE PLACE DE PLUS (le `+`) :
         la borne haute change avec le mode. Une seule règle pour les deux aurait soit
         rendu le `+` injoignable, soit fait boucler une liste qu'on est en train de
         modifier. */
      surTourner: (sens) => {
        const n = Math.max(1, sections.length);
        sectionSac = editionSac
          ? Math.min(Math.max(0, sectionSac + sens), n)
          : (sectionSac + sens + n) % n;
        peindre();
      },
      surJeton: (index) => { origineX1 = vueEquipement; ficheX1 = index; nombreX1 = 1; lectureX1 = false; montrer("x1"); },
      surDestination: (valeur) => { destinationEnvoi = valeur; },
      /* ⚖️ LE RANGEMENT S'ÉCRIT AU DOCUMENT — Eric, 18/09 : *« oui, évidemment, le
         rangement fait partie des caracs du perso ; ça doit survivre à la session au
         même titre que les autres changements »*. ⛔ Ce n'est donc plus un ordre
         d'écran : chaque entrée écrit `gear[N].place` pour toute la section.
         ⭐ ET `Tighten up` EST LE PREMIER, parce qu'il est le seul qui RESPECTE le
         rangement du joueur : il ferme les trous sans rien réordonner. */
      surTrier: () => act({ kind: "popup", titre: "Sort",
        texte: "Order this section. It is kept with the character.",
        role: "aiguilleur",
        actions: RANGEMENTS.map((r) => ({ mot: r.mot, faire: () => act({
          kind: "rangerSection",
          places: rangement(dedans, r.clef, {
            nom: nomDeLaLigne,
            valeur: (l) => enGP(parseCout(valeurDeLaLigne(l).cout)) * (l.quantity || 1)
          })
        }) })) }),
      /* ⚖️ *« le bouton pack devient sections, et la roue passe en mode édition »* —
         il BASCULE le mode, il ne crée rien. C'est le `+` de la roue qui crée. */
      surSections: () => { editionSac = !editionSac; renommageSac = false; peindre(); },
      /* 🔴 LA POIGNÉE `/` N'ÉTAIT PAS CÂBLÉE DU TOUT — Eric : *« le mode edit et delete
         ne sont pas effectifs »*. J'avais posé le bouton dans l'écran et oublié son
         fil ici : un organe qui existe sans geste est un organe mort, et c'est
         exactement ce que ce lot a passé deux jours à corriger ailleurs. */
      surEditer: () => { renommageSac = !renommageSac; peindre(); },
      surAjouter: (ou) => {
        /* ⭐ LA NEUVE SE RANGE AU BOUT DE LA LISTE, et le viseur doit l'y suivre —
           sinon le joueur vient de créer une section et en regarde une autre.
           🔴 ET CETTE POSITION SE COMPTE SUR LA LISTE COMPOSÉE, PAS SUR LA MIENNE —
           mesuré dans l'application le 19/09 : `miennes.length` était juste tant que
           le party inventory FERMAIT la liste ; depuis qu'il l'OUVRE, il décale tout
           d'un cran et le viseur tombait UNE PLACE TROP TÔT — le cran dominant rendait
           vide.
           ⭐ C'est la deuxième fois en dix minutes que ce déplacement casse un calcul
           silencieux, après la boîte par défaut. *Une position déduite d'une liste
           qu'on réordonne est une bombe à retardement* : ce qui doit être nommé se
           nomme, ce qui se compte se compte sur LA liste qu'on affiche. */
        sectionSac = sections.length;
        act({ kind: "ajouterSection", dehors: ou === "dehors" });
      },
      surRenommer: (i, nom) => {
        renommageSac = false;
        const s = sections[i];
        /* ⛔ LE PARTY INVENTORY NE SE RENOMME PAS : on ne rebaptise pas une place
           qu'on n'a pas faite, et son nom dit à qui elle est. */
        if (!s || s.index === SECTION_PARTY.clef || s.index === SECTION_DEPOT) return;
        act({ kind: "renommerSection", index: s.index, nom });
      },
      surSupprimer: () => {
        const s = sections[sectionSac];
        if (!s) return;
        /* ⛔ LE PARTY INVENTORY NE SE SUPPRIME PAS NON PLUS — Eric, 19/09 : il est là
           *« d'entrée de jeu »*, donc il ne dépend d'aucun geste, donc aucun geste ne
           le retire. */
        if (s.index === SECTION_PARTY.clef) {
          act({ kind: "popup", titre: "Party inventory", role: "gendarme",
            texte: "The party inventory is always there. It is not a section you made." });
          return;
        }
        /* ⛔ NI LE DÉPÔT — Eric, 19/09 : *« cette section ne s'efface pas non plus »*.
           C'est là qu'atterrit tout ce que `Send to ▾ → Backpack` envoie ; une
           destination qu'on peut supprimer peut manquer au pire moment. */
        if (s.index === SECTION_DEPOT) {
          act({ kind: "popup", titre: "Backpack dropdown", role: "gendarme",
            texte: "Everything sent to the backpack lands here. It cannot be removed." });
          return;
        }
        /* ⚖️ LE PLANCHER DU TAMBOUR — Eric, 19/09 : *« si moins de 5 items dans le
           tambour, n'efface pas la tuile, juste nomme-la blank, quand on efface »*.
           ⭐ ET ÇA RÉSOUT UN CAS QUE J'AVAIS LAISSÉ OUVERT : sous cinq crans la roue
           cesse de boucler, et l'écran montre des trous aux deux bouts. Un tiroir vidé
           qui reste en place garde la roue pleine — et il dit vrai : la place existe,
           elle ne contient rien. */
        if (sections.length <= 5) { act({ kind: "viderSection", index: s.index }); return; }
        if (sectionSac >= sections.length - 2) sectionSac = Math.max(0, sections.length - 3);
        act({ kind: "supprimerSection", index: s.index });
      },
      surPorte: (id) => {
        if (id === "gear") montrer("gear");
        if (id === "wares") montrer("r");
        /* ⭐ `Send` FAIT ICI CE QU'IL FAIT SUR R, et par le MÊME point : il vide le
           collecteur vers la destination choisie, ou, s'il est vide, ouvre la liste
           d'envoi. ⛔ Il ouvrait la liste dans tous les cas — un bouton qui ne
           dépend pas de l'état est un bouton qui ne dit rien de l'état. */
        if (id === "send") envoyer();
        /* 🔴 LES TROIS ORGANES D'ÉCHANGE APPELAIENT CE POINT DEPUIS LE 18/09, ET IL NE
           LES ÉCOUTAIT PAS. Mesuré à l'écran le 19/09 au soir : un clic sur la bourse
           du sac ne produisait RIEN. ⭐ Les deux qui ont un destinataire le reçoivent
           ici, et par le MÊME geste que sur R — retaper la bourse la referme.
           ⛔ Le `party-tally`, lui, n'en a pas : il se montre inerte (`disabled`), il
           ne fait pas semblant d'écouter. */
        if (id === "purse") { bourseOuverte = !bourseOuverte; peindre(); }
        if (id === "tally") montrer("sb32");
      }
    });
    return noeud;
  }

  function construireX1() {
    const ligne = lignes.find((l) => l.index === ficheX1);
    /* ⛔ LA LIGNE A PU DISPARAÎTRE SOUS LA FICHE (corbeille, envoi) : on ne rend
       pas une fiche vide, on revient à l'écran d'où l'on vient.
       🔴 CE COMMENTAIRE S'ACCUSAIT LUI-MÊME : il disait « d'où l'on vient » et le code
       rendait Gear. ⛔ Aucune récursion à craindre — `ficheX1` vient d'être remis à
       `null`, donc même une origine `"x1"` retomberait sur le repli de `construireVue`. */
    if (!ligne) { ficheX1 = null; vueEquipement = origineX1; return construireVue(origineX1); }
    const rec = cherche.record(ligne.ref);
    const data = (rec && rec.data) || {};
    const qte = ligne.quantity || 1;
    const valeurX1 = valeurDeLaLigne(ligne);
    const cout = parseCout(valeurX1.cout);
    const poids = parsePoids(valeurX1.poids);
    const { noeud } = construireLaFicheX1({
      objet: {
        index: ligne.index, nom: ligne.nomAffiche, qte,
        prixUnite: valeurX1.cout || "",
        /* ⭐ EN MINUSCULES, COMME LE LIVRE L'ÉCRIT : la source dit « 15 gp », et
           `formatCout` rend « 30 GP » (sa casse sert le panier, où le montant est
           un TOTAL qu'on lit seul). Sur la fiche, le prix unitaire et le prix
           total se lisent côte à côte : deux casses pour deux fois le même mot se
           lisent comme deux choses. 📏 Et la boîte du plan est mesurée sur la
           minuscule (82,75 dans 84). */
        prixTotal: cout ? formatCout(multiplieCout(cout, qte)).toLowerCase() : "",
        poidsUnite: valeurX1.poids || "",
        poidsTotal: poids ? `${Math.round(poids.valeur * qte * 100) / 100} ${poids.unite}` : "",
        prose: proseDeLaLigne(ligne),
        /* ⚖️ LOT 279 — la rareté à côté du prix, la note de craft en pied (Eric, 26/09) */
        rarete: valeurX1.rarete || "",
        noteCraft: texteDeLaNote(valeurX1.craft),
        /* ⚖️ TRANCHÉ LE 18/09 : `is` RANGE l'objet dans la fiche de personnage — *« ça
           permet de mettre l'action de lancer une boule de feu avec un parchemin dans les
           actions / bonus action / réaction. Ou de le mettre dans les sorts. »* ⛔ Le genre
           du record (`weapon`, `armor`) ne peut donc PAS le remplir : c'est un rangement,
           et il dépend *« de ce que fait l'objet, et des capacités du perso »*. Il reste
           au joueur. Le genre voyage encore pour la prose, pas pour le menu. */
        genre: (ligne.ref && ligne.ref.kind) || "",
        equipped: ligne.equipped === true,
        attuned: ligne.attuned === true,
        locked: ligne.locked === true
      },
      nombre: nombreX1,
      destination: destinationEnvoi,
      /* ⚖️ LE PLAFOND D'HARMONISATION DU SRD — trois, et Eric l'a rappelé le 18/09 :
         *« a creature can be attuned to a maximum of 3 magic items at once ; attempting
         to attune to a 4th has no effect until one is unattuned »*.
         ⭐ IL SE COMPTE SUR LE DOCUMENT, PAS SUR L'ÉCRAN : toutes les lignes du
         personnage comptent, où qu'elles soient rangées — le sac harmonise autant que
         le corps. ⛔ Et il ne verrouille QUE la quatrième : la fiche d'un objet déjà
         harmonisé garde son interrupteur, sinon on ne pourrait plus en défaire un. */
      harmonises: lignes.filter((l) => l.attuned === true).length,
      lecture: lectureX1,
      surLecture: (v) => { lectureX1 = v; peindre(); },
      surNombre: (n) => { nombreX1 = Math.max(1, Math.min(n, qte)); },
      surDestination: (valeur) => { destinationEnvoi = valeur; },
      /* ⚖️ TROIS ÉTATS, DEUX ÉCRITURES DIFFÉRENTES, ET C'EST LE DÉPÔT QUI LE DIT :
         `equipped` n'est pas un drapeau libre — il est le REVERS de la position
         (*« tu portes pas, tu n'équipes pas »*, Eric 16/09), donc on déplace
         l'objet et `moveGearLine` pose l'état. `attuned` et `locked`, eux, sont
         des choix du personnage que rien ne déduit : ils passent par leur propre
         verbe. ⛔ Écrire `equipped` à la main ferait diverger l'état et le lieu. */
      surEtat: (clef, valeur) => {
        if (clef === "equipped") actArbitre({ kind: "moveGearLine", index: ligne.index, location: valeur ? "self" : "backpack" });
        else act({ kind: "setGearChamp", index: ligne.index, champ: clef, value: valeur });
      },
      est: ligne.is || "",
      surEst: (valeur) => act({ kind: "setGearChamp", index: ligne.index, champ: "is", value: valeur }),
      surCopier: () => copierLObjet(ligne, data),
      surPorte: (porte) => {
        if (porte === "close") { ficheX1 = null; lectureX1 = false; montrer(origineX1); }
        if (porte === "envoyer") {
          /* ⚖️ LE NOMBRE TRANCHE, ET C'EST TOUT CE QU'IL FAIT — Eric, 17/09 :
             *« c'est un tu choisis combien »* · *« un item Qty 2 peut devenir 2
             items qty 1 »*. Sous le total, c'est une SCISSION ; au total, c'est la
             pile entière qui part. Un seul bouton, deux gestes, et le champ que
             l'écran montrait déjà (borné `1 … qté`) cesse de mentir.
             ⛔ J'AVAIS ÉCRIT QUE SCINDER TOUCHAIT LA FORME DES DONNÉES. Mesuré
             depuis : `addGearLine` ne fusionne jamais, deux lignes du même record
             existent dans tout document où l'on a acheté deux fois la même chose.
             La forme n'a pas bougé d'un octet. */
          const total = Math.max(1, Number(ligne.qte) || 1);
          const part = Math.max(1, Math.min(Number(nombreX1) || 1, total));
          actArbitre(part < total
            ? { kind: "splitGearLine", index: ligne.index, quantity: part, location: destinationEnvoi }
            : { kind: "moveGearLine", index: ligne.index, location: destinationEnvoi });
          ficheX1 = null; montrer(origineX1);
        }
        if (porte === "trash") {
          /* 🔴 LA FAMILLE DÉFAIRE EST ROUGE ET TOUJOURS ACCOMPAGNÉE D'UN POPUP
             (NORMES §6) : jeter efface cinq chemins du document, et rien ne le
             rend. ⏳ Eric n'a pas tranché entre DÉTRUIRE et POSER AU SOL (les deux
             emplacements GROUND de l'écran R) — la question est au rapport. */
          act({ kind: "popup", titre: ligne.nomAffiche,
            texte: "Throw this away? It is gone for good.",
            actions: [{ mot: "Throw away", defait: true,
              faire: () => { ficheX1 = null; vueEquipement = origineX1; act({ kind: "removeGearLine", index: ligne.index }); } }] });
        }
      }
    });
    return noeud;
  }

  /** Ce que le bouton de copie met dans le presse-papier : de quoi COLLER
   *  l'objet ailleurs — son nom, ce qu'il coûte, ce qu'il pèse, et sa prose.
   *  ⛔ PAS DE REPLI SILENCIEUX (TRAPS) : là où le presse-papier n'existe pas ou
   *  refuse (Safari hors geste, permission coupée), le texte s'affiche dans un
   *  popup et le joueur le prend lui-même. Un bouton qui ne fait rien en silence
   *  est pire qu'un bouton absent. */
  function copierLObjet(ligne, data) {
    const qte = ligne.quantity || 1;
    const texte = [
      qte > 1 ? `${ligne.nomAffiche} ×${qte}` : ligne.nomAffiche,
      (() => { const c = valeurDeLaLigne(ligne).cout; return c ? `Cost: ${c}` : ""; })(),
      (() => { const w = valeurDeLaLigne(ligne).poids; return w ? `Weight: ${w}` : ""; })(),
      proseDeLaLigne(ligne)
    ].filter(Boolean).join("\n");
    const montrerLeTexte = () => act({ kind: "popup", titre: ligne.nomAffiche, texte });
    const presse = typeof navigator !== "undefined" && navigator ? navigator.clipboard : null;
    if (!presse || typeof presse.writeText !== "function") { montrerLeTexte(); return; }
    try {
      const promesse = presse.writeText(texte);
      if (promesse && typeof promesse.catch === "function") promesse.catch(montrerLeTexte);
    } catch { montrerLeTexte(); }
  }

  /* ══ WARES (lot 218) — LE PILOTE TRADUIT, L'ÉCRAN NE LIT RIEN ════════════════════
     ⭐ Tout ce que cet écran reçoit est déjà en mots : des crans, une page de jetons, deux
     comptes. Il ne connaît ni `query`, ni le document, ni le mot « personnage ».
     ⚖️ ET IL PAGINE PAR DOUZE, pas par quinze — `pageDeListe(objets, page, WARES_PAR_PAGE)` :
     l'écran passe SON nombre, explicitement, comme NORMES l'exige d'un écran qui dévie.
     ⛔ CE QUE LE NOUVEL ÉCRAN NE PORTE PAS ENCORE, et c'est dit, pas caché : la LOUPE (Eric,
     20/09 : *« une chose que nous devons faire oui. Pas ce soir »*) et `NEXT`, qui ira dans
     Gear (loi `equipement-next-vit-dans-r`). 📏 Et perdre `NEXT` ne casse rien : mesuré,
     `equipmentValidate()` rend `action: null` — il n'écrit RIEN, il avance d'un cran, et
     taper un cran du belt fait déjà ce voyage. ⛔ J'avais annoncé l'inverse trois fois sans
     l'avoir mesuré. */
  function construireWares() {
    const arbre = rayonsEtEtageres(query);
    const rayon = arbre[Math.min(rayonWares, Math.max(0, arbre.length - 1))] || null;
    const etageres = rayon ? rayon.etageres : [];
    const etagere = etageres[Math.min(etagereWares, Math.max(0, etageres.length - 1))] || null;
    const tous = etagere ? etagere.objets : [];
    const vue = pageDeListe(tous, pageWares, WARES_PAR_PAGE);
    pageWares = vue.page;

    /* ⭐ LA PAGE COURANTE EST PUBLIÉE POUR LA FICHE : `itemsDeLaPage` est ce que X2 feuillette
       (*« un x/x permet de passer d'un objet au suivant sans revenir à R »*). ⛔ Une seule
       écriture — la même que celle de l'ancien catalogue, au même endroit. */
    itemsDeLaPage.clear();
    for (const item of vue.objets) itemsDeLaPage.set(item.view.id, item);

    const { noeud } = construireLesWares({
      categories: arbre.map((r) => ({ nom: r.label })),
      categorie: rayonWares,
      sousCategories: etageres.map((e) => ({ nom: e.label })),
      sousCategorie: etagereWares,
      /* ⛔ AUCUN PRIX SUR LE JETON — la loi du 20/09. Ce que la tuile reçoit est le nom, et
         rien d'autre ; le prix vit sur la fiche et dans la recherche. */
      /* ⚖️ UNE PLAQUE PAR SOUS-CATÉGORIE, ET CHACUNE SUR SA **PREMIÈRE PAGE** — Eric, 21/09 :
         *« il faut uniquement la première page de chaque dalle »*.
         ⭐ C'EST CE QUI REND LE VERROU POSSIBLE. Le sac fait suivre sa plaque au tambour
         **image par image** parce que toutes ses plaques sont DÉJÀ posées ; une plaque qu'il
         faudrait construire au moment où le doigt passe dessus ne pourrait jamais suivre.
         📏 ET LE COÛT EST BORNÉ, mesuré sur la donnée : la catégorie la plus fournie porte
         7 sous-catégories, soit **7 plaques / 84 jetons** — ⛔ pas les 47 plaques / 564 jetons
         qu'il faudrait pour poser toutes les pages de tout.
         ⛔ SAUF LA COURANTE, qui porte la page où le joueur EST : les chevrons la feuillettent
         sur place. Les voisines, elles, n'ont que leur page 1 — et c'est exact, puisque
         *« on arrive sur la page 1 »* dès qu'on change de sous-catégorie. */
      plaques: etageres.map((e, k) => {
        const page = k === etagereWares ? vue : pageDeListe(e.objets, 0, WARES_PAR_PAGE);
        return {
          nom: e.label,
          /* ⛔ AUCUN PRIX SUR LE JETON — la loi du 20/09. */
          /* ⚖️ LA DIAGONALE DE LA RECETTE, SUR LE CATALOGUE AUSSI — et c'est une faute
             réparée, pas une fonction neuve. Le lot qui l'a posée a écrit, dans l'organe
             lui-même : *« R et le sac portent le MÊME jeton »*. ⛔ Ils sont TROIS —
             `gear-ecran`, `sac-ecran` et `wares-ecran` appellent tous `corpsDuJeton` — et
             seul le troisième ne recevait pas le drapeau. Le jeton savait le dessiner, sa
             règle CSS existait, `estRecette` était juste : la diagonale ne manquait QUE
             dans la pose, et aucun garde ne pouvait le dire.
             🔴 C'est la leçon du dépôt prise en flagrant délit : une liste PAR NOM est
             incomplète par construction, et celle-ci était écrite dans le commentaire qui
             justifiait de ne pas se répéter.
             ⚠️ `item.view` EST UNE VUE, PAS UN RECORD — mesuré : `recordLabel` lit
             `view.record.name`. Passer `item.view` rendrait `{}` à `estRecette`, qui ne
             verrait plus ni `category` ni `rarity` : les kits marcheraient par leur
             étagère, les armes et armures ⛔ PAS, et rien ne l'aurait signalé.
             🔧 ET LE SECOND ARGUMENT A DISPARU LE MÊME SOIR, À QUELQUES MINUTES PRÈS.
             Cette ligne passait `e.id` (`aisle:shelf`) parce que le prédicat lisait alors
             l'ÉTAGÈRE : les sept packs du SRD ne portaient QUE `cost`, `name`, `weight`,
             et rien dans leur record ne les distinguait d'un sac à dos. ⭐ Puis `contents`
             est monté en amont, le signal a déménagé dans le record, et toute la
             plomberie de l'étagère est tombée avec lui — voir `equipement-pipeline.mjs`.
             ⛔ CE QUE LE COMMENTAIRE D'AU-DESSUS DIT RESTE VRAI ET RESTE L'ESSENTIEL :
             `item.view` est une VUE, pas un record. C'est ça, le défaut qui a coûté une
             diagonale invisible sur trois écrans, pas le choix du second argument. */
          objets: page.objets.map(poseDeWares),
          compte: e.objets.length,
          pages: page.pages,
        };
      }),
      page: pageWares,
      /* 🔴 C'ÉTAIT `motDeLaBourse(docu)`, ET C'EST UNE FAUTE DE CÂBLAGE À MOI — 21/09.
         `motDeLaBourse` ne rend PAS le contenu de la bourse : il rend `null`, ou la phrase
         *« Choose a class … to get your starting gold »*. Wares recevait donc une PHRASE là où
         R et le sac reçoivent les quatre monnaies. Le nom accessible du bouton devenait la
         phrase entière, et le popup lisait `enGP(<phrase>)`.
         ⭐ LE NOM M'A TROMPÉ, et c'est l'enseignement : `motDeLaBourse` sonne comme « la bourse,
         en mots » ; il dit en réalité *« ce qu'on annonce à qui n'a pas encore de classe »*.
         ⛔ Un nom qui décrit une FORME (« un mot ») sans dire de quoi il parle se branche tout
         seul au mauvais endroit. Le sac, lui, prend `currentCurrency(docu)` — la donnée. */
      /* ⚖️ L'ENCOMBREMENT — Eric, 2026-09-21 : *« rajoute l'unité d'encombrement »* puis, pour
         la place, *« dans le pied, entre les Tally et le collecteur »*.
         ⭐ LE MOT EST DIT PAR LE PIPELINE, ⛔ pas par Wares et pas ici : `motDeLEncombrement` est
         le seul écrivain de cette phrase, et c'est lui qui sait que l'unité du jeu est la livre.
         ⭐ ET LA PESÉE EST CELLE DU SAC, au mot près — même `currentGearLines`, même
         `poidsParLieu`. ⛔ Deux pesées pour un même personnage divergeraient au premier objet
         sans poids connu, et l'écran d'à côté afficherait un autre total. */
      encombrement: (() => {
        const lignesPesees = currentGearLines(docu).filter((l) => l.ref);
        const pesee = poidsParLieu(lignesPesees, (ref) => ({ data: cherche.record(ref)?.data }));
        return motDeLEncombrement(pesee.encombrement, pesee);
      })(),
      bourse: currentCurrency(docu),
      compteTally: cartCompte(docu),
      /* ⭐ LA BOURSE S'OUVRE ICI COMME SUR R ET SUR LE SAC — même état de module, donc une
         bourse ouverte sur R l'est encore en passant par Wares. Deux états en auraient laissé
         une ouverte d'un côté et fermée de l'autre. */
      bourseOuverte,
      surFermerBourse: () => { bourseOuverte = false; peindre(); },
      surMonnaie: (key, value) => actArbitre({ kind: "setCurrency", key, value }),
      /* ⛔ ON N'OFFRE QUE LES DESTINATIONS ACTIVES : une option qu'on peut choisir et qui ne
         mène nulle part est un libellé qui ment, ce que §6 interdit. */
      sections: DESTINATIONS.filter((d) => d.actif).map((d) => ({ valeur: d.valeur, mot: d.mot })),
      destination: destinationEnvoi,
      /* ⚖️ CHANGER DE CATÉGORIE REMET LA SOUS-CATÉGORIE ET LA PAGE À ZÉRO — sans quoi on
         arrive au rang 4 d'une catégorie qui n'en a que deux, et l'écran se tait. */
      surCategorie: (i) => { rayonWares = i; etagereWares = 0; pageWares = 0; peindre(); },
      surSousCategorie: (i) => { etagereWares = i; pageWares = 0; peindre(); },
      surPage: (sens) => { pageWares += sens; peindre(); },
      /* ⚖️ UN TAP OUVRE UN X2 — la fiche d'un objet du CATALOGUE (loi du 20/09). ⛔ Pas un X1 :
         celui-là est la fiche d'un objet qu'on POSSÈDE, et on ne possède rien sur une étagère. */
      surJeton: (ref) => {
        const liste = [...itemsDeLaPage.values()].map(ficheItemAvec(cherche.valeur));
        ouvrirLObjet(liste, Math.max(0, liste.findIndex((f) => f.ref.id === ref)), "r");
      },
      surPorte: (id) => {
        if (id === "gear") montrer("gear");
        if (id === "backpack") montrer("sac");
        /* ⭐ `Send` FAIT ICI CE QU'IL FAIT PARTOUT, et par le MÊME point. */
        if (id === "send") envoyer();
      },
      surBouton: (id) => {
        /* 🔴 LE TALLY DE WARES OUVRE LE PANIER, ⛔ PAS LA LISTE D'ENVOI — et c'est un garde du
           parcours d'achat qui me l'a appris, pas une relecture. Eric, 20/09 : *« Cart c'est
           tally tu l'as déjà fait »*. J'avais recopié le geste de R (`montrer("sb32")`, la
           liste d'envoi) sans voir que le mot y désigne autre chose.
           ⭐ ET LES DEUX LECTURES SE TIENNENT : dans une BOUTIQUE, ton tally est ce que tu es
           en train d'acheter ; sur ta fiche, c'est ce que tu t'apprêtes à envoyer. Le mot suit
           l'écran, et c'est l'écran qui dit lequel. ⛔ Un organe qui porte le même nom sur deux
           écrans n'y fait pas forcément la même chose — et rien ne le disait. */
        if (id === "tally") montrer("b2");
        if (id === "purse") { bourseOuverte = !bourseOuverte; peindre(); }
      },
      surDestination: (v) => { destinationEnvoi = v; peindre(); },
      /* ⚖️ GLISSER UN JETON SUR LE COLLECTEUR LE MET AU PANIER. ⭐ C'est la seule lecture qui
         tienne : Wares n'a qu'UN collecteur, et Eric a dit le 20/09 que le panier est le Tally
         — donc déposer, c'est mettre au Tally. ⛔ Et le panier vit au DOCUMENT : l'acte passe
         par la coquille, le compteur se remet à jour au rendu qui suit. */
      surDepot: (ref) => {
        const item = itemsDeLaPage.get(ref);
        if (item) act({ kind: "cartAdd", ref: { kind: item.kind, id: item.view.id } });
      },
    });
    return noeud;
  }

  /* ══ X0 — UNE VUE, ⛔ PLUS UN CALQUE (lot 254, Eric : « X0 va utiliser le même
     process que X1 et X2. ou oublie le voile 0 ») ══════════════════════════
     🔴 ET C'EST LA CAUSE DU DÉFAUT, PAS SEULEMENT SON REMÈDE. X0 était AJOUTÉE
     dans le nœud de Gear ; X1 et X2 sont RETOURNÉES par `construireVue` et
     montées telles quelles. 📏 Mesuré au navigateur le 23/09, même page, même
     instant : X1 peignait son parchemin (`viewBox 0 0 375 500`) et X0 restait
     sur le rectangle de secours (`viewBox: null`) — `habilleEnParchemin` pose
     son `requestAnimationFrame` et son `ResizeObserver` sur une carte que le
     montage par ajout ne réveillait jamais.
     ⭐ En devenant une vue, X0 emprunte le chemin de montage qui marche déjà
     pour deux écrans. ⛔ On ne répare pas un organe en lui ajoutant une
     béquille : on lui fait prendre le chemin des autres.
     ⭐ ET LE VOILE 0 DISPARAÎT AVEC LE CALQUE : il n'y a plus rien dessous. */
  function construireX0() {
    /* ══ LE QCM DU DÉPART — l'aiguilleur « Your equipment », refait (lot 245)
       ⚖️ Eric, 21/09 : *« il y a déjà une popup mais elle est moche et pas
       claire »*, *« je te demande de l'améliorer »*. ⛔ MÊME ORGANE, mêmes
       classes `.aiguilleur-*` : une seconde famille pour le même objet est la
       faute que ce dépôt repaie tous les quinze jours.

       🔴 CE QUI LE RENDAIT « PAS CLAIR » N'ÉTAIT PAS SON DESSIN. Il disait
       *« your class kit is yours, already listed »* et le kit n'arrivait nulle
       part (`shell.mjs`, branche `kit` : un `set` et rien d'autre). Le popup
       décrivait un monde que le code ne fabriquait pas. ⭐ Ce qui suit affiche
       exactement ce que `Done` posera — même fonction, `butinDuDepart`, lue
       une fois pour l'œil et une fois pour le geste.

       ⭐ ET L'ÉTAT DU QCM NE VA PAS AU DOCUMENT AVANT `Done`. Il vit dans la
       fermeture de l'étape (`reponsesDuQcm`) et un clic d'option ne fait que
       `peindre()` — ⛔ pas `act()`, qui repasserait par la coquille et
       rendrait l'étape à neuf. C'est ce qui permet au récapitulatif de se
       recalculer à chaque changement sans écrire une ligne, et à `Done`
       d'être le SEUL moment d'écriture. */
    const butin = butinDuDepart({ query, document: docu, reponses: reponsesDuQcm });

    /* ⚖️ X0 PORTE SON NOM DE RANG — `x0`, à côté de `.x1` et `.x2`. C'est par
       cette classe qu'elle entre dans la boîte partagée des écrans d'équipement,
       et par `data-objet` que sa feuille lui donne sa hauteur. */
    const voile = el("div", "aiguilleur x0");
    voile.dataset.objet = "x0";
    const carte = el("div", "aiguilleur-carte");
    /* 📏 LE BUDGET DE LA DÉCHIRURE EST DÉDUIT D'UNE COTE, ⛔ PAS CHOISI : c'est
       la plus petite distance entre le contenu et le bord de la feuille — 8 blg
       en haut et en bas (22 sur les côtés, qui sont donc plus larges). Le bord
       ne peut ainsi jamais mordre une lettre. */
    const feuilleX0 = el("style");
    feuilleX0.setAttribute("data-fhpc", "x0");
    feuilleX0.textContent = feuilleDesCotesX0();
    carte.append(feuilleX0);
    /* ⚖️ LOT 273 — la carte de X0 est une DALLE, comme les autres fiches X (Eric, 25/09). */
    carte.append(el("h2", "aiguilleur-titre", [text("Gear")]));
    /* ⚖️ LA PHRASE DE L'AIGUILLEUR OUVRE L'ÉCRAN, ⛔ elle ne le ferme plus.
       ⭐ Elle dit OÙ L'ON EST et ce qu'on y fait : ça se lit AVANT d'avoir
       choisi, pas après. Eric, 23/09 : *« T1 texte police bleue, c'est
       l'aiguilleur »* — le bleu est le verbe naviguer, et c'est le même
       `--info` que la bordure de `.popup[data-role="aiguilleur"]`. */
    carte.append(el("p", "aiguilleur-texte aiguilleur-bilan-mot", [text(
      "This is what your character starts with. You may purchase additional " +
      "equipment in Wares, if you can afford it.")]));

    /* ── UNE SECTION PAR SOURCE ──────────────────────────────────────────
       ⚖️ La maquette d'Eric : *« 1 — Fighter : your class gives you… Choose
       (A1) … (B1) … ; 2 — Background : your background gives you… »*.
       ⭐ N OPTIONS, JAMAIS DEUX : la maquette en montre deux, le Fighter en
       a trois. Le rendu compte les options de la phrase, il ne les suppose
       pas. */
    for (const source of butin.sources) {
      /* 🔴 LE TITRE PORTE LA CONSIGNE, IL N'A PAS DE LIGNE À LUI — 📏 mesuré
         au navigateur le 21/09, 512 × 764, pile SRD (deux vraies questions) :
         la carte faisait **726 blg dans un voile de 681**, elle sortait par
         le haut ET par le bas, et `Done` était coupé en deux.
         ⛔ ET ON NE MET PAS DE DÉFILEMENT INTERNE : la loi du dépôt est de
         demander ce que le contenu porte EN TROP. Ce qui était en trop, ce
         sont les deux lignes « gives you a choice: » — elles ne disaient rien
         que les boutons juste dessous ne montrent déjà. ⭐ Et c'est la
         maquette d'Eric au mot près : *« 1 — Fighter : your class gives you
         bla-bla. Choose »* — UNE ligne, pas deux. */
      const bloc = el("div", "aiguilleur-section");
      /* ⚖️ LE SÉPARATEUR EST CELUI DES FICHES X — ⛔ ET CE N'EST PAS UN TRAIT :
         `.x1-filet` est un ORNEMENT masqué (deux fuseaux, deux losanges, un
         rond). ⭐ ON REPREND SA CLASSE, PAS SA DÉCLARATION : `.x1-filet` est
         une règle de CLASSE et non de descendance — elle voyage avec l'organe,
         exactement comme X2 l'a reprise au lot 242. Seule la POSE est à nous. */
      bloc.append(el("div", "x1-filet aiguilleur-filet"));
      /* ⛔ PLUS DE NUMÉRO « 1 · » / « 2 · » — Eric, 23/09 : *« pas de 1 et 2
         fighter soldier »*. Le nom de la source suffit à la nommer. */
      const titre = el("p", "aiguilleur-soustitre", [
        el("strong", null, [text(source.mot)]),
      ]);
      bloc.append(titre);

      if (!source.options.length) {
        /* ⭐ CE QUI NE SE LIT PAS SE DIT — la loi du lot 182, étendue des
           montants aux objets. Une source illisible est NOMMÉE : elle ne
           vaut ni zéro ni un kit de secours. */
        titre.append(text(source.prose
          ? " — its starting equipment could not be read from its own text, so nothing is offered here."
          : " — its starting equipment is not named in the data, so nothing is offered here."));
        carte.append(bloc);
        continue;
      }

      if (source.unique) {
        /* 🔴 UNE SEULE OPTION N'EST PAS UNE QUESTION. ⚖️ Eric, 21/09 :
           *« idem en plus simple pour Fate's Hand »*. En pile Fate's Hand
           l'origine porte `"50 GP"`, une chaîne nue, sans « Choose » : la
           section devient une CONSTATATION. ⛔ Fabriquer un QCM à une seule
           réponse pour faire symétrique avec le SRD mentirait au joueur.
           ⚠️ Mais « plus simple » n'est pas « muet » : sans cette phrase,
           le récapitulatif porterait un or dont la provenance est invisible. */
        const seule = source.options[0];
        titre.append(text(` gives you ${motDuLot(seule)}.`));
        /* 🔴 LOT 246 — UNE SOURCE À UNE SEULE OPTION AVALAIT SES REFUS, ET
           PERSONNE NE POUVAIT LE VOIR. Ce `continue` sautait par-dessus
           l'affichage des refus : un morceau incompris d'une phrase SANS
           choix disparaissait en silence. 📏 En pile Fate's Hand l'origine
           porte « 50 GP » — aucun morceau, donc aucun refus, donc aucun
           symptôme : le trou était réel et muet. ⭐ C'est la leçon de
           l'organe fabriqué par N écrans, dans sa forme la plus bête — deux
           branches, et une seule qui parle. */
        bloc.append(...ceQueLaSourceDit(source, butin, basculerLaReponse));
        carte.append(bloc);
        continue;
      }

      /* ⚖️ *« Fighter (bold T2) gives you a choice (T1) »* — Eric, 23/09. Le mot
         « Choose: » annonçait une liste ; cette phrase-ci dit d'où vient le choix. */
      titre.append(text(" gives you a choice"));
      const liste = el("div", "aiguilleur-options");
      for (const option of source.options) {
        const choisie = reponsesDuQcm[source.genre] === option.lettre;
        /* ⚖️ LOT 246, ERIC 21/09 : *« Une ligne de texte, bouton à droite =
           peu d'espace perdu »*, puis *« Deux lignes de texte un bouton à
           droite alors. Ou trois lignes de texte un bouton à droite. »*
           ⭐ UNE OPTION N'EST PLUS UN BOUTON À LIBELLÉ : c'est une RANGÉE À
           DEUX COLONNES — le texte dit, la pastille choisit. Deux organes, et
           ⛔ le texte n'entre pas dans le bouton : un bouton qui contient un
           paragraphe impose sa boîte tactile de 44 à CHAQUE ligne du
           paragraphe, et c'est de là que venait la hauteur.
           ⛔ LA PASTILLE RESTE À DROITE ET HORS DU TEXTE — elle ne passe pas
           dessous quand le texte va à trois lignes. Une rangée, deux colonnes.
           ⭐ ET LA LETTRE A DÉMÉNAGÉ DANS LA PASTILLE : elle était écrite
           « A · » en tête du libellé. Un seul écrivain de la lettre, et le
           texte gagne deux caractères sur chaque ligne. */
        const rangee = el("div", "aiguilleur-rangee");
        /* ⭐ DEUX LIGNES QUAND IL Y A UNE SOMME, UNE SEULE SINON — et le cas
           « (C) 155 GP » n'a QUE la somme : il ne doit pas porter une première
           ligne vide. Les trois formes sont celles des couches, ⛔ pas trois
           branches inventées pour faire joli. */
        const { objets, somme } = piecesDuLot(option);
        const mot = el("p", "aiguilleur-option-mot");
        if (objets) mot.append(el("span", "aiguilleur-option-objets", [text(objets)]));
        if (somme) mot.append(el("span", "aiguilleur-option-somme", [text(somme)]));
        if (!objets && !somme) mot.append(text("nothing"));
        /* ⭐ UN SECOND TAP SUR L'ÉLUE L'EFFACE — et effacer redésarme `Done` :
           le QCM redevient incomplet, et il le montre. La bascule est celle
           de toute la carte (`basculerLaReponse`), ⛔ pas une copie locale. */
        const b = button(option.lettre, "aiguilleur-option",
          () => basculerLaReponse(source.genre, option.lettre),
          `Option ${option.lettre} of ${source.mot}: ${motDuLot(option)}`);
        markPressed(b, choisie);
        /* ⭐ LA PASTILLE EST AJOUTÉE AVANT LE MOT — Eric, 23/09, sur deux rendus.
           ⛔ Et c'est ICI que ça se joue, pas dans `grid-template-columns` : une
           colonne dit une largeur, l'ORDRE est celui du DOM. La raison du lot 246
           (la pastille ne passe jamais sous le texte) tient toujours — elle est
           servie par `auto 1fr`, qui fige la colonne du bouton quel que soit le
           côté où elle se trouve. */
        rangee.append(b, mot);
        liste.append(rangee);
      }
      bloc.append(liste);
      bloc.append(...ceQueLaSourceDit(source, butin, basculerLaReponse));
      carte.append(bloc);
    }

    /* ── LE RÉCAPITULATIF ────────────────────────────────────────────────
       ⚖️ La maquette : *« This is what your character starts with, you may
       purchase additional equipment in Wares, if you can afford it »*, puis
       la liste et l'or. ⭐ Il se recalcule à chaque changement de choix —
       il est rendu depuis `butin`, qui est relu à chaque `peindre()`. */
    carte.append(el("div", "x1-filet aiguilleur-filet"));
    carte.append(el("p", "aiguilleur-bilan-titre", [text("You start with")]));
    const bilan = el("ul", "aiguilleur-bilan");
    for (const ligne of butin.lignes) {
      bilan.append(el("li", "aiguilleur-bilan-ligne", [text(
        ligne.quantity > 1 ? `${ligne.quantity} × ${ligne.nom}` : ligne.nom)]));
    }
    if (butin.cout) bilan.append(el("li", "aiguilleur-bilan-ligne aiguilleur-bilan-or",
      [text(formatCout(butin.cout))]));
    if (!butin.lignes.length && !butin.cout) {
      bilan.append(el("li", "aiguilleur-bilan-ligne", [text("nothing yet — answer above")]));
    }
    carte.append(bilan);

    /* ⚖️ LE RESSORT — Eric, 23/09 : *« l'excédent d'espace pour que le gear
       popup recouvre totalement la dalle gear sera entre le texte vert et
       done »*. ⭐ C'EST CE QUI FAIT DE X0 UNE DALLE ET PLUS UN CARTON : la
       feuille prend toute la hauteur utile, et le jeu se range en UN SEUL
       endroit, NOMMÉ, au lieu de se répartir en silence dans les marges. */
    carte.append(el("div", "aiguilleur-ressort"));
    const pied = el("div", "aiguilleur-pied aiguilleur-pied-seul");
    const done = button("Done", "aiguilleur-bouton",
      () => { if (butin.complet) act({ kind: "poserLeDepart", reponses: { ...reponsesDuQcm } }); },
      "Take this equipment and put it in Gear");
    /* ⛔ UN BOUTON QUI REFUSE TOUJOURS EST UN BOUTON MORT : celui-ci ne
       refuse que tant qu'une question reste sans réponse, et il le DIT
       (`disabled` + `aria-disabled`, lus par l'œil et par l'oreille). */
    if (!butin.complet) { done.disabled = true; done.setAttribute("aria-disabled", "true"); }
    pied.append(done);
    carte.append(pied);
    voile.append(carte);
    return voile;
  }

  function construireX5Vue() {
    /* ⚠️ Le plan de la famille est porté TEL QUEL par `ficheX5` : un record lu dans la
       pile n'a pas toujours son `id` en `data`, et le recomposer par nom serait une
       seconde lecture de la même chose. */
    const plan = ficheX5.planRecord || cherche.record(ficheX5.plan);
    const { noeud } = construireX5({
      plan, bases: basesDuCraft, itemsMagiques: magiquesDuCraft,
      /* ⭐ la valeur d'un objet fini passe par LA porte des recettes (garde 11) */
      plansFreres: plansAVariante, valeurDe: (r) => valeurDUneRecette(r, null),
      choix: ficheX5.choix, fh: pileFH,
      surChoix: (organe, valeur) => {
        /* ⭐ LOT 277 — un autre PLAN, c'est une autre fiche : sa variante repart de la
           première, le statut, la quantité et la destination restent. */
        if (organe === "PLAN") {
          const autre = plansAVariante.find((r) => r.data.name === valeur);
          if (autre) {
            const { status, qte, destination } = ficheX5.choix;
            ficheX5 = { ...ficheX5, plan: refDuRecord.get(autre) || ficheX5.plan, planRecord: autre,
                        choix: { status, qte, destination }, alerte: "" };
            montrer("x5");
          }
          return;
        }
        const c = { ...ficheX5.choix };
        /* ⭐ LOT 269 — un prix tapé vaut pour CET assemblage : changer la base, le bonus, un
           pouvoir ou le statut le rend au prix calculé. ⛔ Sinon un prix tapé pour une dague
           survivrait sur une armure de plate. */
        if (organe === "PRIX") c.prix = String(valeur || "").trim() || null;
        else if (["ITEM", "BONUS", "POWER 1", "POWER 2", "VARIANT", "STATUS", "QTY"].includes(organe)) c.prix = null;
        if (organe === "QTY") c.qte = Number(valeur) || 1;
        if (organe === "ITEM") { c.base = valeur; c.pouvoirs = []; }   /* ⛔ une autre base, d'autres pouvoirs */
        else if (organe === "BONUS") c.bonus = valeur || null;
        else if (organe === "VARIANT") c.variante = valeur;
        else if (organe === "POWER 1" || organe === "POWER 2") {
          const p = [...(c.pouvoirs || [])];
          p[organe === "POWER 1" ? 0 : 1] = valeur || null;
          c.pouvoirs = p.filter((x, i) => x || i === 0).slice(0, 2);
        }
        else if (organe === "STATUS") c.status = valeur;
        else if (organe === "SEND TO") c.destination = valeur;
        ficheX5 = { ...ficheX5, choix: c };
        montrer("x5");
      },
      /* ⚖️ `Cancel` rend la fiche d'où l'on vient — ⛔ il ne rend pas Wares directement :
         le joueur retrouve le plan qu'il regardait. */
      surAnnuler: () => { const r = ficheX5.retour || "x2"; ficheX5 = null; montrer(r); },
      alerte: ficheX5.alerte || "",
      /* ⭐ LA BOURSE DE X5 EST CELLE DE R, DU SAC ET DE WARES — même état de module. */
      bourse, bourseOuverte,
      surBourse: () => { bourseOuverte = !bourseOuverte; peindre(); },
      surFermerBourse: () => { bourseOuverte = false; peindre(); },
      surMonnaie: (key, value) => actArbitre({ kind: "setCurrency", key, value }),
      /* ⚖️ LE JETON OUVRE UNE FICHE X1 EN APERÇU — Eric, 25/09 : « une fiche X1 avec uniquement
         un back, options de lock, attune, wear grisées ». ⭐ L'objet n'existe pas encore :
         la fiche montre ce qu'il SERA (nom, prix, poids, texte) et ne permet rien d'autre. */
      surJeton: (a) => { apercuX5 = a; montrer("x1-apercu"); },
      /* ⭐ LOT 265 — `SEND` : l'objet entre dans l'équipement du personnage.
         ⚖️ Eric, 25/09 : le craft SE PAIE (a), l'objet arrive TOUT DE SUITE (a), le
         site ne stocke rien (a). ⭐ Même chemin qu'un achat en X2 — `payer` puis
         `addGearLine` — et la ligne porte sa RECETTE (`src/build/objet-crafte.mjs`).
         ⛔ La bourse est vérifiée AVANT tout geste : rien n'est écrit à moitié. */
      surEnvoyer: (e) => {
        /* ⭐ LOT 277 — UNE VARIANTE : la ligne pointe sur le PLAN, et porte le mot de sa
           variante. ⛔ Même porte que l'arme : la bourse d'abord, rien écrit à moitié. */
        if (e.variante) {
          const refPlan = refDuRecord.get(e.plan);
          if (!refPlan) {
            ficheX5 = { ...ficheX5, alerte: "This item cannot be saved: it is missing from the rules." };
            montrer("x5");
            return;
          }
          if (e.cout && !bourseCouvre(bourse, e.cout)) {
            ficheX5 = { ...ficheX5, alerte: "Not enough coin in the purse." };
            montrer("x5");
            return;
          }
          if (e.cout) actArbitre({ kind: "payer", cout: e.cout });
          const nomDuPerso = docu && typeof docu.name === "string" ? docu.name.trim() : "";
          actArbitre({ kind: "addGearLine", ref: refPlan, quantity: e.cote.qte,
            equipped: e.destination === "self", location: e.destination,
            recette: { variante: e.variante.mot,
              note: e.status === "Crafting" && nomDuPerso ? `Crafted by ${nomDuPerso}` : null } });
          ficheX5 = null;
          montrer("r");
          return;
        }
        const refBase = refDuRecord.get(e.base);
        const refs = (e.pouvoirs || []).map((r) => refDuRecord.get(r));
        if (!refBase || refs.some((r) => !r)) {
          ficheX5 = { ...ficheX5, alerte: "This item cannot be saved: a part of it is missing from the rules." };
          montrer("x5");
          return;
        }
        if (e.cout && !bourseCouvre(bourse, e.cout)) {
          ficheX5 = { ...ficheX5, alerte: "Not enough coin in the purse." };
          montrer("x5");
          return;
        }
        if (e.cout) actArbitre({ kind: "payer", cout: e.cout });
        const nomDuPerso = docu && typeof docu.name === "string" ? docu.name.trim() : "";
        actArbitre({ kind: "addGearLine", ref: refBase, quantity: e.cote.qte,
          equipped: e.destination === "self", location: e.destination,
          recette: {
            bonus: e.bonus ? e.bonus.mot : null,
            pouvoirs: refs,
            plan: refDuRecord.get(plan) || null,
            /* ⭐ « forgé par » — une ligne sans effet de jeu, qui suit l'objet quand il
               change de main. ⛔ Seulement pour un objet FABRIQUÉ : acheté ou trouvé,
               personne ne l'a forgé ici. */
            note: e.status === "Crafting" && nomDuPerso ? `Crafted by ${nomDuPerso}` : null,
          } });
        ficheX5 = null;
        montrer("r");
      },
    });
    return noeud;
  }

  /* ⭐ LA FICHE X1 D'APERÇU — le même organe que X1, en mode `apercu`. Son nom, son prix et
     son texte viennent des MÊMES fonctions que la ligne que `Send` posera : `nomCrafte`,
     `valeurDUnObjetCrafte`, `recordProse(…, recette)`. ⛔ Aucune troisième composition. */
  function construireApercuX5() {
    const a = apercuX5;
    const qte = a.cote && a.cote.qte ? a.cote.qte : 1;
    /* ⭐ LOT 277 — l'aperçu d'une VARIANTE : le plan porte le texte, la variante le nom, le
       prix et sa ligne — par les MÊMES portes que la ligne posée. */
    if (a.variante) {
      const recette = { kind: "item", variante: a.variante.mot };
      const { cout, poids, rarete, craft } = valeurDUneRecette(a.plan, recette);
      const coutLu = parseCout(cout || "");
      const { noeud } = construireLaFicheX1({
        apercu: true,
        objet: {
          index: -1, nom: a.nom, qte,
          prixUnite: cout || "",
          prixTotal: coutLu ? formatCout(multiplieCout(coutLu, qte)).toLowerCase() : "",
          poidsUnite: poids || "", poidsTotal: "",
          prose: proseDUneRecette(a.plan, recette),
          rarete: rarete || "", noteCraft: texteDeLaNote(craft),
          genre: "item", equipped: false, attuned: false, locked: false,
        },
        surPorte: (porte) => { if (porte === "close") { apercuX5 = null; montrer("x5"); } },
      });
      return noeud;
    }
    const bonus = a.bonus ? a.bonus.mot : null;
    const planRec = ficheX5 ? (ficheX5.planRecord || cherche.record(ficheX5.plan)) : null;
    const refBase = refDuRecord.get(a.base);
    const recette = { kind: refBase ? refBase.kind : "", bonus, pouvoirs: a.pouvoirs, plan: planRec };
    const { cout, poids, rarete, craft } = valeurDUneRecette(a.base, recette);
    const coutLu = parseCout(cout || "");
    const { noeud } = construireLaFicheX1({
      apercu: true,
      objet: {
        index: -1, nom: a.nom, qte,
        prixUnite: cout || "",
        prixTotal: coutLu ? formatCout(multiplieCout(coutLu, qte)).toLowerCase() : "",
        poidsUnite: poids || "", poidsTotal: "",
        prose: proseDUneRecette(a.base, recette),
        /* ⚖️ LOT 280 — l'objet en création porte sa rareté et sa note, comme celui qu'on pose */
        rarete: rarete || "", noteCraft: texteDeLaNote(craft),
        genre: refBase ? refBase.kind : "", equipped: false, attuned: false, locked: false,
      },
      surPorte: (porte) => { if (porte === "close") { apercuX5 = null; montrer("x5"); } },
    });
    return noeud;
  }

  function construireVue(vue) {
    if (vue === "x1-apercu" && apercuX5 && ficheX5) return construireApercuX5();
    if (vue === "r") return construireWares();
    if (vue === "x5" && ficheX5) return construireX5Vue();
    if (vue === "x1" && ficheX1 !== null) return construireX1();
    if (vue === "x2" && ficheEnCours) {
      /* ⛔ LE RETOUR EST REÇU, PAS DÉCIDÉ : la fiche rend Wares avec son rayon, sa
         sous-catégorie et sa page — 📏 mesuré au navigateur le 20/09, et le lot 242
         n'y a pas touché. Seul le nom de la vue a changé. */
      return construireLaFicheX2({ liste: ficheEnCours.liste, index: ficheEnCours.index,
        bourse, motBourse: motDeLaBourse(docu), onAction: actArbitre, fermer: () => montrer(ficheEnCours.retour || "r"),
        /* ⭐ LA PORTE DU CRAFT — l'étape SAIT ce qui se crafte (par `craft.mjs`), l'écran
           demande. ⛔ Aucune liste de plans : `Weapon`, `Armor` et `Shield, +1…`
           s'ouvrent parce qu'ils offrent une base ET un bonus, lus dans leur record. */
        peutCrafter: (ref) => seCrafteDansX5(cherche.record(ref), basesDuCraft, magiquesDuCraft),
        /* ⭐ LOT 263 — l'ouverture vient de `ouvertureX5` : un pouvoir à base multiple
           ouvre le plan de SA famille, pouvoir déjà posé. ⛔ Le pilote ne décide rien. */
        ouvrirCraft: (ref) => {
          const o = ouvertureX5(cherche.record(ref), magiquesDuCraft, basesDuCraft);
          if (!o) return;
          ficheX5 = { plan: { kind: "item", id: o.plan.id || ref.id }, planRecord: o.plan,
                      choix: o.choix, retour: "x2" };
          montrer("x5");
        } });
    }
    if (vue === "recherche") {
      /* le catalogue ENTIER, habillé une fois — et « once found, takes you
         directly to item menu » : un résultat ouvre X2, qui REVIENT ici. */
      const catalogue = cherche.tous().map(ficheItemAvec(cherche.valeur));
      return renderRecherche({ catalogue,
        onOuvrirFiche: (liste, index) => ouvrirLObjet(liste, index, "recherche"),
        retour: () => montrer("r") });
    }
    if (vue === "b2" || vue === "sb32") {
      /* le panier du document, HABILLÉ pour l'écran : nom et prix viennent du
         record — le document ne stocke que la ref, jamais un tarif recopié. */
      const panier = currentCartLines(docu).map((l) => {
        const rec = cherche.record(l.ref);
        return { ...l, nom: (rec && rec.name) || motDUnRecordAbsent(l.ref.id),
          cout: parseCout(cherche.valeur(rec).cout) };
      });
      const motBourse = motDeLaBourse(docu);
      if (vue === "b2") return renderB2({ mode: "cart", lignes: panier, bourse, motBourse, onAction: actArbitre, retour: () => montrer("r") });
      return renderB2({ mode: "send", lignes: panier, bourse, motBourse, onAction: actArbitre, retour: () => montrer("gear") });
    }
    if (vue === "sac") return construireSac();
    if (vue === "sb31" || vue === "sb33") {
      const lieu = vue === "sb33" ? "storage" : "backpack";
      return renderSacs({ lieu, lignes, chercheRecord: (ref) => ({ data: cherche.record(ref)?.data }),
        onAction: actArbitre, retour: () => montrer("gear"),
        surLieu: (l) => { if (l === "backpack") montrer("sb31"); else if (l === "storage") montrer("sb33"); else montrer("gear"); } });
    }
    /* ⚖️ X0 REMPLACE GEAR, ⛔ elle ne se pose plus dessus — et c'est BORNÉ à
       cette vue-ci : Wares, X1, X2 et la recherche restent atteignables. ⭐ Elle
       prend la place de `construireGear()` exactement comme X1 prend celle de
       Wares : une vue, pas un calque. */
    if (!departRepondu(docu) && currentClassRef(docu)) return construireX0();
    return construireGear();
  }

  function peindre() {
    swapContent(section, [construireVue(vueEquipement)]);
    /* ⭐ ET LE RUBAN DE DALLES SE POSE ICI AUSSI — ⛔ pas « plutôt qu'à la coquille » : EN PLUS.
       Un changement de section repeint par ce chemin-ci, où la section est déjà montée ;
       un changement de vue passe par la coquille, qui reconstruit l'étape DÉTACHÉE avant
       de l'insérer. 🔴 Les deux existent, mesurés à l'écran, et n'en câbler qu'un laissait
       le ruban à zéro une fois sur deux. ⭐ Le placement se relit avant de se consommer,
       donc l'appel qui écrit dans le vide ne mange pas celui de l'autre. */
    poserLesDalles();
    /* ⭐ ET LES ROUES DE WARES SE POSENT ICI AUSSI, pour la MÊME raison que les dalles du
       sac : un ruban placé sur un nœud détaché ne bouge pas. ⛔ Les deux chemins de
       repeint existent — celui-ci, section déjà montée, et celui de la coquille, qui
       reconstruit l'étape détachée — et n'en câbler qu'un laisse le ruban à zéro une
       fois sur deux. C'est mesuré, sur le sac, au lot 214. */
    poserLesRoues();
  }
  /* ⭐ LE DERNIER REPEINT EST TOUJOURS CELUI-CI — c'est par lui qu'un geste commencé
     deux rendus plus tôt retrouve l'écran vivant. ⛔ Sans cette ligne, le lâcher d'un
     déplacement peignait dans un nœud détaché. */
  repeindreLeSac = peindre;
  peindre();
  return section;
}

/** LE PALIER — un seul, et il est toujours prêt : **rien n'est obligatoire
 *  ici**. Un personnage sans équipement est incomplet, pas fautif — et le
 *  moteur ne refuse rien sur ce chemin (mesuré : aucune violation
 *  `gear.*`). */
export function equipmentValidate() {
  return { exists: true, ready: true, action: null, next: "step" };
}

/* ══ L'ÉCRAN R — LA CARTE, ET ELLE VIENT DU BANC ══════════════════════════
   ⭐ LA COUTURE ANNONCÉE DEPUIS LE LOT 88 EST FAITE (2026-08-23). Eric :
   *« le bloc qu'on construit sera importé dans le builder à un moment. Mais
   on finit R avant. »* R est fini, le bloc arrive. `ecran-r.html` ne le
   DÉFINIT plus, il l'IMPORTE — il n'en existe donc qu'une écriture, et le
   banc ne peut plus montrer autre chose que le builder.
   ⛔ Ce qui est resté au banc est l'ÉCHAFAUDAGE : le belt en image et le
   relevé de hauteur. Ils servent à REGARDER la carte, pas à la faire.

   ⚠️ `elt` N'EST PAS `el`, ET C'EST VOULU. `el` de ce fichier prend des
   ENFANTS ; le bloc venu du banc écrivait un TEXTE. Traduire cent appels à la
   main, c'est cent occasions de se tromper — on garde donc la petite fonction
   qui parle sa langue, à côté de celle qui parle la nôtre. */
function elt(balise, classe, texte) {
  const n = document.createElement(balise);
  if (classe) n.className = classe;
  if (texte !== undefined) n.textContent = texte;
  return n;
}

/** Les trois cibles de R (vault, « FHPCv2 écrans équipement » §2).
 *  ⏳ `TO GEAR DROP → B1` est une LECTURE non tranchée (§5.1 du même fichier) :
 *  R1 l'affiche, il ne la décide pas. */
/* ⭐ LE TITRE DE R (Eric a demandé un titre le 24/08 ; « Browser » retenu :
   le cœur de l'écran est de PARCOURIR — les roues font ça — la recherche est
   l'outil qu'on invoque à la loupe, l'ajout passe par la fiche. « Carrousel »
   évoqué puis écarté par lui-même. UN mot à changer ici s'il tranche autre
   chose.) */
export const TITRE_R = "Equipment Browser";

const COLLECTEURS = [
  { creneau: "craft", mot: "CRAFT DROP", vers: "B4" },
  { creneau: "shopping", mot: "SHOPPING LIST", vers: "B2" },
  { creneau: "gear", mot: "TO GEAR DROP", vers: "B1" }
];
const BOUTONS = ["GEAR", "CART", "CRAFT", "NEXT"];

/**
 * MONTE LA CARTE DE L'ÉCRAN R — les quatre morceaux, dans l'ordre du croquis.
 * @param {object} organes
 * @param {Element} organes.tambour  le nœud `.equipment-drum` DU PRODUIT
 * @param {Element} organes.grille   le nœud `.equipment-grille` DU PRODUIT
 * @returns {{ noeud: Element, mesurer: Function }}
 */
export function construireLaCarteR({ tambour, grille }) {
  const noeud = elt("section", "carte-r");
  /* le titre de l'écran — discret, au-dessus du tambour */
  noeud.append(elt("h2", "carte-r-titre", TITRE_R));
  /* 🔍 LA LOUPE — coin inférieur droit (Eric, 24/08) : elle INVOQUE l'écran
     de recherche, branché par le pilote (data-mot, comme GEAR et CART). */
  const loupe = elt("button", "carte-r-loupe", "🔍");
  loupe.type = "button";
  loupe.dataset.mot = "LOUPE";
  loupe.setAttribute("aria-label", "Find equipment");
  noeud.append(loupe);
  /* L'écran porte la LETTRE, ce qui vit dedans porte son NOM (`CADRES.md` §2).
     ⛔ Un objet n'écrit jamais de lettre — d'où `data-objet` sur la carte, et
     `data-ecran` sur ce qui l'entoure. Ici le banc tient lieu d'écran. */
  noeud.dataset.objet = "carte";
  const corps = elt("div", "carte-r-corps");

  /* ⛔ PLUS DE BARRE DE RECHERCHE : le nœud est parti avec sa feuille de style
     (Eric, 23/08 — *« dégage search »*). */

  /* 3 — LES COLLECTEURS. */
  const collecteurs = elt("div", "carte-r-collecteurs");
  collecteurs.dataset.sim = "oui";
  for (const c of COLLECTEURS) {
    const cible = elt("div", "carte-r-collecteur");
    cible.dataset.creneau = c.creneau;   // ⭐ la SEULE chose que glisser.mjs demande d'une cible
    cible.dataset.vise = "false";
    cible.append(elt("span", null, c.mot), elt("em", null, c.vers));
    collecteurs.append(cible);
  }

  /* 4 — LES BOUTONS. ⛔ Plus de `data-sim` : GEAR, CART, NEXT et leurs suites
     sont branchés par le PILOTE (`renderEquipmentStep`) — CRAFT reste inerte
     (le mandat du 24/08 l'exclut). NEXT y déclare le verbe `done` (lot 198 :
     il « appartenait à la coquille », qui ne le câblait pas). Le compteur du
     CART (croquis) vit dans `data-compte`, peint par la feuille. */
  const boutons = elt("div", "carte-r-boutons");
  for (const mot of BOUTONS) {
    const b = elt("button", "carte-r-bouton", mot);
    b.type = "button";
    b.dataset.mot = mot;
    boutons.append(b);
  }

  /* ⛔ LA FICHE-MAQUETTE A DÉGAGÉ (24/08) : B1 est un ÉCRAN à part entière
     (`equipement-pipeline.mjs`), plus un recouvrement de la carte. Le stub
     `carte-r-b1` n'avait qu'un nom et quatre boutons morts — le garder aurait
     fait vivre DEUX fiches, dont une qui ment. */

  corps.append(tambour, grille, collecteurs, boutons);
  noeud.append(corps);

  /* ══ LES DEUX SOINS À DONNER AUX CASES, ET ILS SE REDONNENT ═════════════
     🔴 UNE SEULE PASSE NE SUFFIT PAS, MESURÉ : la grille se REMPLIT toute
     seule 500 ms après l'arrêt d'une roue, et à chaque page. Les yeux retirés
     au montage étaient tous revenus — 15 sur 15 — au premier tour de roue.
     C'est donc un observateur qui les tient, jamais un geste unique.
       · L'ŒIL DISPARAÎT — Eric, 23/08 : *« y'a pas besoin d'œil ; par un clic,
         la page B1 s'affiche en FF »*. Retiré du RENDU, jamais du produit — et
         le jeton reprend alors toute la largeur de sa case, ce qui est la
         vraie géométrie de cette décision.
       · LE JETON S'ARME, avec l'organe de glisser du dépôt et pas une seconde
         écriture du geste.
     ⚠️ Retirer un nœud ici réveille l'observateur une seconde fois ; la passe
     suivante ne trouve plus rien et s'arrête. */
  /* ══ ⛔ LES COMPTES ONT QUITTÉ LES CRANS — Eric, 2026-08-23 ═══════════════
     *« enlève les chiffres tout moches à droite des items dans le tambour »*.
     Ils s'écrivaient en `::after` sur chaque cran : « Armor 13 », « Gear 82 »,
     « Magic Items 258 ».

     ⚠️ ET C'EST UN REVIREMENT, PAS UNE ÉVIDENCE — il faut le dire, sinon un lot
     suivant les remettra en citant la règle. Le 21/08 Eric avait demandé
     l'inverse, mot pour mot : *« Vêtements 32 »*, pas *« Vêtements »* — « une
     catégorie affiche toujours son compte », pour que le joueur sache ce qui
     l'attend avant de cliquer (vault, `FHPCv2 rangement equipement`).
     ⭐ CE QUI A CHANGÉ ENTRE LES DEUX, ET CE N'EST PAS L'AVIS : c'est L'ÉCRAN.
     Le 21/08 le cran était un libellé dans une liste. Depuis, il est un cran de
     ROUE qui passe sous le viseur, à 48 px de haut, entre deux voisins à demi
     effacés — un chiffre collé au libellé y devient du bruit qui défile.
     ⏳ LE BESOIN DE 21/08 RESTE OUVERT : « savoir ce qui attend avant de
     cliquer » n'a plus de réponse dans cet écran. À trancher par Eric — le
     compte revient ailleurs, ou la règle du 21/08 meurt.
     ⛔ Le compteur de PAGES `x/x` n'est pas concerné : il vit dans la gouttière
     droite de la grille, il compte des pages, et Eric l'a explicitement gardé
     quand le titre de l'étagère a dégagé. */


  const armes = new WeakSet();
  function soignerLesCases() {
    for (const oeil of grille.querySelectorAll(".grille-oeil")) oeil.remove();
    for (const jeton of grille.querySelectorAll(".grille-jeton")) {
      if (armes.has(jeton)) continue;
      armes.add(jeton);
      armerJeton(jeton, {
        /* ⭐ LE STANDARD DU CROQUIS, EN ENTIER (24/08) : tap → B1 la fiche ·
           lâcher sur SHOPPING LIST → le panier (on saute B1) · sur TO GEAR
           DROP → B1 (le seul des trois qui passe par la fiche, vault §5.1) ·
           sur CRAFT DROP → rien encore (le mandat exclut le craft), la cible
           accuse réception et c'est tout. Le PILOTE fait les actes — la carte
           ne connaît ni le panier ni les écrans, elle publie le geste. */
        onTap: () => {
          const item = itemsDeLaPage.get(jeton.dataset.refId);
          if (item && piloteEquipement) piloteEquipement.ouvrirFiche(item);
        },
        onDepot: (creneau) => {
          const cible = collecteurs.querySelector(`[data-creneau="${creneau}"]`);
          if (cible) {
            cible.dataset.recu = "oui";
            setTimeout(() => { delete cible.dataset.recu; }, 900);
          }
          const item = itemsDeLaPage.get(jeton.dataset.refId);
          if (!item || !piloteEquipement) return;
          if (creneau === "shopping") piloteEquipement.mettreAuPanier(item);
          if (creneau === "gear") piloteEquipement.ouvrirFiche(item);
        }
      });
    }
  }
  soignerLesCases();
  if (typeof MutationObserver === "function") new MutationObserver(soignerLesCases).observe(grille, { childList: true, subtree: true });

  /** LE BUDGET DE HAUTEUR — ce que le cadre offre, ce que les six morceaux
   *  prennent. ⛔ Un dépassement ne se rattrape pas par un défilement : il se
   *  NOMME, et on demande au contenu ce qu'il porte en trop. */
  function mesurer() {
    const style = getComputedStyle(noeud);
    const dispo = noeud.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    const pris = [...corps.children].reduce((somme, n) => {
      const s = getComputedStyle(n);
      return somme + n.offsetHeight + parseFloat(s.marginTop) + parseFloat(s.marginBottom);
    }, 0);
    return { dispo: Math.round(dispo), pris: Math.round(pris) };
  }

  return { noeud, mesurer };
}
