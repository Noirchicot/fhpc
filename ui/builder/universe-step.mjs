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

import { renderConfirmDialog } from "./confirm.mjs?v=622";
/* ⭐ LE MOT D'UN ÉCHELON — importé, jamais refait. `echelle.mjs` est la SEULE
   déclaration des noms de crans (garde : `tests/fraction-d-ecran.test.mjs`),
   et un écran qui joindrait lui-même les libellés en serait une seconde.
   ⛔ C'est bien un FORMATAGE qu'on importe, pas un calcul : l'arithmétique de
   l'échelle est faite par la coquille, cet écran reçoit l'état tout prêt. */
import { motDeLEchelon } from "./echelle.mjs?v=622";
/* ⭐ LOT 188 — l'organe interrupteur, la place réservée et l'écran `Layers`
   vivent dans `layers-ecran.mjs`, qui importe en retour les listes de couches
   d'ici (voir sa tête : aucun export n'est lu au chargement, dans aucun sens). */
import { interrupteur, voyant, ligneReservee, renderLayersEcran, compositionFh } from "./layers-ecran.mjs?v=622";
/* 🗄️ LOT 195 — le rang B `characters` EST le magasin de sauvegardes, et son
   rendu vit dans son propre fichier (même déménagement que `Layers` au 188).
   ⛔ Aucun export n'est lu au CHARGEMENT de part et d'autre : `magasin-ecran`
   n'importe rien d'ici, donc pas de cycle à arbitrer. */
import { renderMagasinEcran } from "./magasin-ecran.mjs?v=622";

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

/** 📖 LE LIVRE DU MENU : FH Web, le livre lui-même — pas un chapitre, puisque
 *  le Menu ne parle d'aucune règle en particulier. Vérifié en 200 le 08/09. */
export const LIVRE_FH_WEB = "https://noirchicot.github.io/fh-phb/";

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
  "fh-soulforging-en", "fh-gems-en", "fh-fiche-en", "fh-lore-en"
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

/** Même patron que `textField` (`concept-step.mjs`) : commis sur `change`,
 *  jamais sur chaque frappe (voir sa tête de fichier — `render()` reconstruit
 *  toute la page). Pas de `datalist` ici : `campaign` est un texte libre
 *  SANS suggestion, contrairement à l'alignement de Concept. */
function textField({ id, label, value, maxLength, error, onCommit, compact = false, placeholder }) {
  const wrap = el("div", compact ? "doc-field tdc-champ" : "doc-field");
  const labelNode = el("label", "doc-field-label", [text(label)]);
  labelNode.setAttribute("for", id);
  wrap.append(labelNode);

  const input = document.createElement("input");
  input.type = "text";
  input.id = id;
  input.className = "doc-field-input";
  input.value = typeof value === "string" ? value : "";
  if (typeof maxLength === "number") input.maxLength = maxLength;
  if (placeholder) input.placeholder = placeholder;
  if (error) input.setAttribute("aria-invalid", "true");
  input.addEventListener("change", () => onCommit(input.value));
  wrap.append(input);

  if (error) wrap.append(el("p", "doc-field-error", [text(error)]));
  return wrap;
}

function bouton(libelle, className, onClick) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = className;
  b.append(text(libelle));
  b.addEventListener("click", onClick);
  return b;
}

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

/* ══ ⚖️ LOT 193 — « BUILD A CHARACTER » CRÉE UN PERSONNAGE ═════════════════
   ⚖️ Eric, 10/09, gravé dans `ARCHITECTURE.md` (§ « LE PREMIER PAS »), second
   fil SRD en débutant : *« j'arrive dans le menu, je tape Build a character, je
   suis débutant. Il me faut un perso SRD mais je n'ai même pas regardé les
   menus du dessous. **Un popup doit me dire, avant même d'arriver à l'étape 1,
   tout de suite : tu veux SRD ou FH ? — et faire le réglage pour moi.** Le
   perso du navigateur est **sauvegardé automatiquement et dégage du
   navigateur** ; tous les choix des étapes sont **réinitialisés**. »*

   **Deux questions posées, deux réponses, gravées avec elles :**
   · *que devient le personnage courant ?* → **fichier automatique, puis
     reset** ; ⛔ **téléchargement bloqué = pas de reset** — la règle du 192 mot
     pour mot : un Save refusé n'efface rien.
   · *combien de voies au popup ?* → **deux : SRD · Fate's Hand.** Il règle le
     maître à la place du joueur. Les livres et les six interrupteurs restent
     dans `Layers` pour qui veut aller plus loin. ⛔ Pas de troisième voie.

   ⚠️ LE MOT DU BOUTON NE CHANGE PAS, LE GESTE OUI. `Build a character` reste
   `Build a character` — la dictée du 26/08, rappelée plus bas au tableau de
   commande. Ce qui change est ce qu'il FAIT : sauvegarder, repartir à zéro,
   demander le jeu. */

/** LE NOM D'UN PERSONNAGE QUI N'EN A PAS ENCORE.
 *  📏 `fh-char/1` EXIGE UN NOM D'AU MOINS UN CARACTÈRE (`name.minLength: 1`,
 *  schemas/fh-char.schema.json) : un personnage neuf ne peut donc PAS naître
 *  sans nom, et une chaîne vide serait un refus, pas un blanc. Le mot choisi
 *  est celui que le Menu affichait DÉJÀ pour un nom vide (`nomDuPersonnage`,
 *  juste en dessous, qui le lit ici désormais) — une seule absence, un seul
 *  mot ; deux auraient divergé au premier réglage.
 *  ⚖️ ET LE MOT EST DÉSORMAIS CELUI D'ERIC — 2026-09-10, en entier : *« "Name
 *  character" »*. Il remplace `Unnamed character`, qui n'était qu'un défaut
 *  sobre posé faute de cote. ⭐ Le changement de mot est aussi un changement de
 *  VOIX : `Unnamed character` DÉCRIVAIT un état (« celui-ci n'a pas de nom ») ;
 *  `Name character` DEMANDE un geste. Une cote DONNÉE bat une cote déduite. */
export const NOM_DU_PERSONNAGE_NEUF = "Name character";

/** LA SÉQUENCE DU PREMIER PAS, PURE pour qu'un garde la lise sans coquille —
 *  MÊME FORME que `sauvegarderPuisEteindre` (lot 192) et pour la même raison :
 *  l'ordre EST la règle, et un ordre qui ne vit que dans une coquille ne se
 *  mesure pas.
 *
 *  · un personnage est là → il est SAUVEGARDÉ d'abord. S'il n'est pas parti
 *    (`sauvegarder()` rend autre chose que `true`), RIEN ne bouge : ni reset,
 *    ni question — le joueur garde son personnage, et le refus lui a déjà été
 *    dit par la porte (`porteEnPanne`, shell.mjs).
 *  · aucun personnage → `sauvegarder` n'est JAMAIS appelé : écrire un fichier
 *    de rien serait un téléchargement que personne n'a demandé.
 *
 *  Puis, dans cet ordre et jamais l'inverse : repartir à zéro, et SEULEMENT
 *  ensuite demander le jeu — la question porte sur le personnage NEUF, la
 *  poser avant la ferait porter sur celui qu'on range.
 *
 *  ⏳ ELLE ATTEND DEPUIS LE LOT 195, pour la MÊME raison que
 *  `sauvegarderPuisEteindre` juste au-dessus : le magasin répond en différé, et
 *  *« téléchargement bloqué = pas de reset »* n'a de sens que si l'on attend la
 *  réponse. Une absence n'est jamais une réponse — et une promesse non attendue
 *  est une absence.
 *
 *  @param {{personnage: boolean, sauvegarder: () => Promise<boolean>|boolean, repartirAZero: () => void, demanderLeJeu: () => void}} gestes
 *  @returns {Promise<boolean>} `true` si le personnage neuf est né */
export async function creerUnPersonnage({ personnage, sauvegarder, repartirAZero, demanderLeJeu }) {
  if (personnage && await sauvegarder() !== true) return false;
  repartirAZero();
  demanderLeJeu();
  return true;
}

/* LES TROIS PHRASES DU POPUP — une par ligne, parce que `paintPopup`
   (shell.mjs) fait un paragraphe de chaque ligne. La première DIT DE QUOI ON
   PARLE et où le réglage vit ensuite : un joueur à qui on pose une question
   sans lui dire ce qu'elle décide répond au hasard. Les deux suivantes donnent
   UN MOT À CHAQUE VOIE — le bouton porte le nom, la ligne porte ce que le nom
   veut dire. ⛔ Ni « couche » ni « homebrew » : le lexique du 10/09. */
const MOT_DU_JEU_ENTREE = "Which rules is this character built on? You can change it later from Layers.";
const MOT_DU_JEU_SRD = "SRD — the core rules, playable anywhere.";
const MOT_DU_JEU_FH = "Fate's Hand — the world of Nymedes and its rules.";

/** LE POPUP DU PREMIER PAS — la description d'état que `paintPopup` (shell.mjs)
 *  sait déjà peindre (`{titre, role, texte, actions}`, lot 173) : ⛔ AUCUN
 *  COMPOSANT NEUF, et pas un `confirm()` du navigateur. Ce n'est pas non plus
 *  `confirm.mjs` : sa paire a un bouton ROUGE (`--critical`,
 *  `.confirm-dialog-confirm`) parce qu'elle protège une DESTRUCTION — ici les
 *  deux voies sont PAIRES, aucune ne défait rien, et peindre « Fate's Hand »
 *  en rouge dirait le contraire de ce qu'elle fait. D'où le rôle `guide`, celui
 *  qui « ne signale rien » (§7).
 *
 *  🔴 DEUX VOIES, ET LEUR NOMBRE EST LA DÉCISION D'ERIC — pas une commodité :
 *  *« combien de voies au popup ? → deux : SRD · Fate's Hand »*. Chaque voie
 *  rend un nom de pile du vocabulaire déjà en place (`currentStack` :
 *  `"srd"` / `"srdfh"`), jamais un mot neuf.
 *
 *  ⛔ ELLE NE SAIT PAS CE QUE `choisir` FAIT — même loi que `confirm.mjs` en
 *  tête : le composant ne connaît aucun verbe, l'appelant décide.
 *
 *  @param {(pile: "srd" | "srdfh") => void} choisir
 *  @returns {{titre: string, role: string, texte: string, actions: {mot: string, faire: () => void}[]}} */
export function popupDuJeu(choisir) {
  return {
    titre: "SRD or Fate's Hand?",
    role: "guide",
    texte: [MOT_DU_JEU_ENTREE, MOT_DU_JEU_SRD, MOT_DU_JEU_FH].join("\n"),
    actions: [
      { mot: "SRD", faire: () => choisir("srd") },
      { mot: "Fate's Hand", faire: () => choisir("srdfh") }
    ]
  };
}

/** LA CONFIRMATION DU MAÎTRE — partagée entre R et l'écran `Layers` (lot 188),
 *  parce que `pendingStack` est un état de la coquille et que le joueur doit
 *  voir la question là où il a basculé l'interrupteur. Une seule fonction :
 *  deux rendus de « la même question » divergeraient.
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

function nomDuPersonnage(doc) {
  const nom = doc && typeof doc.name === "string" ? doc.name.trim() : "";
  /* ⭐ LOT 193 — LE MOT DE L'ABSENCE EST DÉCLARÉ UNE FOIS
     (`NOM_DU_PERSONNAGE_NEUF`, plus haut) : c'est le MÊME qu'un personnage
     neuf porte à sa naissance, et deux écrivains du même mot auraient
     divergé le jour où Eric donne le sien. */
  return nom !== "" ? nom : NOM_DU_PERSONNAGE_NEUF;
}


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

/**
 * @param {object} ctx
 * @param {object} ctx.document            le document `fh-char/1` courant
 * @param {Function} ctx.query             `layers.verbs.query`
 * @param {object} [ctx.fieldErrors]       le dernier refus par champ (`{campaign}`)
 * @param {string|null} [ctx.pendingStack] `"srd"` si une confirmation de passage à SRD est en attente, sinon `null`
 * @param {(action: object) => void} onAction
 *   `{kind:"requestLayerStack", value}` (clic sur un des deux boutons — `shell.mjs`
 *   décide s'il faut confirmer) · `{kind:"confirmLayerStack"}` ·
 *   `{kind:"saveAndConfirmLayerStack"}` (lot 192 : Save, puis l'extinction) ·
 *   `{kind:"cancelLayerStack"}` · `{kind:"describe", field:"campaign", value}`.
 */
export function renderUniverseStep(ctx, onAction) {
  /* 🔴 UN SEUL POINT D'ENTRÉE POUR LES DEUX RANGS, et c'est ce qui garde la
     coquille ignorante du dedans de l'étape : elle dit à quel RANG on est
     (`ecran`), l'écran dit ce qu'on y voit. */
  if (ctx.ecran === "display") return renderDisplayEcran(ctx, onAction);
  if (ctx.ecran === "characters") return renderMagasinEcran(ctx, onAction);
  if (ctx.ecran === "layers") return renderLayersEcran(ctx, onAction);
  const doc = ctx.document;
  const query = ctx.query;
  const errors = ctx.fieldErrors || {};
  /* `dalle-intermediaire` — le voile à 50 % qu'Eric a demandé, pris à la
     matrice des dalles (lot 59) et jamais réécrit en couleur ici. */
  const section = el("section", "universe-step dalle-intermediaire");
  /* Il DIT son format, comme les dalles du parcours : un écran qui ne le
     déclare pas oblige à le déduire, et une déduction se trompe. */
  section.dataset.objet = "dalle";
  /* ⛔ AUCUNE SORTIE DÉCLARÉE À LA RACINE — voir le commentaire du tableau de
     commande plus bas : `R` n'a pas de `Done`, son geste est `Build a character`.
     La coquille ne pose donc pas de paire ici ; le `?` reste en absolu. */

  /* ══ R — LE TABLEAU DE COMMANDE — Eric, 2026-09-08 ═══════════════════════
     *« Objectif 1 : le joueur y arrive. »* · *« Le joueur ne veut pas naviguer,
     il doit trouver l'essentiel en R. »* · *« R doit tenir en une page »* —
     **500 blg, ceinture exclue**. *« Après, les fonctions joueur avancées, et
     les trois autres familles, c'est dans B1 à B4. »*

     ⭐ CE MENU AVAIT ÉTÉ DICTÉ LE 26/08 (`FH-WEB/FHPC/FHPCv2 arborescence
     d'entree`) ET JAMAIS PORTÉ — le Menu d'avant s'était construit *« au fur
     et à mesure, à chaque besoin »*, cinq réglages d'affichage à la racine et
     le personnage tout en bas. Celui-ci INVERSE l'ordre : le personnage
     d'abord, les règles, puis les portes.

     🔴 ET IL RÉSERVE LES PLACES de tout ce qui a été dit — `My characters`,
     `DM`, `Tools` — visibles, éteintes, avec un mot. *« Pour que les prochaines
     itérations ne nécessitent pas qu'on détruise pour reconstruire. »* Le code
     est la mémoire : un siège qui arrive VOIT où va chaque organe.

     ⛔ PAS DE `Done` À LA RACINE, ET C'EST UNE DÉCISION : `R` n'est pas une
     étape à valider, c'est un tableau de commande. Son geste principal est
     `Build a character`, qui ouvre les huit étapes — un `Done` qui ferait la
     même chose serait un second organe pour un seul geste. Le `?` reste, posé
     par la coquille en absolu (§6 pré, *« sur une dalle sans rangée »*).

     ⚠️ `Build a character`, PAS `New character` — le mot de la dictée, et il
     ne bouge pas au lot 193. ⭐ CE QUI A CHANGÉ, C'EST SA RAISON, ET ELLE SE
     LIT : jusqu'au 10/09 le builder n'avait AUCUN personnage vierge (il naît
     de l'exemple commité), donc « New » aurait promis ce que rien ne savait
     fabriquer. Depuis, il sait — `composer` (src/doc/writers.mjs) fait naître
     un document, et ce bouton l'appelle. Le mot reste quand même : c'est
     CELUI D'ERIC, dicté le 26/08 et redit le 10/09 dans le même souffle que
     la création (« je tape Build a character »). ⛔ Le garde `D4` ne se
     desserre pas pour autant — il refuse toujours « New », « Start over »,
     « Reset » : un second mot pour un seul geste, c'est un second organe. */
  /* ⚖️ LES NEUF CORRECTIONS D'ERIC SUR R — 08/09, après la première itération :
     « SOWLREACH (centré) · Agnostic SRD 5.2.1 interface (centré italique) ·
     Build a Character bouton large, relief vert · standard des boutons, Open et
     Save en vert (format réglementé, petits, centrés) · un switch pour Fate's
     Hand, et un switch pour SRD même s'il est inactif, même ligne · My
     characters bouton large bleu cadré à gauche · in browser : <nom>, voyant
     vert si saved, rouge sinon · campaign · trois boutons du bas standard,
     centrés, cellule — manque le livre — à 8 blg du pied de page. »
     ⚠️ `Forget` n'était PAS dans sa liste : gardé dans la rangée du fichier,
     parce que c'est la seule sortie quand la fiche ne dérive plus (v592). À lui
     de dire s'il vit ailleurs. */
  const memoire = ctx.memoire || { ok: true };
  const perso = el("div", "universe-memoire tdc-perso");
  perso.dataset.garde = String(Boolean(memoire.ok));

  const tete = el("header", "tdc-tete");
  tete.append(el("p", "tdc-marque", [text("SOWLREACH")]));
  tete.append(el("p", "tdc-sous-titre", [text("Agnostic SRD 5.2.1 interface")]));
  /* ⚠️ UNE PERTE SE DIT, ELLE NE SE DEVINE PAS — un personnage gardé mais
     illisible, ou un fichier refusé, laissent chacun leur mot ici, en tête. */
  if (ctx.memoireIgnoree) {
    tete.append(el("p", "doc-field-error", [
      text(`A character was saved here but could not be reopened: ${ctx.memoireIgnoree}. This one starts fresh.`)
    ]));
  }
  /* 🗄️ LOT 195 — LE REFUS D'UN FICHIER A SUIVI SON BOUTON. La boîte de
     fichiers du système ne s'ouvre plus depuis `R` (`Open` ouvre le magasin) :
     un mot posé ici parlerait d'un geste que le joueur n'a pas fait sur cet
     écran. Il se dit là où on l'a fait — la page du magasin. */
  perso.append(tete);

  /* LE GESTE MAJEUR — large, vert en relief (Eric). ⭐ LOT 193 — IL NE NAVIGUE
     PLUS, IL CRÉE : sauvegarder le personnage courant, repartir à zéro,
     demander « SRD ou Fate's Hand ? », et c'est la RÉPONSE qui ouvre l'étape 1
     (voir la section « LE PREMIER PAS » en tête de fichier). L'écran, lui,
     émet le même verbe qu'avant — c'est la coquille qui a appris le geste. */
  perso.append(bouton("Build a character", "tdc-majeur", () => onAction({ kind: "construireLePersonnage" })));

  /* ⚖️ LES TROIS GESTES DU FICHIER, AU FORMAT RÉGLEMENTÉ — une rangée
     `.parcours-pied` : la coquille lui donne la grille des rangées et le
     plancher de 77 (📍 `bouton-deux-largeurs`). `Open` et `Save` en vert
     (Eric) ; `Forget` reste rouge, il DÉFAIT. `Save` est l'export canonique de
     Sheet — le MÊME écrivain (`exportJson`), pas un second. */
  /* 🗄️ LOT 195 — `Open` N'OUVRE PLUS LA BOÎTE DE FICHIERS DU SYSTÈME.
     ⚖️ Eric, 10/09 : *« quand j'appuie sur Open, j'ai une page avec toutes mes
     sauvegardes dedans »*. Le MOT ne bouge pas — c'est le sien, et il l'a redit
     ce jour-là dans la même phrase. Ce qui change est ce qu'il OUVRE : le rang
     B `characters`, la page du magasin. ⭐ La boîte de fichiers n'a pas disparu
     pour autant : elle descend d'un rang, sur `Open a file…` DANS cette page —
     un joueur qui reçoit un `.fh-char.json` d'ailleurs doit toujours pouvoir
     l'ouvrir (loi du 06/09, elle n'a pas bougé). */
  const trio = el("div", "parcours-pied tdc-trio");
  trio.append(bouton("Open", "tdc-vert universe-ouvrir", () => onAction({ kind: "ouvrirLeMagasin" })));
  trio.append(bouton("Save", "tdc-vert universe-sauver", () => onAction({ kind: "exportJson" })));
  trio.append(bouton("Forget", "parcours-annuler universe-oubli", () => onAction({ kind: "oublierPersonnage" })));
  perso.append(trio);

  /* ══ LA LIGNE DES RÈGLES — UN VOYANT ET UN INTERRUPTEUR — Eric, 08 et 09/09 ═
     08/09 : *« un switch pour Fate's Hand, oui ; un switch pour SRD même s'il
     est inactif, même ligne, donc off »*. Puis 09/09, devant la v612 :
     *« Le bouton SRD est un VOYANT, pas un bouton — il est toujours actif. »*
     ⚖️ Le second mot corrige le premier sur DEUX points, et les deux se lisent :
     · la FORME — plus d'interrupteur grisé qui a l'air d'un bouton qu'on ne
       peut pas pousser, une LAMPE (`voyant`, layers-ecran.mjs) ;
     · le SENS — le SRD n'est plus le miroir inversé de Fate's Hand (« quand
       l'un s'allume, l'autre s'éteint », 17/08) : il est TOUJOURS allumé,
       Fate's Hand ou non. C'est le plancher, pas l'autre plateau de la balance.
     ⛔ Un seul organe écrit la pile : l'interrupteur `Fate's Hand`. Et c'est
     le MÊME voyant qu'au socle de `Layers` — un organe, deux emplois. */
  /* ⭐ LOT 188 — LES DEUX INTERRUPTEURS LISENT LA COMPOSITION, PAS LE NOM DE LA
     PILE. `currentStack` ne connaît que `srd` et `srdfh` ; un joueur qui a
     coupé une seule couche depuis `Layers` n'est ni l'un ni l'autre, et il
     n'est pas pour autant « hors des deux jeux de règles ». Le maître dit si
     Fate's Hand est ENGAGÉ ; le mot rouge ne sort que pour une composition
     qu'aucun interrupteur ne peut produire (`compositionFh`, layers-ecran). */
  const composition = compositionFh(doc);
  const regles = el("div", "tdc-regles");
  const deux = el("div", "tdc-deux");
  const socle = voyant({ label: "SRD" });
  socle.dataset.socle = "true";
  deux.append(socle);
  deux.append(interrupteur({
    label: "Fate's Hand", on: composition.maitre,
    onChange: (on) => onAction({ kind: "requestLayerStack", value: on ? "srdfh" : "srd" })
  }));
  regles.append(deux);
  if (!composition.legitime) {
    regles.append(el("p", "doc-field-error", [
      text("This character's layer stack doesn't match either ruleset — flip Fate's Hand to realign it.")
    ]));
  }
  /* 🎛️ LA PORTE DE `Layers` — le rang B où les six couches se coupent une par
     une (Eric, 09/09). Large et bleue comme `My characters` : elle NAVIGUE,
     elle ne règle rien ici. ⏳ Sa place sous les deux interrupteurs est le
     défaut le plus sobre, pas une cote d'Eric (A-TRANCHER §C33). */
  regles.append(bouton("Layers", "tdc-couches", () => onAction({ kind: "ouvrirLayers" })));
  perso.append(regles);

  /* MY CHARACTERS — large, bleu, cadré à gauche (Eric, 08/09). Il ouvre le
     rang B1 : le magasin.
     ⚖️ ET IL OUVRE EXACTEMENT LA MÊME PAGE QUE `Open` DEPUIS LE LOT 195 — deux
     portes, une seule pièce. ⏳ C'EST UNE QUESTION POUR ERIC, PAS UNE DÉCISION
     PRISE ICI (A-TRANCHER §C37) : ses deux mots sont vrais, dits à deux jours
     d'écart, et aucun ne dit lequel des deux boutons reste. On ne retire pas en
     silence un bouton qu'il a dicté ; on le NOMME. */
  perso.append(bouton("My characters", "tdc-liste", () => onAction({ kind: "ouvrirLeMagasin" })));

  /* LA LIGNE D'ÉTAT — *« in browser : Ilyra Duskleaf · saved, voyant vert si
     saved, rouge sinon »*. La pastille lit `[data-garde]`, jamais une couleur
     écrite ici. */
  const etat = el("p", "tdc-etat");
  etat.append(el("span", "tdc-etat-mot", [text("in browser: ")]));
  etat.append(el("span", "tdc-nom", [text(nomDuPersonnage(doc))]));
  etat.append(el("span", "tdc-garde", [text(memoire.ok ? "saved" : `not saved: ${memoire.raison}`)]));
  perso.append(etat);
  section.append(perso);

  if (ctx.pendingStack) section.append(renderConfirmationPile(doc, query, onAction));

  section.append(textField({
    id: "universe-campaign",
    label: "Campaign",
    placeholder: "codename, optional",
    compact: true,
    value: doc.campaign,
    maxLength: 80,
    error: errors.campaign,
    onCommit: (value) => onAction({ kind: "describe", field: "campaign", value })
  }));

  /* ══ LA RANGÉE DU BAS : LE LIVRE · LES TROIS PORTES · LE `?` ═══════════════
     Eric, 08/09 : *« trois boutons du bas, standard, centrés, cellule — manque
     le livre — à 8 blg du pied de page »*. C'est la trilogie (📍 `rangee-
     trilogie-due-partout`) : une rangée `.parcours-pied`, le livre à gauche
     (il ouvre FH Web, le livre lui-même), les trois portes au format réglementé
     dans la cellule du milieu — 3 × 77 + 2 × 8 = 247, la largeur exacte de la
     cellule — et le `?` que la coquille pose à droite. `Appearance` est
     VIVANTE (bleue, elle navigue) ; `DM` et `Tools` sont RÉSERVÉES : grises,
     éteintes — *non coloré = non cliquable* — et leur mot est dans le titre. */
  const pied = el("div", "parcours-pied tdc-pied");
  const livre = el("button", "fiche-livre parcours-livre");
  livre.type = "button";
  livre.setAttribute("aria-label", "Rules");
  livre.addEventListener("click", () => { window.open(LIVRE_FH_WEB, "_blank", "noopener"); });
  pied.append(livre);
  /* 📏 « Display », le mot d'Eric du 02/09 — « Appearance » mesurait 110 blg dans
     une cellule qui en donne 77 à chacun des trois, et rognait le livre. */
  pied.append(bouton("Display", "tdc-porte", () => onAction({ kind: "ouvrirDisplay" })));
  for (const mot of ["DM", "Tools"]) {
    const b = bouton(mot, "tdc-porte", () => {});
    b.disabled = true;
    b.dataset.reserve = "true";
    b.setAttribute("title", `${mot} — soon`);
    pied.append(b);
  }
  section.append(pied);

  return section;
}
