/* ══ L'ÉTAPE UNIVERSE & LAYERS — lot 54 ═══════════════════════════════════
   Le second des deux derniers placeholders — et celui qui clôt le builder
   (§0 de la commande : « Concept » porte nom/genre/alignement, « Universe &
   Layers » porte les couches, la langue de la fiche, les unités et le nom
   de code de campagne).

   ⛔ HORS PÉRIMÈTRE, VOULU (commande §0) : « UI · couleurs ». `tokens.css`
   n'a aucun sélecteur `[data-theme]` — la bascule de thème n'existe pas
   encore, et une couleur d'interface n'entrerait de toute façon JAMAIS dans
   le document (`fh-char/1` s'exporte/s'importe ; un thème embarqué
   repeindrait le builder de celui qui importe). Ni l'un ni l'autre n'est
   dans ce fichier.

   ── LES RÈGLES : DEUX PILES NOMMÉES, PAS UN ÉDITEUR (commande §2b) ───────
   Le schéma dit « l'ORDRE EST LA PILE : première entrée = base (SRD),
   dernière = la plus forte ». Cet écran ne compose donc RIEN à la main :
   deux boutons, « SRD » (`srd-5.2.1-en` seule) et « SRD + FH » (les cinq
   couches que `engine.mjs` monte). Changer de pile est un geste à DEUX
   temps dans `layers` (`enable`/`disable` sur les quatre couches FH) suivi
   d'un `document.build.layers = []` : `src/build/block.mjs` (`rebuild`)
   ADOPTE alors la pile montée sans rien écraser — c'est écrit noir sur
   blanc dans son commentaire (« adopter la pile montée n'écrase aucune
   décision »). Aucun verbe `build`/`doc` ne pose `build.layers` : c'est un
   champ STRUCTUREL, pas un point de décision (`build.set` n'écrit que
   `build.choices`) — ce module (via `shell.mjs`) le manipule directement,
   comme le schéma lui-même le permet (« l'écran ne compose pas la pile, il
   CHOISIT parmi deux »).
   🔄 LES DEUX BOUTONS SONT PARTIS DE R : un interrupteur le 08/09, puis `Layers`
   (lots 188-189), et depuis le lot 350 (Eric, 29/09) R ne fait plus que LIRE la
   pile (`Rules`, `Books`). Le geste à deux temps décrit ici est celui de
   `monterLesCouches` (shell.mjs), que `Layers` déclenche.

   ── CE QUE LE CHANGEMENT DE PILE FAIT À UN PERSONNAGE DÉJÀ CONSTRUIT
   (commande §2b, ⚠️ MESURÉ — voir INVENTAIRE-LOT-54.md pour le détail) ─────
   Passer de SRD+FH à SRD NE PERD RIEN dans `document.build.choices` — les
   choix FH (dons, arcanes, budgets d'espèce) restent tels quels sur le
   document, et reviennent exactement comme avant dès qu'on repasse à
   SRD+FH (mesuré : les mêmes `unconsumed` avant/après un aller-retour).
   Ce qui se dégrade, c'est le PERSONNAGE RÉSOLU pendant que la pile est
   réduite : `validate()` nomme alors `choice.ref-missing` (un don ou une
   arcane FH ne pointe plus vers rien) et `skill-grant.count-mismatch`
   (le budget de compétence d'espèce que FH ajoutait disparaît). Ce n'est
   donc pas une PERTE DE DONNÉES (rien n'est effacé, `confirm.mjs` ne sert
   donc PAS à protéger contre une destruction), mais un passage à un état
   dégradé et NOMMABLE — la confirmation ci-dessous NOMME ce qui cesse de
   s'appliquer, dans le même esprit que Class (lot 46) même si la raison
   diffère (là, une perte réelle ; ici, une pause réversible). */

import { renderConfirmDialog } from "./confirm.mjs?v=916";
/* ⭐ LE MOT D'UN ÉCHELON — importé, jamais refait. `echelle.mjs` est la SEULE
   déclaration des noms de crans (garde : `tests/fraction-d-ecran.test.mjs`),
   et un écran qui joindrait lui-même les libellés en serait une seconde.
   ⛔ C'est bien un FORMATAGE qu'on importe, pas un calcul : l'arithmétique de
   l'échelle est faite par la coquille, cet écran reçoit l'état tout prêt. */
import { motDeLEchelon } from "./echelle.mjs?v=916";
/* ⭐ LOT 188 — l'organe interrupteur, la place réservée et l'écran `Layers`
   vivent dans `layers-ecran.mjs`, qui importe en retour les listes de couches
   d'ici (voir sa tête : aucun export n'est lu au chargement, dans aucun sens). */
/* ⚖️ LOT 350 — le VOYANT a quitté l'import : R ne porte plus la ligne des règles
   (le voyant SRD et l'interrupteur Fate's Hand vivent dans `Layers`, lots 188 et 189). */
import { interrupteur, ligneReservee, renderLayersEcran, compositionFh } from "./layers-ecran.mjs?v=916";
/* ⚖️ LOT 350 — le MOT COURT d'un livre, pour la ligne `Books` de R. La table est une
   feuille sans import (`interrupteurs.mjs`) : la lire ici n'ouvre aucun cycle. */
import { LIVRES_DU_JOUEUR } from "./interrupteurs.mjs?v=916";
/* 🗄️ LOT 195 — le rang B `characters` EST le magasin de sauvegardes, et son
   rendu vit dans son propre fichier (même déménagement que `Layers` au 188).
   ⛔ Aucun export n'est lu au CHARGEMENT de part et d'autre : `magasin-ecran`
   n'importe rien d'ici, donc pas de cycle à arbitrer. */
import { renderMagasinEcran } from "./magasin-ecran.mjs?v=916";

/** Les SEPT couches que `engine.mjs` monte TOUJOURS — la pile « SRD + FH ».
 *  MÊME liste que `LAYER_FILES` de `engine.mjs`, mais ici ce sont les IDs de
 *  couche (`layer.id`), pas des noms de fichier : c'est ce que
 *  `layers.verbs.enable/disable({id})` et `document.build.layers[].id`
 *  emploient.
 *  ⚠️ LOT 77 — `fh-fiche-en` et `fh-lore-en` entrent ici EN MÊME TEMPS que
 *  dans `engine.mjs`, et ce n'est pas un détail de tenue de liste : sans
 *  elles, la pile réelle (7) ne correspondait plus à la pile nommée (5) et
 *  l'écran Universe accusait TOUT personnage d'avoir une pile hors des deux
 *  jeux de règles — mesuré au navigateur, le message rouge s'affichait sur
 *  le personnage d'exemple lui-même. Un garde tient désormais les deux
 *  listes ensemble (`tests/fiche-360.test.mjs`, garde 3). */
export const SRD_LAYER_ID = "srd-5.2.1-en";

/* 🗄️ LOT 350 — `LIVRE_FH_WEB` EST PARTI AVEC LE LIVRE DU MENU. Eric, 29/09, à la
   question « le pied actuel de R (le livre FH Web, le `?`) » : *« pas de livre ni de
   ? dans l'étape Menu »*. L'adresse ne servait qu'à ce bouton. */

/** 🔴 LA TROISIÈME COUCHE, ET ELLE N'EST DANS AUCUN DES DEUX CAMPS (lot 95).
 *  `srfh` porte ce qui est AMBIGU — les ajustements de confort qui font
 *  tourner le système sans amputer personne. Le test d'Eric porte sur le NOM :
 *  *« si on change ça, est-ce que ça s'appelle encore le SRD ? »*. Ranger un
 *  objet sur une étagère : **on ne sait pas** — donc `srfh`, ni SRD ni FH.
 *
 *  ⭐ ELLE EST DONC MONTÉE DANS LES DEUX PILES NOMMÉES, et ce n'est pas une
 *  commodité : la bascule de `shell.mjs` n'active/désactive que `FH_LAYER_IDS`,
 *  donc `srfh` ne bouge jamais. Un joueur en « SRD seul » garde son tambour ;
 *  sans elle, l'écran d'équipement serait VIDE dans ce mode — le rangement est
 *  de la NAVIGATION, pas une règle de jeu.
 *
 *  ⏳ ET C'EST UNE DÉCISION QUI PEUT SE RENVERSER, elle est nommée ici pour ça :
 *  si Eric veut qu'« SRD seul » veuille dire « rien qui ne soit dans le livre »,
 *  cette liste sort de la pile `srd` — et il faudra alors répondre à ce que
 *  devient le tambour. */
export const SRFH_LAYER_IDS = ["srfh-shelving-en", "srfh-mecaniques-en"];

/* ⭐ LOT 179 — `fh-soulforging-en` entre ici EN MÊME TEMPS que dans
   `engine.mjs`, MÊME PLACE et MÊME ORDRE : c'est la leçon du lot 77, où la
   pile réelle (7) ne correspondait plus à la pile nommée (5) et l'écran
   accusait TOUT personnage d'avoir une pile hors des deux jeux de règles. */
/* ⭐ LOT 181 — `fh-gems-en` (les 54 gemmes) entre ici EN MÊME TEMPS que dans
   `engine.mjs` et `exemple-fh-en.mjs`, MÊME PLACE et MÊME ORDRE. */
/* ⭐ LOT 184 — `fh-trainings-en` et `fh-inheritance-en` entrent ici EN MÊME
   TEMPS que dans `engine.mjs` et `exemple-fh-en.mjs`, MÊME PLACE et MÊME
   ORDRE. Elles sortent de `fh-skills-en`, qui portait trois interrupteurs à
   la fois ; les Trainings avant l'Inheritance, parce que les langues que
   l'Inheritance offre sont des records des Trainings. */
export const FH_LAYER_IDS = [
  "fh-species-en", "fh-skills-en", "fh-trainings-en", "fh-inheritance-en",
  "fh-arcana-en", "fh-feats-en", "fh-spells-en",
  "fh-soulforging-en", "fh-gems-en", "fh-munitions-en", "fh-fiche-en", "fh-lore-en"
];

/** 🔴 LES LIVRES DU JOUEUR — UN AXE, PAS UN MEMBRE DE LA PILE NOMMÉE (09/09).
 *
 *  ⚖️ Eric : *« que tu puisses désactiver dmg player et toujours te raccrocher
 *  au SRD »*, *« tu dois pouvoir les activer et les désactiver »*, *« ils seront
 *  visibles dans le menu »*.
 *
 *  ⛔ LA MINE QUE ÇA DÉSAMORCE, ET ELLE ÉTAIT ARMÉE. `currentStack` compare la
 *  pile déclarée aux deux piles nommées par ÉGALITÉ EXACTE DE L'ENSEMBLE.
 *  Monter `xdmg-en` aurait donc rendu `null` — et `ecran-mort.mjs:97` renvoie
 *  l'écran mort dès que `currentStack` rend `null` sur un document qui a des
 *  couches. TOUT personnage aurait affiché « pile inconnue » à la seconde où le
 *  joueur allume son DMG. C'est exactement le défaut du lot 77 que le
 *  commentaire de `FH_LAYER_IDS` raconte, à un livre près.
 *
 *  ⭐ LA FORME JUSTE : les livres sont ORTHOGONAUX aux règles. « SRD » et
 *  « SRD+FH » nomment un jeu de RÈGLES ; le PHB et le DMG apportent du
 *  CONTENU. On peut jouer SRD avec le DMG allumé, ou Fate's Hand sans aucun
 *  livre. Le nom de la pile se lit donc SANS eux, et les livres se lisent à
 *  part (`currentBooks`). ⛔ Les mêler ferait 2 × 4 = huit noms de pile pour
 *  deux jeux de règles.
 *
 *  ⚠️ L'ORDRE COMPTE QUAND MÊME : une couche livre se monte AU-DESSUS du SRD
 *  et EN DESSOUS des couches FH — c'est ce qui fait que FH recouvre le livre
 *  (« on superpose ») et non l'inverse. Cet ordre vit dans le manifeste, pas
 *  ici : cette liste ne dit QUE quels ids sont des livres. */
export const LIVRE_LAYER_IDS = ["xphb-en", "xdmg-en"];

/** 🔴 LES COUCHES DE RÈGLES — ET C'EST LA SEULE LISTE QUI NOMME LA PILE.
 *
 *  ⚖️ Eric, 09/09, et c'est une ÉPREUVE, pas une affirmation :
 *  *« SI ON A BIEN FAIT NOTRE BOULOT, les livres rajoutent du homebrew. »*
 *
 *  🔴 CE QU'ELLE M'A FAIT VOIR, ET C'ÉTAIT MON PROPRE CODE D'IL Y A UNE HEURE.
 *  J'avais retiré les livres du nom de la pile en les nommant : une liste
 *  `LIVRE_LAYER_IDS` en dur, consultée par `currentStack`. ⛔ C'est exactement
 *  le cas particulier que sa phrase interdit — si un livre n'est que du
 *  homebrew, la pile n'a pas à connaître son nom. Le jour où un joueur monte
 *  la classe qu'un ami lui a écrite, elle ne serait dans aucune liste, et
 *  l'écran mort reviendrait pour lui seul.
 *
 *  ⭐ LA FORME JUSTE EST L'INVERSE : on ne liste pas ce qu'on IGNORE, on liste
 *  ce qui COMPTE. Le nom de la pile se lit sur les couches de RÈGLES et sur
 *  elles seules ; tout le reste — livre, homebrew, ce qui n'existe pas encore —
 *  est du CONTENU et n'a aucun effet sur le nom.
 *
 *  ⚠️ ET LE GARDE N'EST PAS DESSERRÉ POUR AUTANT : ce qui rend une pile
 *  innommable, c'est une couche de RÈGLES QUI MANQUE — pas une couche de
 *  contenu EN TROP. C'était déjà le vrai sujet de l'écran mort ; la liste des
 *  livres ne faisait que le brouiller. */
export const RULE_LAYER_IDS = [SRD_LAYER_ID, ...SRFH_LAYER_IDS, ...FH_LAYER_IDS];

/** Les couches de CONTENU du document — livres du joueur, homebrew, tout ce
 *  qui n'est pas une règle. Dans l'ordre du document : ici il n'y a pas de
 *  liste de référence pour imposer le sien, et c'est le but. */
export function currentContent(doc) {
  const layers = (doc && doc.build && Array.isArray(doc.build.layers)) ? doc.build.layers : [];
  return layers.map((layer) => layer.id).filter((id) => !RULE_LAYER_IDS.includes(id));
}

/** Les livres du joueur présents dans le manifeste du document, dans l'ordre
 *  de `LIVRE_LAYER_IDS` — jamais dans celui, variable, du document. */
export function currentBooks(doc) {
  const layers = (doc && doc.build && Array.isArray(doc.build.layers)) ? doc.build.layers : [];
  const ids = new Set(layers.map((layer) => layer.id));
  return LIVRE_LAYER_IDS.filter((id) => ids.has(id));
}

/** La pile que `document.build.layers` DÉCLARE, réduite à l'un des deux noms
 *  de l'écran — ou `null` si elle ne correspond à AUCUN des deux (un
 *  document composé autrement, hors de ce que ce lot propose). Lue sur le
 *  DOCUMENT, jamais sur la pile montée : c'est ce que le joueur a choisi
 *  pour CE personnage, que `rebuild` l'ait déjà adopté ou non. */
export function currentStack(doc) {
  const layers = (doc && doc.build && Array.isArray(doc.build.layers)) ? doc.build.layers : [];
  /* ⭐ SEULES LES COUCHES DE RÈGLES COMPTENT (09/09). Un personnage SRD avec
     son DMG allumé — ou la classe d'un ami — joue toujours en SRD : le contenu
     apporté ne change pas le jeu de règles. ⛔ On garde ce qui COMPTE, on ne
     retire pas ce qu'on connaît : une liste de ce qu'on ignore serait toujours
     incomplète d'un homebrew que personne n'a encore écrit. */
  const ids = new Set(layers.map((layer) => layer.id).filter((id) => RULE_LAYER_IDS.includes(id)));
  /* Les deux piles portent le SRD ET `srfh` ; seules les couches FH les
     distinguent. Le compte se DÉDUIT des listes, il ne s'écrit pas à côté —
     un `5` en dur ici a déjà survécu à l'arrivée de deux couches (lot 77). */
  const pileSrd = [SRD_LAYER_ID, ...SRFH_LAYER_IDS];
  if (ids.size === pileSrd.length && pileSrd.every((id) => ids.has(id))) return "srd";
  /* Le compte se DÉDUIT de la liste, il ne se réécrit pas à côté d'elle :
     un `5` en dur ici a survécu à l'arrivée de deux couches et a fait
     accuser le personnage d'exemple (lot 77). */
  const pileFh = [...pileSrd, ...FH_LAYER_IDS];
  if (ids.size === pileFh.length && pileFh.every((id) => ids.has(id))) return "srdfh";
  return null;
}

/** Les choix du document qui pointent vers un record Fate's Hand
 *  (`ref.id` commence par `fh:`) — dons d'origine, arcanes de destinée…
 *  Ce sont ceux que la confirmation NOMME : passer à SRD les laisse en
 *  place dans `build.choices` (rien n'est effacé), mais ils cessent de se
 *  résoudre tant que les couches FH sont débrayées (mesuré, voir tête de
 *  fichier). `query` sert à afficher le NOM du record, jamais son id nu —
 *  même geste que `skillLabel` (`class-step.mjs`). */
export function fhRefChoices(doc, query) {
  const choices = (doc && doc.build && Array.isArray(doc.build.choices)) ? doc.build.choices : [];
  return choices
    .filter((choice) => choice && choice.ref && typeof choice.ref.id === "string" && choice.ref.id.startsWith("fh:"))
    .map((choice) => {
      const view = query ? query({ kind: choice.ref.kind, id: choice.ref.id }) : null;
      const name = view && view.record ? view.record.name : choice.ref.id;
      /* Certains choix portent un `label` qui est déjà le NOM du record
         (ex. l'arcane de destinée : `label: "The Hermit"`, record `The
         Hermit`), d'autres un `label` qui décrit le SLOT plutôt que le
         record (ex. le don d'origine : `label: "Origin feat"`, record
         `Auspicious (fh)`) — deux formes réelles de `build.choices`,
         aucune des deux inventée ici. N'affiche le préfixe QUE quand il
         ajoute une information que `name` ne porte pas déjà. */
      return choice.label && choice.label !== name ? `${choice.label}: ${name}` : name;
    });
}

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/* 🗄️ LOT 357 — `textField` EST PARTI : il ne portait que le champ `Campaign`, et Eric l'a
   redicté le 29/09 après-midi : *« campaign : c'est le titre de la campagne […] s'il aucun
   code de campagne n'est entré : il indique none. pas d'écart pour écrire ici »*. La ligne
   se LIT désormais (`ligneLue`, plus bas) ; le patron du champ vit dans `concept-step.mjs`. */

/* 🗄️ LOT 350 — `bouton()` EST PARTI : il fabriquait les boutons du R d'avant (le
   geste majeur, le trio du fichier, les portes du pied). Les portes du Menu naissent
   désormais par `porte()` et `placeReservee()`, plus bas, au gabarit LARGE. */

/* ⭐ LOT 188 — L'INTERRUPTEUR ET LA PLACE RÉSERVÉE ONT DÉMÉNAGÉ dans
   `layers-ecran.mjs`, l'écran qui en porte le plus (onze lignes). Ils n'ont
   pas changé de forme : ce fichier les importe, il ne les refait pas. */

/* ══ LOT 192 — « VOULEZ-VOUS GARDER UNE SAUVEGARDE DE LA VERSION FH ? » ═══
   ⚖️ Eric, 10/09, gravé dans `ARCHITECTURE.md` (§ « LE LEXIQUE », règle 5) :
   *« on peut mettre "à refaire", mais il faut que la version FH reste
   sauvegardée, donc ça duplique le perso. Au moins poser la question :
   voulez-vous garder une sauvegarde de la version FH ? »*

   📏 LE NAVIGATEUR NE GARDE QU'UN PERSONNAGE (« This browser keeps one
   character », écran `My characters`). « Garder une copie » ne peut donc être
   qu'UN FICHIER — et le geste existe : `Save` (`exportJson` → `exporterJson`,
   shell.mjs → `telecharger`, fichier.mjs). La troisième voie de la
   confirmation RÉEMPLOIE ce geste ; elle n'ouvre pas un second chemin
   d'écriture. Ce que le fichier s'appelle : `<nom>.fates-hand.fh-char.json`
   (`nomDeFichier`, review-step.mjs, et sa tête dit pourquoi la version
   entre dans le nom).

   ⚖️ LA QUESTION NE SE POSE QU'AU MAÎTRE, ET VOICI POURQUOI. Le lot 188 a
   décidé qu'un enfant se coupe SANS confirmation : une couche éteinte
   DÉGRADE, elle n'efface rien, et tout revient à l'allumage. Le maître, lui,
   CHANGE DE JEU — c'est le seul geste qui met tout Fate's Hand en pause d'un
   coup, et c'est au changement de jeu que la version FH mérite sa copie. Un
   enfant éteint (Destiny, World…) laisse le personnage dans le jeu Fate's
   Hand, dégradé d'une règle ; sa copie serait celle d'un personnage qui n'a
   pas changé de jeu. Ce lot ne touche pas à la décision du 188 : si un enfant
   doit un jour poser la question, c'est un mot d'Eric, pas un lot.

   🔴 SAUVEGARDER PUIS ÉTEINDRE, ET JAMAIS L'INVERSE — la copie doit porter
   les couches Fate's Hand ; éteint d'abord, le fichier serait la version SRD.
   Et un Save qui a REFUSÉ (le moteur pas chargé, le navigateur qui jette)
   n'éteint pas : la question était de garder la copie, pas de couper coûte
   que coûte — le refus est dit (`porteEnPanne`) et la question reste posée. */

/** Le mot de la version dans le nom du fichier sauvegardé — un slug, l'alphabet
 *  de `nomDeFichier`. Le nom du jeu (`MAITRE.label`, « Fate's Hand ») n'entre
 *  pas tel quel dans un nom de fichier : apostrophe et espace. */
export const NOM_DE_LA_VERSION_FH = "fates-hand";

/** La séquence de la troisième voie, PURE pour qu'un garde la lise sans
 *  coquille : `sauvegarder()` d'abord ; `eteindre()` seulement si elle a rendu
 *  `true`. Rend ce qui s'est passé.
 *
 *  ⏳ ELLE ATTEND DEPUIS LE LOT 195, ET C'EST LE MAGASIN QUI L'IMPOSE : ranger
 *  une entrée touche un dossier ou une base du navigateur, et les deux
 *  répondent en différé. ⛔ La seule autre issue était de décider l'extinction
 *  sur une sauvegarde NON VÉRIFIÉE — c'est-à-dire de traiter le silence comme
 *  un accord, exactement ce que la règle du 192 interdit. Le verdict reste donc
 *  un verdict ; c'est l'attente qui est neuve.
 *
 *  @param {{sauvegarder: () => Promise<boolean>|boolean, eteindre: () => void}} gestes
 *  @returns {Promise<boolean>} `true` si l'extinction a eu lieu */
export async function sauvegarderPuisEteindre({ sauvegarder, eteindre }) {
  if (await sauvegarder() !== true) return false;
  eteindre();
  return true;
}

/* ══ ⚖️ LOT 350 — « NEW CHARACTER » OUVRE UNE FENÊTRE, ET LES LAYERS FONT FOI ════
   ⚖️ Eric, 29/09 — la dictée du Menu (`FH-WEB/FHPC/FHPCv2 arborescence d'entree`,
   § « DICTÉE DU 2026-09-29 »), mot pour mot : *« tout reste dans le navigateur tant
   que tu n'as pas fait New character. Un prompt apparaît dans New disant que si tu
   veux garder l'existant il faut sauvegarder, deux choix : Delete · Save. Puis on
   arrive directement dans le 1 du processus de création. Les réglages du nouveau
   perso sont ceux des Layers en place. »* Puis, question par question — chaque
   réponse avec SA question :
   · une troisième voie, `Cancel` ? → *« Cancel aussi »* : **`Cancel · Delete · Save`** ;
   · que dit la fenêtre ? → **trois choses** : régler les Layers avant · choisir son
     stockage dans Vault · le perso en cours sera effacé ;
   · où écrit `Save` ? → **dans le stockage choisi, ou dans un fichier** si rien n'est
     réglé (aujourd'hui : le magasin, `exporterJson` — le MÊME écrivain que Sheet) ;
   · sans perso en cours ? → **la fenêtre quand même** (ses avertissements Layers et
     Vault servent au premier perso), avec **`Cancel · Start`** — ratifié ;
   · des liens vers Layers et Vault dans la fenêtre ? → ⛔ *« non, ça fait trop de liens »*.

   🗄️ CE QUI MEURT, ET IL FAUT SAVOIR CE QUE C'ÉTAIT (loi des deux âges : raconté,
   pas effacé). Lot 193 (Eric, 10/09) : `Build a character` sauvegardait le perso du
   navigateur, repartait à zéro, puis posait le popup **« SRD or Fate's Hand? »**
   (`popupDuJeu` — deux voies, `exigeUneReponse`), et c'était la RÉPONSE qui réglait
   le maître et ouvrait l'étape 1 (`creerUnPersonnage`, `choisirLeJeu`).
   ⛔ PLUS DE QUESTION : *« les réglages du nouveau perso sont ceux des Layers en
   place »* — l'état de `Layers` fait foi, et le perso naît avec la pile MONTÉE
   (`personnageNeuf`, shell.mjs). Le geste `Forget` devient le `Delete` de cette
   fenêtre ; `Build a character` devient `Create character`, qui ouvre l'étape 1 DU
   PERSO EN COURS et ne crée rien.
   🔄 LOT 357 — Eric, 29/09 après-midi : *« create Character on garde (nomme le plutôt new
   character) »*, et à « le grand bouton New character, que fait-il ? » : *« La fenêtre,
   puis l'étape 1 »*. Le grand bouton s'appelle donc `New character` et ouvre CETTE
   fenêtre ; la porte du bas du même nom disparaît (un seul organe par geste).
   ⭐ LA RÈGLE DU 192 TIENT, MOT POUR MOT : un `Save` qui a refusé n'efface RIEN. */

/** LE NOM D'UN PERSONNAGE QUI N'EN A PAS ENCORE.
 *  📏 `fh-char/1` EXIGE UN NOM D'AU MOINS UN CARACTÈRE (`name.minLength: 1`,
 *  schemas/fh-char.schema.json) : un personnage neuf ne peut donc PAS naître
 *  sans nom, et une chaîne vide serait un refus, pas un blanc.
 *  ⚖️ ET LE MOT EST CELUI D'ERIC — 2026-09-10, en entier : *« "Name
 *  character" »*. Il remplace `Unnamed character`, qui n'était qu'un défaut
 *  sobre posé faute de cote. ⭐ Le changement de mot est aussi un changement de
 *  VOIX : `Unnamed character` DÉCRIVAIT un état (« celui-ci n'a pas de nom ») ;
 *  `Name character` DEMANDE un geste. Une cote DONNÉE bat une cote déduite.
 *  🗄️ LOT 350 — son second lecteur (la ligne d'état de R, « in browser : <nom> ·
 *  saved ») est retiré par Eric le 29/09 ; il ne reste que la naissance. */
export const NOM_DU_PERSONNAGE_NEUF = "Name character";

/** LES MOTS DE LA FENÊTRE — le brouillon du plan v10 (Eric arrête les mots que le
 *  joueur lit). Un avertissement par ligne : `paintPopup` (shell.mjs) fait un
 *  paragraphe de chaque ligne. ⛔ Ni « couche » ni « homebrew » (lexique du 10/09).
 *  ⭐ L'ORDRE EST CELUI D'ERIC : Layers · Vault · le perso effacé. Le troisième ne se
 *  dit que s'il y a un perso à effacer — *« ses avertissements Layers et Vault servent
 *  au premier perso »*. */
export const MOTS_DU_NOUVEAU_PERSONNAGE = Object.freeze({
  titre: "Before you start a new character",
  avertissements: Object.freeze([
    "Set your Layers first: the new character uses them.",
    "Choose where your characters are stored, in Vault.",
    "Your current character will be erased from this browser."
  ])
});

/** CE QUI FAIT LE PERSONNAGE — le document SANS ce que la dérivation estampille à chaque
 *  démarrage : `modified` et `resolved` (le résolu se refait depuis `build` et la pile,
 *  et sa `derivation.at` porte l'heure de ce calcul).
 *  📏 MESURÉ AU BANC LE 29/09 à 05:18 (port 8977, stockage vidé, puis rechargé) : le
 *  document gardé ne diffère de l'exemple commité QUE par `modified` et
 *  `resolved.derivation.at`, tous deux à l'heure du démarrage.
 *  ⚠️ ET C'EST UNE CORRECTION : ce lot avait d'abord écrit « le `rebuild` du démarrage ne
 *  change pas une lettre de l'exemple », sans l'avoir mesuré au navigateur — la fenêtre
 *  prenait alors l'exemple intact pour un perso en cours. ⛔ Rien d'autre n'est retiré :
 *  `id`, `created`, `name`, `build`… disent tous QUI est le personnage. */
export function ceQuiFaitLePersonnage(document) {
  if (!document || typeof document !== "object") return document;
  const { modified, resolved, ...personnage } = document;
  return personnage;
}

/** Y A-T-IL UN PERSONNAGE EN COURS ? — PUR, pour qu'un garde le lise sans coquille.
 *  📏 LE NAVIGATEUR N'EST JAMAIS VIDE : le démarrage retombe sur l'exemple commité, et
 *  `memoriser()` l'écrit dans la mémoire dès le premier rendu. « Rien dans la mémoire »
 *  ne dit donc rien après le démarrage. Ce qui dit « pas de perso à moi », c'est un
 *  document qui est ENCORE l'exemple — comparé sur `ceQuiFaitLePersonnage`, jamais sur
 *  le document entier, dont l'heure change à chaque démarrage.
 *  ⛔ UN EXEMPLE QU'ON N'A PAS PU CHARGER NE PROMET RIEN : sans texte de référence, le
 *  perso est tenu pour « en cours » — la fenêtre offre alors `Cancel · Delete · Save`, et rien
 *  n'est effacé sans que le joueur l'ait choisi.
 *  @param {string|null} texteDuDocument  `canonicalText(ceQuiFaitLePersonnage(document))`, ou `null`
 *  @param {string|null} texteDeLExemple  la même chose pour l'exemple commité, ou `null` */
export function personnageEnCours(texteDuDocument, texteDeLExemple) {
  if (typeof texteDuDocument !== "string") return false;
  return typeof texteDeLExemple !== "string" || texteDuDocument !== texteDeLExemple;
}

/** LA FENÊTRE « NEW CHARACTER » — la description d'état que `paintPopup` (shell.mjs)
 *  sait déjà peindre (`{titre, role, texte, actions}`, lot 173) : ⛔ AUCUN COMPOSANT
 *  NEUF, la même voie que le popup du lot 193 qu'elle remplace.
 *  · rôle `guide` — elle prévient, elle ne dit pas d'erreur (§7 : le gendarme DIT
 *    L'ERREUR) ;
 *  · `Delete` porte `defait` — il efface, donc le rouge de ce qui coûte (§6) ;
 *  · ⛔ elle n'EXIGE pas de réponse : rien ne bouge avant qu'on choisisse, donc la
 *    fermer d'un tap dehors vaut `Cancel`. C'est la différence avec le popup du 193,
 *    qui repartait à zéro AVANT de poser sa question.
 *  ⛔ ELLE NE SAIT PAS CE QUE `choisir` FAIT — même loi que `confirm.mjs` : le
 *  composant ne connaît aucun verbe, la coquille décide.
 *  @param {{enCours: boolean, choisir: (voie: "cancel"|"delete"|"save"|"start") => void}} p */
export function popupNouveauPersonnage({ enCours, choisir }) {
  const { titre, avertissements } = MOTS_DU_NOUVEAU_PERSONNAGE;
  const voies = enCours
    ? [{ mot: "Cancel", voie: "cancel" }, { mot: "Delete", voie: "delete", defait: true }, { mot: "Save", voie: "save" }]
    : [{ mot: "Cancel", voie: "cancel" }, { mot: "Start", voie: "start" }];
  return {
    titre,
    role: "guide",
    texte: (enCours ? avertissements : avertissements.slice(0, 2)).join("\n"),
    actions: voies.map(({ mot, voie, defait }) => ({ mot, defait: defait === true, faire: () => choisir(voie) }))
  };
}

/** LA SÉQUENCE DE LA FENÊTRE, PURE pour qu'un garde la lise sans coquille — même
 *  forme que `sauvegarderPuisEteindre` (lot 192), et pour la même raison : l'ordre
 *  EST la règle, et un ordre qui ne vit que dans une coquille ne se mesure pas.
 *  · `cancel` → rien ;
 *  · `save`   → `sauvegarder()` D'ABORD ; s'il n'a pas rendu `true`, RIEN ne bouge —
 *               ni oubli, ni naissance (la règle du 192 : un Save refusé n'efface rien,
 *               et le refus a déjà été dit par `porteEnPanne`) ;
 *  · `delete` → `oublier()` : la copie du navigateur, le geste de l'ancien `Forget` ;
 *  · `start`  → rien à ranger ni à oublier : il n'y a pas de perso en cours.
 *  Puis, pour ces trois-là seulement : `naitre()` — un perso vierge, les Layers en
 *  place, l'étape 1.
 *  ⏳ ELLE ATTEND, comme le 192 et le 193 : le magasin répond en différé, et une
 *  promesse non attendue est une absence traitée comme un accord.
 *  @param {{voie: string, sauvegarder: () => Promise<boolean>|boolean, oublier: () => void, naitre: () => void}} gestes
 *  @returns {Promise<boolean>} `true` si le personnage neuf est né */
export async function nouveauPersonnageSelonLaVoie({ voie, sauvegarder, oublier, naitre }) {
  if (voie === "save") {
    if (await sauvegarder() !== true) return false;
  } else if (voie === "delete") {
    oublier();
  } else if (voie !== "start") {
    return false;
  }
  naitre();
  return true;
}

/** LA CONFIRMATION DU MAÎTRE — une seule fonction : deux rendus de « la même
 *  question » divergeraient. 🔄 LOT 351 : la coquille la peint EN FENÊTRE
 *  (`paintPopup`) depuis `pendingStack` — posée dans `Layers`, elle faisait
 *  défiler la page ; ni R ni `Layers` n'en portent plus de copie en ligne.
 *
 *  ⭐ LOT 192 — TROIS VOIES : `Keep on` (rien ne bouge) · `Save the Fate's
 *  Hand version first` (Save, PUIS l'extinction) · `Switch off` (l'extinction,
 *  sans copie — le comportement d'avant, intact). Voir la section ci-dessus. */
export function renderConfirmationPile(doc, query, onAction) {
  const affected = fhRefChoices(doc, query);
  return renderConfirmDialog({
    title: affected.length > 0
      ? "Switching Fate's Hand off will stop applying these picks (they stay saved, and resume as soon as you switch it back on):"
      : "Switching Fate's Hand off may also pause skill grants tied to species/class — nothing is deleted, and switching back restores them.",
    items: affected,
    /* 📏 Deux mots chacun : mesuré au banc le 08/09, « Keep Fate's Hand » et
       « Switch to SRD » se coupaient dans la paire de la confirmation. La
       troisième voie est plus longue et le dit en entier : elle a SA ligne,
       pleine largeur, au-dessus de la paire (`.confirm-dialog-troisieme-voie`). */
    confirmLabel: "Switch off",
    cancelLabel: "Keep on",
    troisiemeVoie: { label: "Save the Fate's Hand version first", onClick: () => onAction({ kind: "saveAndConfirmLayerStack" }) },
    onConfirm: () => onAction({ kind: "confirmLayerStack" }),
    onCancel: () => onAction({ kind: "cancelLayerStack" })
  });
}

/* 🗄️ LOT 350 — `nomDuPersonnage` EST PARTI AVEC LA LIGNE D'ÉTAT (« in browser : <nom>
   · saved »), que Eric a retirée le 29/09 : c'était son seul lecteur. Le mot de
   l'absence reste déclaré une fois, `NOM_DU_PERSONNAGE_NEUF`, pour la naissance. */

/** ⭐ UN DROPDOWN DE CHOIX — Eric, 2026-09-02 : *« Les backgrounds en drop
 *  down. »* Il remplace la rampe de bascules du lot 134, et c'est un
 *  RANGEMENT, pas un revirement : le réglage descend d'un rang (Menu ›
 *  Display) et l'organe suit le rang. Une liste de trois lignes à piste et
 *  pouce occupait 132 px dans l'écran d'entrée pour un choix qu'on fait une
 *  fois ; un dropdown en occupe 44 dans l'écran qui lui est consacré.
 *
 *  🔴 IL EST BÂTI SUR LA LISTE REÇUE, jamais sur des lignes écrites ici :
 *  c'est ce qui fait qu'une quatrième collection arrive par les DONNÉES
 *  (`assets/backgrounds.measured.json`) et ne coûte pas une ligne de ce
 *  fichier. Un `for` sur trois paires nommées en dur aurait marché
 *  aujourd'hui et menti au prochain fond.
 *
 *  ⛔ AUCUN BLOC QUAND LA LISTE EST VIDE — registre absent ou illisible : le
 *  builder sert alors la collection de `tokens.css`, et un titre « Background »
 *  suivi de rien serait un réglage qui ment. */
function renderFondChoice({ fonds, fond, onPick }) {
  if (fonds.length === 0) return el("div", "universe-fond-vide");
  const wrap = el("div", "display-bloc");
  wrap.append(el("h3", null, [text("Background")]));
  const select = document.createElement("select");
  select.className = "display-select";
  select.setAttribute("aria-label", "Background");
  for (const collection of fonds) {
    const option = document.createElement("option");
    option.value = collection.id;
    option.append(text(collection.nom || collection.id));
    if (collection.id === fond) option.selected = true;
    select.append(option);
  }
  /* ⚠️ LA VALEUR EST POSÉE EXPLICITEMENT, en plus de l'option `selected` —
     même raison qu'aux deux menus d'Identity : un navigateur déduit l'une de
     l'autre, le stub DOM de la suite non, et c'est lui qui a raison de le
     signaler. */
  select.value = typeof fond === "string" ? fond : "";
  select.addEventListener("change", () => { if (select.value !== fond) onPick(select.value); });
  wrap.append(select);
  /* ⚠️ CE TEXTE EST LU PAR UN JOUEUR : il dit ce que le réglage fait et ce
     qu'il ne fait PAS — le décor a deux images par collection, et c'est
     l'appareil qui choisit entre elles, pas cette liste. Sans cette phrase, un
     joueur en thème sombre qui choisit « Ruins » croirait avoir choisi
     l'image de nuit qu'il voit, et se demanderait où est passée l'autre. */
  wrap.append(el("p", "display-note", [
    text("Each background is a pair — one for light, one for dark. Your device picks which of the two you see. Some backgrounds also bring their own text and button colours.")
  ]));
  return wrap;
}

/* ══ 📐 LE CRAN D'INTERFACE — Eric, 2026-09-02 ═════════════════════════════
   *« Toutes les résolutions en drop down. »*

   ⚖️ ET LA RAMPE DE 2026-08-30 NE REVIENT PAS POUR AUTANT — le lot 118 l'avait
   retirée avec une raison MESURÉE : avec l'échelle continue d'alors, un cran
   choisi à la main ne pouvait que RAPETISSER le builder (1366 × 1024 : Auto
   ×1,83, « Large » ×1,25 — le libellé mentait). ⭐ Le partage d'écran fait
   tomber cette raison : l'automatique rend maintenant de ×0,96 à ×1,53, donc
   un réglage peut agrandir autant que réduire. C'est un organe NEUF sur une
   arithmétique neuve, pas une résurrection ; et la clef qu'il garde est neuve
   aussi — celles du 30/08 restent effacées à chaque lecture.

   🔴 L'AUTO EST LA PREMIÈRE LIGNE ET RESTE LE DÉFAUT. Le joueur SURCHARGE, il
   ne remplace pas, et il doit pouvoir revenir — une norme est un défaut, pas
   une dictature.

   🔴 CHAQUE LIGNE DIT CE QU'ELLE REND, en pixels, sur CETTE fenêtre : *« le
   joueur choisit une taille, pas une fraction abstraite »*. ⛔ Et c'est la
   taille APRÈS la descente de hauteur, jamais la part demandée — sinon le
   libellé mentirait précisément là où la descente mord.

   ⚠️ DEUX LIGNES PEUVENT RENDRE LA MÊME CHOSE, et c'est la vérité de la
   fenêtre, pas un défaut de la liste : sous le panneau nu tout retombe sur le
   dessin, et une fenêtre basse plafonne plusieurs crans au même endroit. La
   note le DIT quand ça arrive — un joueur qui choisit deux fois de suite sans
   rien voir changer doit savoir pourquoi. */
function renderCranChoice({ echelle, onPick }) {
  if (!echelle || !Array.isArray(echelle.offres) || echelle.offres.length === 0) {
    return el("div", "universe-cran-vide");
  }
  const cote = (rendu) => `${Math.round(rendu.largeur)} × ${Math.round(rendu.hauteur)}`;
  const wrap = el("div", "display-bloc");
  wrap.append(el("h3", null, [text("Interface size")]));
  const select = document.createElement("select");
  select.className = "display-select";
  select.setAttribute("aria-label", "Interface size");
  const choisi = echelle.choisi ? echelle.choisi.nom : "";

  /* ⭐ L'AUTO PORTE LE NOM DE CE QU'IL A CHOISI — *« elle dit lequel l'auto a
     choisi »*. Sans ça, « Auto » serait le seul libellé de la liste à ne rien
     dire, et le joueur ne saurait pas d'où il part. */
  const auto = document.createElement("option");
  auto.value = "";
  auto.append(text(`Auto — ${motDeLEchelon(echelle.auto)}, ${cote(echelle.autoRendu)}`));
  if (choisi === "") auto.selected = true;
  select.append(auto);

  for (const offre of echelle.offres) {
    const option = document.createElement("option");
    option.value = offre.barreau.nom;
    option.append(text(`${offre.barreau.libelle} — ${cote(offre.rendu)}`));
    if (offre.barreau.nom === choisi) option.selected = true;
    select.append(option);
  }
  select.value = choisi;
  /* ⛔ LA CHAÎNE VIDE VEUT DIRE « AUTO », et elle traverse telle quelle : c'est
     la coquille qui la traduit en `null` (effacer la clef). Un écran qui
     écrirait `null` ici deviendrait un second décideur de la préférence. */
  select.addEventListener("change", () => { if (select.value !== choisi) onPick(select.value); });
  wrap.append(select);

  const cotes = echelle.offres.map((o) => cote(o.rendu));
  const doublons = cotes.length !== new Set(cotes).size;
  wrap.append(el("p", "display-note", [
    text(echelle.choisi
      ? `Set by you. Auto would use ${motDeLEchelon(echelle.auto)}. The builder never grows past what the window's height can hold.`
      : "Auto follows the window: the widest share it can hold, dropped half a step at a time until the height fits.")
  ]));
  if (doublons) {
    wrap.append(el("p", "display-note", [
      text("Sizes that read the same really are: the panel never shrinks below its drawn size.")
    ]));
  }
  return wrap;
}

/** 🪟 L'ÉCRAN DISPLAY — le sous-menu du Menu (le rang B : *« Back · Done, le
 *  SEUL endroit où `Back` paraît »*, NORMES §6).
 *
 *  ⛔ IL NE PORTE PAS SA PROPRE SORTIE : `data-sortie-ici` la déclare, et
 *  c'est la coquille qui produit la paire — la même loi que l'écran d'entrée
 *  juste en dessous. Un écran qui fabriquerait son `Back` serait le doublon
 *  que le 19/08 a fait sauter partout ailleurs.
 *
 *  ⏳ CE QU'IL NE PREND PAS, ET POURQUOI : `Double view` reste dans l'écran
 *  d'entrée. C'est un réglage d'affichage, il aurait sa place ici — mais la
 *  vue double appartient à un autre chantier en cours, et déplacer son organe
 *  pendant qu'on l'écrit est le meilleur moyen de le perdre. À rapatrier
 *  quand ce chantier est fusionné. */
/* 🗄️ B1 — MY CHARACTERS EST LE MAGASIN DEPUIS LE LOT 195, et son rendu vit
   dans `magasin-ecran.mjs` — même déménagement que `Layers` au lot 188, et
   pour la même raison : l'écran qui porte le plus de dedans a son fichier.

   🔴 CE QUI EST MORT ICI, ET IL FAUT SAVOIR CE QUE C'ÉTAIT. Cet écran rendait
   UNE ligne — le personnage du navigateur — sous la phrase *« This browser
   keeps one character »*. Elle était VRAIE tant que `memoire.mjs` était le
   seul rangement (une clef, un personnage). Le magasin garde une entrée DATÉE
   par Save : la phrase mentait dès la seconde sauvegarde, et Eric l'a dit
   autrement le 10/09 (*« dans cette fenêtre, toutes mes saves »*). Elle est
   réécrite dans `magasin-ecran.mjs`, pas rognée. */

function renderDisplayEcran(ctx, onAction) {
  const section = el("section", "universe-step display-ecran dalle-intermediaire");
  section.dataset.objet = "dalle";
  section.dataset.sortieIci = "true";
  section.dataset.ecran = "display";

  /* ══ APPARENCE — tout ce qui règle l'UI vit ICI, derrière une porte ═════
     Eric, 08/09 : *« après y'a tout l'aspect apparence de l'UI »* — et
     *« R doit tenir en une page »*. Le tutoriel et la double vue vivaient à
     la racine du Menu, seuls de leur famille pendant que les fonds et la
     taille étaient déjà descendus ici. Ils rejoignent leur famille.
     ⏳ La langue et les unités sont RÉSERVÉES, pas câblées — Eric, 26/08 :
     *« pour le moment en anglais ; fr/en on voit après, mais on note, on
     câble après »*. Elles se montrent éteintes avec leur valeur d'aujourd'hui. */
  const lignes = el("div", "tdc-lignes");
  const tuto = ctx.tutoriel === true;
  lignes.append(interrupteur({
    label: "Tutorials", on: tuto,
    onChange: (on) => onAction({ kind: "tutoBascule", value: on })
  }));
  lignes.append(el("p", "universe-note", [text(tuto
    ? "Each step opens with a short guide. The ? in the corner of a panel brings it back."
    : "Guides are off everywhere. Turn them back on here, or with the ? in the corner of any panel.")]));

  /* 🚪 LA PORTE DE LARGEUR — présent mais éteint et grisé quand la fenêtre ne
     porte pas deux panneaux (758 × 560 px, mesuré) ; jamais caché, et il DIT
     pourquoi il dort (📍 `menu-reglage-impossible-reste-visible`). */
  const possible = ctx.vueDoublePossible !== false;
  const vueEtat = ctx.vueDouble === true;
  lignes.append(interrupteur({
    label: "Double view", on: vueEtat && possible, disabled: !possible,
    onChange: (on) => onAction({ kind: "vueBascule", value: on })
  }));
  lignes.append(el("p", "universe-note", [text(!possible
    ? "This window is too small for two panels. Make it wider — at least two panels across — and this comes back."
    : vueEtat
      ? "Two panels side by side, one belt across the top. Click a panel to work in it; the belt moves the panel you are working in."
      : "Show a second panel beside this one — the menu, or any other step. Needs a window wide enough for two panels.")]));

  const doc = ctx.document || {};
  const units = doc.units || {};
  lignes.append(ligneReservee(`Language — ${doc.lang === "fr" ? "French" : "English"}`));
  lignes.append(ligneReservee(`Units — ${units.distance === "m" ? "meters" : "feet"} · ${units.weight === "kg" ? "kilograms" : "pounds"}`));
  section.append(lignes);

  section.append(renderCranChoice({
    echelle: ctx.echelle,
    onPick: (value) => onAction({ kind: "cranChoisi", value })
  }));
  section.append(renderFondChoice({
    fonds: Array.isArray(ctx.fonds) ? ctx.fonds : [],
    fond: ctx.fond,
    onPick: (value) => onAction({ kind: "fondChoisi", value })
  }));
  return section;
}

/* ══ LES ORGANES DE R — LOT 350 ════════════════════════════════════════════ */

/** LE MOT DE L'AIGUILLEUR DE R — ⚖️ Eric, 29/09 : *« Aiguilleur qui explique qu'on
 *  peut activer un Livre ou un autre dans layers, que le DM peut donner un code de
 *  campagne. »* Le texte est le BROUILLON du plan v10 : Eric arrête les mots que le
 *  joueur lit. ⛔ Un aiguilleur POINTE en trois lignes (📍 `aide-aiguilleur-et-
 *  tutoriel-disent-meme-etape`) : il ne nomme que ce qui est écrit sur un bouton. */
export const MOT_DE_L_AIGUILLEUR_DU_MENU =
  "You can switch a book on or off in Layers. Your Dungeon Master can give you a campaign code.";

/** LA LIGNE `Books` — ⚖️ Eric, 29/09, à « le SRD dans Books ? » : *« Books est un terme
 *  générique ; le SRD est le book de base »* (engine + catalog) — il apparaît donc, et
 *  en TÊTE. Puis Fate's Hand quand son maître est engagé, puis les livres du joueur
 *  (`currentBooks`, dans leur ordre stable). Les mots sont ceux du plan v10 :
 *  « SRD · FH · PHB · DMG ».
 *  ⛔ LE MOT COURT D'UN LIVRE VIT DANS SA TABLE (`LIVRES_DU_JOUEUR.court`), jamais écrit
 *  ici : deux écritures du nom d'un livre divergeraient au premier livre ajouté.
 *  @returns {string[]} */
export function livresDuMenu(doc) {
  const livres = currentBooks(doc).map((id) => {
    const livre = LIVRES_DU_JOUEUR.find((l) => l.id === id);
    return livre ? (livre.court || livre.nom) : id;
  });
  return ["SRD", ...(compositionFh(doc).maitre ? ["FH"] : []), ...livres];
}

/** UNE PORTE DU MENU — le gabarit LARGE (NORMES §6 : dessin 105 × 40, cible 105 × 44,
 *  `--bouton-moyen`), texte T4 16 / 600, DEUX ÉTAGES PERMIS (Eric, 29/09 : *« deux
 *  lignes dans un bouton → oui »*). La famille `.menu-porte` entre dans le patron par
 *  la LISTE (shell.css), jamais par une copie de ses déclarations. */
function porte(mot, onClick) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "menu-porte";
  b.append(text(mot));
  b.addEventListener("click", onClick);
  return b;
}

/** UNE PLACE RÉSERVÉE — ⚖️ la forme de `Double view` quand la fenêtre est trop petite
 *  (📍 `menu-reglage-impossible-reste-visible`) : **présente, éteinte, un mot sous
 *  elle**. ⛔ Pas une seconde forme : un joueur qui a appris ce que veut dire « gris
 *  avec un mot » l'apprend une fois. Le mot est celui des places réservées du dépôt,
 *  « soon », dans SA pastille (`.tdc-bientot`, `ligneReservee`) — la même, pas une copie. */
export function placeReservee(mot) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "menu-porte";
  b.disabled = true;
  b.dataset.reserve = "true";
  b.append(text(mot));
  return el("div", "tdc-place", [b, el("span", "tdc-bientot", [text("soon")])]);
}

/** UNE RANGÉE DE PORTES — `deux` ou `trois`, CENTRÉES (lot 357 — Eric, 29/09 : *« centre
 *  les 2 par en 2 rangées »*). La feuille lit l'attribut ; l'écart entre deux portes est
 *  celui du trio, pour que la paire tombe sur ses intervalles.
 *  🗄️ Lot 350 : `trois` (gauche · centre · droite), `deux` (gauche · droite), `une` (centre). */
function rangee(disposition, portes) {
  const r = el("div", "tdc-rangee", portes);
  r.dataset.disposition = disposition;
  return r;
}

/** UNE LIGNE QUI SE LIT — `Campaign` (lot 357), `Rules`, `Books` : un mot, une valeur,
 *  ⛔ aucun contrôle. La ligne se dissout dans la grille de R (`display: contents`) : ses
 *  deux moitiés prennent la colonne des étiquettes et celle des valeurs, comme le code. */
function ligneLue(mot, valeur) {
  const ligne = el("div", "tdc-ligne-lue");
  ligne.dataset.ligne = mot.toLowerCase();
  ligne.append(el("span", "tdc-ligne-mot", [text(mot)]));
  ligne.append(el("span", "tdc-ligne-valeur", [text(valeur)]));
  return ligne;
}

/** LE CODE DE CAMPAGNE — une PLACE RÉSERVÉE : présent, éteint, en T0 (8 px), un mot
 *  sous lui. ⚖️ Eric, 29/09 : *« si je mets un code de campagne tout se remplit »*, et
 *  à « lu où ? » : *« le DM et le joueur sauront se retrouver si le PC du DM est
 *  allumé »* — le PC du MJ remplit `Campaign · Rules · Books`.
 *  ⏳ CE QUI N'EST PAS CONSTRUIT, ET POURQUOI : le transport de table ne l'est pas, et
 *  le tunnel rapide change d'adresse à chaque lancement (mandat §3). ⛔ Donc aucun
 *  écouteur : un champ qui accepterait une frappe sans rien en faire serait un bouton
 *  mort. */
function codeDeCampagne() {
  const place = el("div", "tdc-code");
  place.dataset.reserve = "true";
  const label = el("label", "doc-field-label", [text("Campaign code")]);
  label.setAttribute("for", "universe-campaign-code");
  const champ = document.createElement("input");
  champ.type = "text";
  champ.id = "universe-campaign-code";
  champ.className = "doc-field-input tdc-code-champ";
  champ.disabled = true;
  place.append(label, champ, el("span", "tdc-bientot", [text("soon")]));
  return place;
}

/** CE QUE DIT `Campaign` SANS CODE — ⚖️ Eric, 29/09 après-midi : *« campaign : c'est le
 *  titre de la campagne, il se créera dans Dungeon Master/ Create campaign. s'il aucun code
 *  de campagne n'est entré : il indique none. pas d'écart pour écrire ici »*.
 *  ⏳ Le titre viendra du PC du MJ, par le code — ni `Create campaign` ni le transport de
 *  table ne sont construits, et le code est une place réservée : aucun code ne peut être
 *  entré, la ligne dit donc « none ».
 *  ⛔ `document.campaign` N'EST NI LU NI EFFACÉ ICI : c'était un champ modifiable jusqu'au
 *  lot 350 ; le document garde ce qu'il porte, R ne l'écrit plus. */
export const MOT_SANS_CODE_DE_CAMPAGNE = "none";

/* ══ 🎲 LA PAGE DUNGEON MASTER — LOT 357 (le rang B3 du Menu) ═════════════════════════
   ⚖️ Eric, 29/09 après-midi, mot pour mot : *« table items devient -> campaign items (et va
   dans Dungeon master). il y au aussi un bouton homebrew à l'intérieur de Dungeon master, là
   ce seront des créations maison, associées à une campagne ou pas, partagées avec la
   communauté au pas. garde ce qu'on met dans Dungeon master en mémoire, voire crée les
   elements dans une page sans nécessairement les cabler. Le bouton connect to VTT sera dedans
   aussi. »* — et `Campaign` : *« il se créera dans Dungeon Master/ Create campaign »*.
   · à « le bouton des créations maison : quel mot, puisque le lexique du 10/09 bannit
     "homebrew" devant le joueur ? » → *« Homebrew »* — une exception NOMMÉE, gravée au corpus
     (📍 `menu-dm-bouton-homebrew`), ⛔ pas un mot qui se répand.
   ⭐ QUATRE PLACES RÉSERVÉES, SANS CÂBLAGE : présentes, éteintes, « soon » sous elles — la
   forme unique du « pas encore » (`placeReservee`, la même que `Vault` sur R). ⛔ Aucune
   prose inventée : Eric arrête les mots que le joueur lit.
   ⏳ `Tools` n'y est pas encore : *« on mettra ça chez le DM si on l'utilise (à faire plus
   tard) »*. Le retour au Menu est celui des autres rangs B (la paire de la coquille). */
function renderDungeonMasterEcran() {
  const section = el("section", "universe-step dm-ecran dalle-intermediaire");
  section.dataset.objet = "dalle";
  section.dataset.sortieIci = "true";
  section.dataset.ecran = "dm";
  section.append(el("h3", "tdc-titre-b", [text("Dungeon Master")]));
  const portes = el("nav", "tdc-portes");
  portes.setAttribute("aria-label", "Dungeon Master");
  portes.append(rangee("deux", [placeReservee("Create campaign"), placeReservee("Campaign items")]));
  portes.append(rangee("deux", [placeReservee("Homebrew"), placeReservee("Connect to VTT")]));
  section.append(portes);
  return section;
}

/**
 * @param {object} ctx
 * @param {object} ctx.document            le document `fh-char/1` courant
 * @param {Function} ctx.query             `layers.verbs.query`
 * @param {(action: object) => void} onAction
 *   R : `{kind:"ouvrirNouveauPersonnage"}` · `{kind:"ouvrirLeMagasin"}` ·
 *   `{kind:"ouvrirDungeonMaster"}` · `{kind:"ouvrirLayers"}` · `{kind:"ouvrirDisplay"}`.
 *   🗄️ Lot 357 : `ouvrirLaCreation` (l'ancien `Create character`) et `describe/campaign`
 *   (l'ancien champ) ne sont plus émis. Lot 351 : la confirmation du maître n'est plus
 *   peinte ici, la coquille la pose en fenêtre (`paintPopup`).
 */
export function renderUniverseStep(ctx, onAction) {
  /* 🔴 UN SEUL POINT D'ENTRÉE POUR LES DEUX RANGS, et c'est ce qui garde la
     coquille ignorante du dedans de l'étape : elle dit à quel RANG on est
     (`ecran`), l'écran dit ce qu'on y voit. */
  if (ctx.ecran === "display") return renderDisplayEcran(ctx, onAction);
  if (ctx.ecran === "characters") return renderMagasinEcran(ctx, onAction);
  if (ctx.ecran === "layers") return renderLayersEcran(ctx, onAction);
  if (ctx.ecran === "dm") return renderDungeonMasterEcran();
  const doc = ctx.document;
  /* `dalle-intermediaire` — le voile à 50 % : ⚖️ Eric, 29/09, *« fond habituel,
     transparence 50 % »* (NORMES §4), pris à la matrice des dalles et jamais
     réécrit en couleur ici. `tdc-r` porte la GRILLE de R (shell.css). */
  const section = el("section", "universe-step dalle-intermediaire tdc-r");
  /* Il DIT son format, comme les dalles du parcours : un écran qui ne le
     déclare pas oblige à le déduire, et une déduction se trompe. */
  section.dataset.objet = "dalle";
  /* ⛔ AUCUNE SORTIE DÉCLARÉE À LA RACINE : `R` n'est pas une étape à valider, c'est
     un tableau de commande — son geste principal est `New character` (lot 357), et un
     `Done` qui ferait la même chose serait un second organe pour un seul geste. */

  /* ══ R — LE MENU, TEL QU'ERIC L'A DICTÉ LE 29/09 ══════════════════════════
     *« Pour simplifier à la surface : menu R »* — de haut en bas : le code de
     campagne · `Create character` · `Campaign` · `Rules` · `Books` · l'aiguilleur ·
     les portes `My characters` (gauche) · `New character` (centre) · `Vault` (droite)
     · `Layers` (gauche) · `Dungeon Master` (droite) · `Display`.
     Réponses d'Eric aux questions d'ARCHI 35, le même jour — chacune avec SA question :
     · le pied (le livre FH Web, le `?`) → *« pas de livre ni de ? dans l'étape Menu »* ;
     · `Tools` → *« on mettra ça chez le DM si on l'utilise (à faire plus tard) »* : il
       disparaît de R ;
     · la ligne `Campaign` → modifiable à la main tant que le code n'est pas câblé ;
     · le titre `SOWLREACH` + son sous-titre → **gardés**, en tête ;
     · la ligne « in browser : <nom> · saved » → ⛔ **retirée**.
     ⭐ Et l'habillage : *« on respecte les hauteurs de dalle, pas de scroll »* ; les
     repères `R`, `B0…B4` ne s'affichent jamais.

     🗄️ CE QUI QUITTE R (loi des deux âges : les neuf corrections du 08/09 sont
     racontées ici, pas effacées) : `Build a character` (→ `Create character`, qui ne
     crée plus rien) · `Open · Save · Forget` (Open → `My characters`, qui était la
     même pièce depuis le lot 195 — C37 tranchée par la dictée ; Save → Sheet, *« le
     save character sera dans Sheet »* ; Forget → le `Delete` de la fenêtre) · le
     voyant SRD et l'interrupteur Fate's Hand (ils vivent dans `Layers`, lots 188-189 —
     C33 tranchée : la porte `Layers` est à gauche, rangée 2) · la ligne d'état · le
     pied (le livre, `Display`/`DM`/`Tools` au format petit, le `?` de la coquille).

     🔄 LOT 357 — ERIC A RELU R EN LIGNE (v906) ET L'A REDICTÉ LE MÊME JOUR, mot pour mot :
     *« Campaign code on garde. create Character on garde (nomme le plutôt new character).
     campaign : c'est le titre de la campagne, il se créera dans Dungeon Master/ Create
     campaign. s'il aucun code de campagne n'est entré : il indique none. pas d'écart pour
     écrire ici. apres tout es bien, jusqu'à new character : celui doit dégager. table items
     devient -> campaign items (et va dans Dungeon master). […] donc les 4 boutons du bas. My
     characters, Vault, Layers, display. centre les 2 par en 2 rangées »* ; puis *« 1ere
     rangée : My characters / Dungeon Master · 2e rangée : Vault / Layers / Display »* ; et à
     « le grand bouton New character, que fait-il ? » : *« La fenêtre, puis l'étape 1 »*.
     ⇒ de haut en bas : la tête · le code · `New character` · `Campaign` (lu : « none ») ·
     `Rules` · `Books` · l'aiguilleur · `My characters` · `Dungeon Master` / `Vault` ·
     `Layers` · `Display`. 🗄️ Ce qui quitte R : `Create character` (devenu `New
     character`), la porte `New character` du bas (un seul organe par geste), le champ
     `Campaign`. */

  /* ① LA TÊTE — gardée (Eric, 29/09). ⚠️ UNE PERTE SE DIT, ELLE NE SE DEVINE PAS : un
     personnage gardé mais illisible, ou un navigateur qui refuse de garder, laissent
     leur mot ICI. ⛔ Ce n'est pas la ligne d'état retirée : celle-ci disait « saved »
     à chaque visite ; ceux-là ne parlent que d'une perte — la voix du gendarme.
     ✅ Eric, 29/09, à « le mot rouge en tête de R quand le navigateur ne garde pas le
     perso — gardé ou retiré ? » : *« Gardé »* (`menu-r-ligne-d-etat-retiree`). */
  const tete = el("header", "tdc-tete");
  tete.append(el("p", "tdc-marque", [text("SOWLREACH")]));
  tete.append(el("p", "tdc-sous-titre", [text("Agnostic SRD 5.2.1 interface")]));
  if (ctx.memoireIgnoree) {
    tete.append(el("p", "doc-field-error", [
      text(`A character was saved here but could not be reopened: ${ctx.memoireIgnoree}. This one starts fresh.`)
    ]));
  }
  /* 🗄️ LOT 195 — le refus d'un FICHIER s'est dit là où on l'a ouvert (la page du
     magasin) ; il ne revient pas ici. */
  const memoire = ctx.memoire || { ok: true };
  if (memoire.ok === false) {
    tete.append(el("p", "doc-field-error", [
      text(`This browser is not keeping your character: ${memoire.raison}. Save it from Sheet.`)
    ]));
  }
  section.append(tete);

  /* ② LE CODE DE CAMPAGNE — une place réservée (voir `codeDeCampagne`). */
  section.append(codeDeCampagne());

  /* ③ NEW CHARACTER — le geste majeur, VERT (Eric, 08/09 : *« relief vert »* ; il garde
     la teinte du geste qu'il remplace — ⏳ `A-TRANCHER §C29` reste ouverte).
     ⚖️ LOT 357 : *« create Character on garde (nomme le plutôt new character) »*, et il
     ouvre *« La fenêtre, puis l'étape 1 »* — la fenêtre `New character` (`Cancel · Delete ·
     Save`, ou `Cancel · Start`), la naissance, l'étape 1 avec les Layers en place.
     🗄️ Lot 350 : `Create character` ouvrait l'étape 1 DU PERSO EN COURS, sans rien créer. */
  const nouveau = porte("New character", () => onAction({ kind: "ouvrirNouveauPersonnage" }));
  nouveau.dataset.majeure = "true";
  section.append(el("div", "tdc-seul", [nouveau]));

  /* ④ LES TROIS LIGNES, LUES — `Campaign` (lot 357 : le titre de la campagne, ou « none »
     sans code — voir `MOT_SANS_CODE_DE_CAMPAGNE`) · `Rules` (Fate's Hand si le maître est
     engagé, sinon SRD — ⚖️ *« (SRD mais inutile de citer) Fate's hand »*) · `Books`. */
  section.append(ligneLue("Campaign", MOT_SANS_CODE_DE_CAMPAGNE));
  /* ⭐ LOT 188 — LA LIGNE LIT LA COMPOSITION, PAS LE NOM DE LA PILE : un joueur qui a
     coupé un seul interrupteur n'est pas « hors des deux jeux de règles ». Le mot
     rouge ne sort que pour une composition qu'aucun interrupteur ne peut produire
     (`compositionFh`, layers-ecran) — et il envoie là où l'on répare : `Layers`. */
  const composition = compositionFh(doc);
  section.append(ligneLue("Rules", composition.maitre ? "Fate's Hand" : "SRD"));
  if (!composition.legitime) {
    section.append(el("p", "doc-field-error", [
      text("This character's layer stack doesn't match either ruleset — open Layers to realign it.")
    ]));
  }
  section.append(ligneLue("Books", livresDuMenu(doc).join(" · ")));

  /* ⑤ L'AIGUILLEUR — l'organe `.guide-mot` (NORMES §6 pré bis), ⛔ jamais un sosie :
     bleu, une boîte de TROIS lignes, et sur le verre il écrit en `--text`
     (📍 `aide-amendement-aiguilleur`, porté par l'organe, pas par cet écran). */
  section.append(el("p", "guide-mot", [text(MOT_DE_L_AIGUILLEUR_DU_MENU)]));

  /* ⑥ LES CINQ PORTES, EN DEUX RANGÉES CENTRÉES — lot 357 : *« 1ere rangée : My
     characters / Dungeon Master · 2e rangée : Vault / Layers / Display »*.
     ⭐ `Dungeon Master` DEVIENT VIVANTE : elle ouvre sa page (le rang B3, `ouvrirDungeonMaster`).
     ⏳ `Vault` reste une place réservée : son lot (353) la construira.
     🗄️ Lot 350 : six portes sur trois rangées, dont `New character` au centre (devenu le
     grand bouton) et `Dungeon Master` réservée. */
  const portes = el("nav", "tdc-portes");
  portes.setAttribute("aria-label", "Menu");
  portes.append(rangee("deux", [
    porte("My characters", () => onAction({ kind: "ouvrirLeMagasin" })),
    porte("Dungeon Master", () => onAction({ kind: "ouvrirDungeonMaster" }))
  ]));
  portes.append(rangee("trois", [
    placeReservee("Vault"),
    porte("Layers", () => onAction({ kind: "ouvrirLayers" })),
    porte("Display", () => onAction({ kind: "ouvrirDisplay" }))
  ]));
  section.append(portes);
  /* 🗄️ LOT 351 — LA COPIE EN LIGNE DE LA CONFIRMATION DU MAÎTRE EST PARTIE : la coquille
     la peint en fenêtre (`paintPopup`), par-dessus n'importe quel écran. */

  return section;
}
