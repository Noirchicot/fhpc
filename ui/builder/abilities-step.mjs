/* ══ L'ÉTAPE ABILITIES — refaite au vocabulaire des cadres, lot 80 ═══════
   📐 Croquis `2026-08-16-abilities-quatre-methodes.jpg`, et le mandat
   `LOT-80-ABILITIES.md`. Le croquis fait foi.

   ⭐ CE LOT N'A RIEN INVENTÉ, IL A ASSEMBLÉ. Tous les organes existaient,
   déployés et éprouvés au banc : le glisser (`glisser.mjs`), la rangée FS et
   le collecteur (`ilots-lab.html`), le panneau INFO
   le plateau de dés (`abilities-tray.mjs`), la
   règle de tirage (`dice.mjs`). Ce qui manquait, c'était **l'écran qui les
   tient ensemble**.

   ══ LA FORME — QUATRE MÉTHODES, UN SEUL ENTONNOIR ════════════════════════

       ┌─────────────────────────────────────────┐
       │  CHOOSE AN ABILITY GENERATION METHOD    │  FF2, dalle 35 %
       │  [FH 3D6] [4D6] [ARRAY] [FREE] [INFO]   │
       └─────────────────────────────────────────┘
                            │
        ┌──────────┬────────┼────────┬──────────┐
      FH 3D6      4D6     ARRAY     FREE     (INFO → panneau)
        │          │        │         │
        ▼          ▼        ▼         ▼
       ┌──────────────────────────────────────┐
       │  L'ORGANE  — explication, et le jet  │  FF2, dalle 50 %
       ├──────────────────────────────────────┤
       │  LE VIVIER — la rangée d'îlots FS    │  ← ce que la méthode remplit
       ├──────────────────────────────────────┤
       │  LE COLLECTEUR — six cibles          │  FF2, dalle 50 %
       └──────────────────────────────────────┘

   🔴 LES TROIS ÉTAGES SONT LES MÊMES POUR LES QUATRE MÉTHODES, et c'est ce
   qui rend ce lot faisable : le vivier et le collecteur s'écrivent UNE FOIS,
   et les quatre méthodes ne diffèrent que par **ce qui remplit le vivier**.
   ⛔ NE PAS ÉCRIRE QUATRE ÉCRANS. Le dépôt a déjà payé cette faute deux fois
   (`renderChoixGlisses` vs `renderSlotQcm` au lot 79 ; le plateau vs
   `renderRollBatch` ici même) : deux formes du même geste divergent.

   ══ CE QUI A DISPARU AVEC CE LOT, ET POURQUOI CE N'EST PAS UN RECUL ══════

   · `ABILITY_METHODS` et ses `render` — le mécanisme du lot 45, dont
     personne n'appelait plus les `render` depuis le lot 63 (mesuré : « une
     suite verte ne prouve rien sur ce que personne n'importe »). La
     PROPRIÉTÉ qu'il défendait est intacte, et mieux tenue : une méthode de
     plus est UNE ENTRÉE de plus dans `ABILITY_ENTRIES`, jamais un `if`.
   · `renderAssignRow` / `renderAbilityRow` / `renderManualRow` — les six
     rangées à molette. Le lot 79 en avait déjà fait un repli ; le vivier
     existe désormais dans les quatre méthodes, donc le repli n'a plus de cas.
   · `renderRollBatch` — les pastilles plates de `4d6`. Le plateau sert
     maintenant les DEUX mécaniques (`ROLLING_METHODS`, dice.mjs).
   · `renderRollingChoice` — la molette de méthode de jet. `FH 3D6` et `4D6`
     sont deux TUILES du sélecteur : un choix, pas deux.

   ⛔ ET L'ACTION D'AFFECTATION N'A PAS BOUGÉ D'UN OCTET : `assignAbilityRoll`,
   la forme du lot 50, avec sa clef, son index et sa valeur. C'est `shell.mjs`
   qui décide si c'est une POSE ou un ÉCHANGE (lot 51, §1b). Le document ne
   gagne aucun champ : `set()` continue de poser le SCORE, exactement comme
   avant.

   ⚠️ LE HASARD VIT ICI, ET C'EST VOULU : la loi « le moteur prononce, l'écran
   affiche » parle des RÈGLES OPPOSABLES (`validate()`), pas de la GÉNÉRATION
   d'un nombre que le joueur pose lui-même avec `set()`. Le lot tiré ne
   survit dans AUCUN champ : il vit dans `shell.mjs` (`state.abilityRoll`).

   ⛔ LE PLAFOND N'EST PAS OPPOSÉ ICI : cet écran DÉCLARE l'alerte — une
   phrase, jamais un blocage. Le refus vit au carnet et dans `validate()`. */

import { markPressed } from "./carnet.mjs?v=587";
import { lienAbilityScoresFhWeb } from "./liens-fh.mjs?v=587";
import { renderTray, poserUnDe, LIBELLES } from "./abilities-tray.mjs?v=587";
import { armerJeton } from "./glisser.mjs?v=587";
import { facteurZoomCourant } from "./echelle.mjs?v=587";
import { mecaniqueDeJet, rollAbilitySet } from "./dice.mjs?v=587";
import { createDieHost, mount } from "./dice3d.mjs?v=587";
import { ABILITY_KEYS, CREATION_SCORES, CREATION_SCORE_MAX } from "../../src/build/index.mjs?v=587";

export { rollAbilitySet };

/** La carte d'assignation VIDE — les six clefs à `null`, rien distribué.
 *  Exportée pour que `shell.mjs` la pose sur `state.abilityRoll.assign` à
 *  CHAQUE nouveau lot, sans dupliquer `ABILITY_KEYS` là-bas. */
export function emptyAbilityAssign() {
  const assign = {};
  for (const key of ABILITY_KEYS) assign[key] = null;
  return assign;
}

/* ⛔ `ABILITY_MODE_PATH` est parti avec `currentAbilityMode` : cet écran
   n'écrit ni ne lit plus `abilities.mode`. C'est la coquille qui l'écrit
   quand la méthode change (`shell.mjs`, action `abilityMethod`), et un garde
   d'octets le tient (`tests/abilities-step.test.mjs`). */
const ABILITY_CAP = CREATION_SCORE_MAX; // le 18 arbitré, LU au moteur — jamais réécrit ici

/* ══ 📏 LE VIVIER — CE QUI EST DÉDUIT, ET CE QUI RESTE ÉCRIT ══════════════
   CADRES.md §7 : *« aucune largeur ni hauteur écrite, et c'est LE POINT »* —
   une rangée FS déclare son nombre de colonnes et son écart ; la grille en
   déduit tout le reste.

   🔴 CE FICHIER A ESSAYÉ D'ÉCRIRE LA COTE, ET LA PAGE L'A DÉMENTI. Le relevé
   de banc disait « à 360, îlot 54, dé 46 » ; posée ici en constante et
   mesurée dans le builder à 375, elle a donné un îlot de **51** — parce que
   le champ n'y vaut pas 344 mais **325** (la scène a son propre rembourrage,
   ce que le banc n'avait pas). À 360, la place intérieure d'un îlot tombe à
   ~44, et un dé de 46 y déborde. **Une cote écrite doit rater un seuil un
   jour ; une largeur en pourcentage n'en a aucun à rater.** La géométrie est
   donc rendue à la feuille (`.fs-de { width: 100% }`), avec un plafond pour
   que la palette de FREE — quatre colonnes, donc des îlots deux fois plus
   larges — ne gonfle pas ses dés.

   ⭐ CE QUI RESTE EN PIXELS N'EST PLUS UNE TAILLE, C'EST UNE RÉSOLUTION. Le
   moteur 3D fabrique une IMAGE du dé et veut savoir en combien de pixels la
   dessiner ; la feuille décide ensuite de la place qu'elle occupe. Les deux
   ne se contredisent pas — l'une est une netteté, l'autre une géométrie.
   📌 ET UNE SEULE RÉSOLUTION POUR TOUS LES DÉS, DÉLIBÉRÉMENT : le cache du
   moteur a pour clef `faces|matière|taille|densité|résultat`, et tous nos dés
   montrent la même face. Une seule valeur = **une seule image fabriquée**,
   réutilisée par les seize de la palette. Deux valeurs en fabriqueraient
   deux, pour rien. */
const FS = {
  resolution: 96,     // la NETTETÉ de l'image du dé, jamais sa place à l'écran
  /* 41 = `--de-pose` (tokens.css), la cellule du dé posé : le fantôme est
     IDENTIQUE à l'objet qu'on déplace (règle ② d'Eric). Il faisait 46 quand le
     dé faisait 41 — vu par Eric le 05/09 : *« le fantôme n'est pas sous les
     dés »*. Les deux nombres se nomment l'un l'autre ; en changer un sans
     l'autre refait ce soir-là. */
  fantome: 41         // ⚠️ la seule cote d'affichage écrite — voir `fantomeLever`
};

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/** La dernière valeur posée sur `abilities.<key>` — lue dans
 *  `document.build.choices`, jamais dans `resolved` (qui inclut les boosts
 *  d'Inheritance, hors périmètre de cet écran). */
export function currentAbilityValue(document, key) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const entry = choices.find((c) => c.path === `abilities.${key}`);
  return entry ? entry.value : undefined;
}

/* ══ LES QUATRE MÉTHODES — le sélecteur du croquis ═══════════════════════

   ⌨️ LES LIBELLÉS SONT CEUX DU CROQUIS, mot pour mot : `FH 3D6`, `4D6`,
   `ARRAY`, `FREE`.

   📌 `standard` GARDE SON ID, ET C'EST DÉLIBÉRÉ. Le croquis l'appelle
   `ARRAY` ; l'identifiant, lui, est écrit dans les documents existants
   (`abilities.mode: "standard"`, que le personnage d'exemple porte déjà) et
   dans `standardArrayBatch`. Un id est une clef de données, un libellé est
   pour l'œil — les renommer ensemble aurait périmé des documents pour un mot.
   ⭐ Effet de bord mesuré, et bienvenu : le personnage d'exemple portait une
   méthode que l'écran ne savait pas offrir, et affichait une note pour le
   dire. Elle est offerte maintenant ; la note se tait d'elle-même.

   🔴 `POINT BUY` N'EST TOUJOURS PAS OFFERTE, et pas par oubli : son barème
   (budget de points, coûts non linéaires) n'existe NULLE PART dans le dépôt
   — ni dans `layers/srd-5.2.1-en.layer.json`, ni dans le moteur. L'écrire ici
   mettrait une règle du jeu dans l'interface et publierait des nombres dont
   on ne sait pas s'ils sont SRD (loi §0.8). Une tuile morte serait un faux
   magasin. ⏳ Question posée à Eric, toujours ouverte.

   ⌨️ LES QUATRE EXPLICATIONS COURTES (§5 bis du mandat) : la règle d'abord,
   une phrase. Celle de `FH 3D6` est validée MOT POUR MOT par Eric le
   2026-08-16 ; les trois autres sont des PROPOSITIONS, à relire avant d'être
   figées. Celles des deux méthodes à dés vivent dans `ROLLING_METHODS`
   (dice.mjs), au même endroit que leur mécanique — jamais recopiées ici. */
export const ABILITY_ENTRIES = [
  { id: "fh3d6", label: "FH 3D6", mecanique: "fh3d6" },
  { id: "4d6", label: "4D6", mecanique: "4d6" },
  {
    id: "standard", label: "ARRAY",
    /* ⌨️ LA FORMULATION DU PANNEAU INFO (voir `ROLLING_METHODS` pour la raison
       complète) : celle-ci est passée sous l'œil d'Eric, ma proposition du
       mandat non. Les six nombres ne manquent pas — le vivier les MONTRE juste
       en dessous, et le panneau les répète dans sa colonne de dés. */
    blurb: "Six numbers, handed to everyone."
  },
  {
    id: "free", label: "FREE",
    /* ⏳ CETTE PHRASE N'EST PAS À L'ÉCRAN AUJOURD'HUI, et c'est une DETTE MESURÉE,
       pas un abandon. Eric la veut (*« dans FREE, il faut un aiguilleur sous le
       titre »*, 06/09) ; la page ne l'a pas : sa carte fait 486 blg et elle est
       pleine à 486 pile (organe 46 · palette 205 · collecteur 219 · écarts 16).
       📏 Un aiguilleur coûte **45 de boîte** — son plancher, même pour une seule
       ligne de texte : raccourci à 32 signes, il demande toujours 45 — plus 8
       d'écart, soit **53**. Les seuls postes qui pourraient les payer sont des
       cotes d'Eric : le titre du collecteur (28+8), la ligne de bonus réservée
       (31, sa règle du 05/09 — *« il ne doit pas bouger une fois le dé posé »*),
       le rembourrage du tapis (8). ⛔ Aucune n'est à moi.
       ⭐ En attendant, le `?` porte la règle en entier (`GUIDES.abilities`) — pas
       le vide. Et la phrase reste ICI, entière, parce que c'est la SOURCE : le
       jour où un poste se libère, l'aiguilleur la retrouve sans être réécrit. */
    blurb: "Sixteen dice, 3 to 18 — take any value, as often as you like; the pool never runs out. "
      + "Drag a die off to discard it, or drop another on top to replace it."
  }
];

/** L'explication d'une méthode — celle de sa mécanique de jet quand elle en
 *  a une, la sienne sinon. ⛔ Jamais un `if` sur un id : l'entrée porte soit
 *  `mecanique`, soit `blurb`. */
/* ══ 🌱 LATE BLOOMER — UN TRAIT SE PRÉSENTE COMME UN TOKEN ═══════════════════
   Règle publiée (`ability-scores`, chapitre FH) : si AUCUN jet naturel n'atteint
   14 — le plancher haut a dû intervenir, ≈ 17 % des lots — l'Inheritance porte le
   trait Late Bloomer. Le moteur des jets sait déjà quand c'est le cas
   (`ajuste: "haut"`, dice.mjs) : l'écran LIT ce drapeau, il ne recalcule rien.

   🔴 LA FORME, TRANCHÉE PAR ERIC LE 06/09 AU SOIR — et elle RENVERSE la ligne d'or
   du matin même : *« on fait plus simple pour Late Bloomer, présente-le comme un
   token classique. Il se place sous les caracs, annule le 2ᵉ aiguilleur (ça faut
   pas faire), le token n'a aucune destination mais il se présente comme un trait.
   Clic droit pour info. L'unique aiguilleur dit juste qu'il existe. »* puis
   *« token classique, tu comprends pas, comme un dé »* — non : **l'octogone de
   §2 bis**, celui des lignages et des sorts, pas le cube 3D de cet écran. Puis
   *« il a un liseré vert car il est valide »* — le vert de §2 ter (`--positive`,
   `--creneau-lisere-rempli`), la teinte qui dit *« l'ensemble est bon »*.

   ⛔ CE QUE ÇA SUPPRIME, ET C'EST LE FOND DE L'ORDRE : la ligne d'or sous les six
   collecteurs était un SECOND AIGUILLEUR — un deuxième paragraphe de guidage sur
   un écran qui en porte déjà un. Un écran a un aiguilleur, pas deux (§6 pré bis).
   La prose descend donc dans l'info du token, là où on va la chercher.

   ⏳ L'ANNONCE SEULE EST CÂBLÉE : l'effet (+2 au pool de Skills, l'option
   Expertise au verrou) attend trois réponses d'Eric (`FHPCv2 future updates.md`,
   PRODIGY : le palier `expertise`, la seconde exception au verrou, le cas du
   Rogue). Le nom, lui, est tranché : *« je valide Late Bloomer »* (Eric, 06/09).
   ⚠️ L'info DIT les deux dons parce que le CHAPITRE les publie ; le builder ne les
   applique pas encore. L'écart est nommé ici et porté à Eric — il se referme au
   même endroit que PRODIGY, jamais en retirant la phrase du chapitre. */
const TRAIT_TARDIF = {
  nom: "Late Bloomer",
  /* ⌨️ La prose vient du chapitre `ability-scores` (l'encadré « Late Bloomer —
     when the floor had to catch you »), condensée. ⛔ La RÈGLE se corrige dans le
     chapitre du vault qui la publie, jamais ici. */
  texte: "No natural roll reached 14, so the high floor had to step in — it happens to 17 % of characters. "
    + "The dice were unkind; your character learned faster somewhere else.\n\n"
    + "An Inheritance trait. It gives +2 free points, and the option to buy Expertise at level 1 — an option, never an obligation."
};
export function lotRattrape(rollBatch) {
  return Boolean(rollBatch && Array.isArray(rollBatch.rolls) && rollBatch.rolls.some((r) => r.ajuste === "haut"));
}

function explicationDe(entry) {
  if (entry.mecanique) return mecaniqueDeJet(entry.mecanique).summary;
  return entry.blurb;
}

/** CE QUE FONT LES TROIS BOUTONS — Eric, 06/09 : *« l'aiguilleur doit expliquer ce
 *  que font ces trois boutons »*. Les libellés ne sont pas recopiés : le premier
 *  vient de la mécanique, les deux autres du plateau (`LIBELLES`). Une phrase qui
 *  NOMME un organe se périme avec lui — elle n'est donc dite qu'en scène 1, là où
 *  les boutons existent. */
function motDesBoutons(meca) {
  return `${meca.boutonUn} rolls the next one, ${LIBELLES.flash} rolls them all, ${LIBELLES.reset} starts over.`;
}

/* ⛔ DEUX EXPORTS SONT PARTIS AU LOT 80, ET C'EST LA LOI §0.6 (le code s'en
   va avec ce qui l'appelle) :

   · `currentAbilityMode(document)` — elle lisait `abilities.mode` pour
     DÉCIDER quelle méthode montrer, et disait poliment quand la valeur posée
     n'était offerte par aucune. L'écran ne lit plus ce champ du tout : rien
     n'est déplié tant que le joueur n'a pas touché une tuile (B5.1c), donc il
     n'y a plus de méthode « montrée à la place » à annoncer. Le champ reste
     ÉCRIT (c'est une intention du joueur) ; il n'est simplement plus lu ici.
   · `optionsForRow(rollBatch)` — « toujours les six dés gardés, quel que soit
     l'état de la distribution » (lot 51, §1a). ⭐ LA LOI, ELLE, N'EST PAS
     PARTIE : elle est passée de la LISTE D'OPTIONS d'un picker au VIVIER
     lui-même. Un dé posé reste prenable dans sa cible, et le lâcher sur une
     autre les échange — c'est le même invariant, lu au bon endroit, et
     `tests/abilities-step.test.mjs` le prouve maintenant à travers le rendu
     plutôt qu'à travers une fonction que plus personne n'appelait. */

/* ⌨️ LE NOM ENTIER — Eric, 05/09 au soir : *« Strength / Intelligence (rouge oxblood),
   en entier, centré sur chaque dé »*. Mesuré à 375, colonne de 51,8 : en T1
   « Constitution » fait 57 et « Intelligence » 54,3 — ils débordent de 1 à 3 px
   de chaque côté dans l'écart de 8 entre colonnes ; les quatre autres tiennent.
   Eric a tranché T0 gras le 05/09, puis le 06/09 : *« Strength en T1, et autorise la
   sortie de la cellule »* — T1 gras, le nom déborde dans l'écart, rien ne le coupe. */
const NOMS_DE_CARAC = { str: "Strength", dex: "Dexterity", con: "Constitution", int: "Intelligence", wis: "Wisdom", cha: "Charisma" };
function abilityLabel(key) { return NOMS_DE_CARAC[key] || key.toUpperCase(); }

/** Le modificateur, écrit comme un joueur l'écrit : `+2`, `0`, `-1`. */
function motDuMod(mod) {
  if (typeof mod !== "number") return "—";
  return mod >= 0 ? `+${mod}` : String(mod);
}

/* ⛔ `renderCapWarning` EST PARTIE AVEC SON BALISAGE (loi §0.6) — Eric,
   2026-08-17 : *« enlève partout la mention “> 18 at creation”. Ce sera
   rappelé plus tard, là ça fait juste moche »*.

   🔴 CE QUI DISPARAÎT EST L'AVIS, PAS LA RÈGLE, et la différence est entière.
   Le plafond de 18 à la création (lot 50, §2d — au niveau 1 seulement, le SRD
   reprenant la main à 20 au-delà) est OPPOSÉ par `validate()` et par le
   carnet ; cet écran ne faisait que le RÉPÉTER, et il l'avait toujours dit
   lui-même (*« alerte seulement — RIEN n'empêche `onAction` de partir plus
   haut »*). Un joueur qui dépasse 18 sera donc arrêté exactement comme avant,
   simplement pas ici.
   📐 ET ELLE COÛTAIT PLUS QU'UNE LIGNE : sur un téléphone, `> 18 at creation`
   sous une case de 48 imposait ~60 px de largeur minimale à SA colonne, qui
   les volait aux cinq autres — c'est ce qui écrasait cinq dés sur six le
   2026-08-17. `minmax(0, 1fr)` a réglé la cause générale ; ce retrait enlève
   le cas qui l'avait révélée.
   ⏳ Elle « sera rappelée plus tard » : à l'écran qui récapitule, pas sous une
   cible de dépôt de 48 px. */

/* ══ LA COLONNE « FINAL » — lot 46, inchangée au lot 80 ═══════════════════
   Le défaut d'origine, mesuré à l'écran : la ligne montrait le CHOIX BRUT
   (13) à côté d'un modificateur qui n'était PAS le sien (+2, celui du score
   FINAL 14, boosts d'Inheritance compris) — deux registres, aucun mot pour le
   dire, et le score final nulle part.

   ⛔ DEUX LOIS TENUES ICI :
   1. ce qui est éditable reste le CHOIX BRUT — c'est lui que `set()` écrit ;
   2. `score`/`mod` sont LUS dans `resolved.abilities[key]`, À L'OCTET —
      jamais recalculés. Cette fonction ne fait AUCUNE arithmétique.

   ⭐ ET C'EST LE SEUL MODIFICATEUR DE L'ÉCRAN — Eric, 2026-08-16 : *« aucun
   intérêt de mettre les bonus sous chaque dé, seulement en bas dans le
   collecteur »*. Un modificateur BRUT posé au vivier n'aurait été celui de
   personne : un dé n'appartient encore à aucune caractéristique, et son brut
   ne survit pas à la pose (les boosts d'héritage le changent). Deux nombres
   pour un dé, dont un qui ne serait jamais vrai — la contradiction du lot 46,
   réintroduite un étage plus haut. */
export function renderFinalColumn(resolved, key, rawValue, options) {
  if (!resolved || !resolved.abilities || !resolved.abilities[key]) return null;
  const { score, mod } = resolved.abilities[key];
  if (typeof score !== "number") return null;
  const cell = el("span", "ability-row-final");
  const boosted = rawValue !== undefined && score !== rawValue;
  cell.dataset.boosted = String(boosted);
  /* ══ ⭐ LE MODE COMPACT — LE BONUS SEUL, ET C'EST UNE DÉCISION D'ERIC ══════
     2026-08-16 : *« en dessous, à l'extérieur du carré, apparaît le BONUS de
     carac »*. Sous un dé posé, il ne veut que le modificateur.

     🔴 J'AI OBJECTÉ, IL A TRANCHÉ, ET LA RAISON EST ÉCRITE ICI POUR QU'UN
     PROCHAIN LOT NE « RÉPARE » PAS ÇA DANS MON SENS. Mon objection : sur son
     propre personnage d'exemple, CON porte **13**, un boost d'héritage le
     monte à 14, donc le modificateur vaut **+2** — et un « +2 » sous un dé qui
     affiche « 13 » est mot pour mot la contradiction que le lot 46 a corrigée.
     J'avais donc fait revenir le score dès qu'il diffère (`14 (+2)`).
     ⭐ SA RÉPONSE : *« je m'en fous, le dé nomme la carac »*. Et elle se tient
     — sur cet écran, le dé qu'on pose EST le score de base qu'on choisit ; ce
     que le boost en fait appartient à la fiche, pas au geste. Le lot 46
     réparait un écran où le brut et le final se disputaient la MÊME ligne
     sans qu'un mot les sépare ; ici le dé dit le choix, le bonus dit ce qu'il
     donne, et les deux sont à deux endroits distincts.
     ⛔ Ne pas remettre le score : ce serait rouvrir un arbitrage tranché. */
  if (options && options.compact) {
    /* 🎨 LE SIGNE DIT LA COULEUR — Eric, 05/09 : *« +1/+x en vert, 0 en noir,
       −1/−x »* (rouge), et *« sous le bonus, en italique T1, "bonus" »*. */
    cell.dataset.signe = mod > 0 ? "plus" : mod < 0 ? "moins" : "zero";
    cell.append(el("span", "ability-row-final-value", [text(motDuMod(mod))]));
    cell.append(el("span", "ability-row-final-mot", [text("bonus")]));
    return cell;
  }
  /* ⌨️ PLUS DE MOT « Final » — Eric, 2026-08-16, en montrant le collecteur du
     banc : *« il affiche les bonus »*, et son croquis n'écrit qu'un `+1` sous
     chaque dé. L'étiquette coûtait une ligne dans une case de 48 px.
     ⛔ MAIS LE SCORE RESTE AVEC SON MODIFICATEUR, et ce n'est pas négociable :
     son croquis montre `+1` seul, or une carac boostée afficherait `+2` sous
     un dé qui dit `13` — la contradiction EXACTE que le lot 46 a corrigée
     (« 13 à côté d'un +2 qui appartenait au 14 »). Le nombre qui précède le
     modificateur est ce qui l'empêche de mentir. Sans boost, il répète
     simplement le dé, et ne coûte rien. */
  cell.append(el("span", "ability-row-final-value", [text(`${score} (${motDuMod(mod)})`)]));
  return cell;
}

/* ══ UN DÉ QUI PORTE UN SCORE — levé du banc `ilots-lab.html` ═════════════
   🔴 LE MOTEUR REFUSE D'ÉCRIRE 15 SUR UN D6, ET IL A RAISON : un d6 ne PEUT
   pas faire 15, et il ne ment pas sur un jet. Or ici le chiffre n'est PAS un
   jet — c'est un score posé sur un dé qui sert de socle. C'est donc à l'écran
   de l'écrire, et à l'incrustation du moteur de se taire (la feuille la
   masque, `.porte-de .fh-cd-static-die-result`).

   ⛔ `snapshot: true`, ET C'EST UN COMPTE MESURÉ, PAS UNE PRÉCAUTION. Un dé
   non animé ne libère JAMAIS son contexte WebGL (`settleToSnapshot` ne part
   que sur `data-animate="1"`), et le navigateur en plafonne le nombre.

   📏 LE PLAFOND, MESURÉ LE 2026-08-16 ET NON PLUS RECOPIÉ : on ouvre des
   contextes un par un jusqu'à ce que le plus ancien se perde. **Chromium en
   tient 16 ; le dix-septième coûte le premier.** Compté sur FREE : 16 dés de
   palette + 6 dés posés = **22**. L'écran serait devenu noir SANS UNE SEULE
   ERREUR. Le chemin image n'en ouvre aucun.
   ⚠️ ET LA MESURE NE COUVRE QUE CHROMIUM. Eric teste sur iPhone SE et iPad,
   donc sur Safari iOS — dont le plafond n'a été mesuré nulle part, ici ni
   ailleurs. Il est réputé PLUS BAS, jamais plus haut ; le chemin image est
   donc au moins aussi nécessaire là-bas. C'est ce qui rend la mesure
   suffisante pour décider sans être suffisante pour se rassurer.
   📌 CE QUE CETTE NOTE CORRIGE : le « ~16 » traînait dans ce dépôt comme un
   fait, recopié de doc en doc, sans que la plateforme de mesure soit écrite
   nulle part (relevé par l'architecte du lot 79). Un chiffre dont on ignore
   la provenance et dont on est à 22 n'est pas un appui.
   ⛔ ET AUCUN STYLE EN LIGNE : la taille du chiffre vit dans la feuille
   (`--fs-de`), pas dans un `style.fontSize` — le banc s'en dispensait, la
   production non (garde 7 des jetons). */
/* 🧊 `poserUnDe` VIT AU PLATEAU depuis le 2026-09-05 — il sert les dix résultats
   ET les six gardés, donc il a un seul écrivain, et c'est le module qui écrit les
   dix. Importé ci-dessus. */

/* ══ LE FANTÔME — le dé qui suit le doigt ════════════════════════════════
   Eric, 2026-08-16 : *« je veux voir l'image du dé qui se déplace »*.

   🔴 IL EST POSÉ EN COORDONNÉES D'ÉCRAN, et c'est la seule façon honnête :
   le jeton d'origine vit dans une scène qui défile ; un fantôme dans le même
   flux se ferait couper par le premier `overflow`.
   ⛔ `pointer-events: none` (feuille) — le point qui cherche la cible tombe
   PILE sur le fantôme depuis qu'il est déporté (`FANTOME_DECALAGE`), et sans
   cette ligne l'organe ne verrait jamais que lui. C'est le piège classique de
   cette forme, et le décalage l'a rendu certain au lieu de probable.
   ⚠️ MONTÉ UNE FOIS PAR GESTE, JAMAIS PAR IMAGE — un fantôme reconstruit à
   chaque image épuiserait le plafond de contextes en une seconde. On le monte
   au LEVER, on ne fait plus que le déplacer ensuite.
   ⚠️ ET IL SE RANGE SANS CONDITION à la fin du geste, y compris annulé : un
   fantôme qui survit à son geste est pire que pas de fantôme du tout.

   ⛔ LE DÉPLACEMENT EST LE SEUL STYLE EN LIGNE DE CE FICHIER, et il est
   inévitable : une position qui suit un doigt ne peut pas vivre dans une
   feuille. Il ne porte AUCUNE couleur, AUCUNE taille, AUCUN corps — rien de
   ce que le garde 7 des jetons protège. Le décor du fantôme (l'ombre portée,
   l'agrandissement) vit, lui, dans `shell.css`. */
/* ══ LA POSE DU FANTÔME — celle du banc, à l'octet (Eric, 2026-08-17) ═════
   *« positionne le fantôme comme dans ce dice lab »* → `ilots-lab.html`.

   🔴 CE QUI ÉTAIT CASSÉ N'ÉTAIT PAS LE DÉCALAGE, C'ÉTAIT LA COMPOSITION, et
   c'est **mesuré** dans le navigateur, pas déduit. La feuille portait
   `scale: 1.15` comme PROPRIÉTÉ INDIVIDUELLE, et `transform: translate(…)`
   à côté. Or CSS Transforms 2 compose `translate` · `rotate` · `scale`
   individuels PUIS la propriété `transform` — le `transform` est donc le plus
   INTERNE, et il se fait multiplier par l'échelle.
   📐 Mesuré : une boîte de 46 à `scale: 1.15` + `transform: translate(100, 200)`
   pose son centre à **(138, 253)**, pas à (123, 223). La translation vaut
   115/230, jamais 100/200.
   ⛔ CONSÉQUENCE, ET ELLE EXPLIQUE CE QU'ERIC A VU : le centre tombait à
   `1,15·x − 42,55`. À gauche de l'écran le dé partait 27 px trop loin ; passé
   x ≈ 284 il repassait **À DROITE du doigt** — l'exact contraire de ce qui
   avait été demandé. Un décalage qui DÉRIVE avec la position ne se lit pas
   comme un décalage, il se lit comme un dé qui glisse.

   ⭐ LA FORME DU BANC N'A PAS CE DÉFAUT parce qu'elle met TOUT dans le même
   `transform` : `translate(…) scale(1.15)`. La translation est alors extérieure
   à l'échelle, donc littérale. C'est la seule raison pour laquelle le banc
   « tombe plus juste sous le doigt » — pas un réglage plus fin, une composition
   correcte.

   📐 CE QUE LE BANC POSE VRAIMENT, une fois le calcul fait : `demi` y vaut la
   demi-largeur **rendue** (26,45), pas la demi-boîte (23). Le centre atterrit
   donc à `x − 3,45` — le fantôme est **très légèrement** en haut à gauche du
   doigt, de la même façon partout sur l'écran. C'est cette pose-là qu'Eric a
   jugée bonne à l'usage, et elle se DÉDUIT (jamais un nombre écrit). */
const FANTOME_ECHELLE = 1.15;

let fantome = null;
let fantomeDemi = 0;
/** Les jets du dernier lot dont le podium a joué la pose — voir `renderVivier`. */
let dernierLotPose = null;

function fantomeRanger() {
  if (!fantome) return;
  fantome.remove();
  fantome = null;
}

function fantomeLever(valeur, x, y) {
  fantomeRanger();
  if (!document.body) return;   // pas de page (hors navigateur) : pas de décor
  fantome = el("span", "ability-fantome");
  poserUnDe(fantome, valeur, FS.resolution, 0);
  /* ⭐ LA DEMI-TAILLE EST CONNUE, PAS MESURÉE, et c'est un vrai gain : lire
     `getBoundingClientRect()` à chaque `pointermove` force un recalcul de mise
     en page par image, pendant le seul moment de l'écran où il faut être
     fluide. On tient le dé par la taille qu'on vient de lui donner.
     🔴 ET LA DEMI-TAILLE NE COMPTE PAS L'AGRANDISSEMENT — c'est une faute que
     j'avais commise, et c'est Eric qui l'a vue à l'usage : *« dans ce code [le
     banc `ilots-lab`] la position du dé est beaucoup plus logique sous le
     doigt »*.
     LA RAISON, ET ELLE EST GÉOMÉTRIQUE : `translate(x−d, y−d)` puis un
     `scale` autour du CENTRE (`transform-origin: center`) posent le coin haut
     gauche à `x−d`, puis agrandissent SANS déplacer le centre. Le centre
     atterrit donc à `x − d + largeur/2`, et pour qu'il tombe sous le doigt il
     faut `d = largeur / 2` — la largeur de la BOÎTE, pas celle du rendu.
     ⛔ En multipliant par 1,15, je décalais le dé de 3,5 px vers le haut ET
     vers la gauche à chaque image. Assez peu pour passer inaperçu à la
     lecture du code, assez pour se sentir au pouce.
     📌 Une seule cote reste recopiée de la feuille : `FS.fantome` (46 px, sa
     largeur — il vit hors de toute colonne, donc il n'hérite d'aucune). */
  /* ⭐ LA DEMI-LARGEUR EST CELLE DU RENDU, PAS CELLE DE LA BOÎTE — c'est ce
     que fait le banc (`getBoundingClientRect().width / 2`, qui inclut
     l'échelle), et c'est ce qui donne sa pose. Ici on la CALCULE au lieu de
     la mesurer : lire un rectangle à chaque image force un recalcul de mise
     en page pendant le seul moment de l'écran qui doit être fluide, et on
     connaît déjà les deux facteurs. */
  fantomeDemi = (FS.fantome * FANTOME_ECHELLE) / 2;
  /* 🔴 DANS `.app`, PAS SUR `<body>` — corrigé le 2026-08-30 au soir.
     Le zoom du builder vit sur `.app` (shell.css), et `.app` est un enfant de
     `<body>` : un fantôme posé sur le corps ÉCHAPPE donc à l'échelle. Mesuré
     au cran 3 : l'organe sous le doigt se peignait à 261 px et son fantôme à
     87 — trois fois trop petit, pendant le seul geste où l'œil compare les
     deux. « TOUT LE BUILDER SUIT LE ZOOM » était faux ici, et aucun test ne
     pouvait le dire.
     ⚠️ Le repli sur `<body>` reste, pour le seul cas où `.app` n'existe pas
     (bancs, stub DOM) : un fantôme mal placé vaut mieux qu'un geste qui jette. */
  (document.querySelector(".app") || document.body).append(fantome);
  fantomeBouger(x, y);
}

/** Où le CENTRE du fantôme se pose, à partir du point de contact. ⭐ Une
 *  seule fonction pour les deux usages — la peinture ci-dessous et la visée
 *  passée à `glisser.mjs` — parce qu'un fantôme et une visée qui
 *  divergeraient d'un pixel rendraient le geste inexplicable.
 *  📐 L'écart (3,45 px vers le haut et la gauche) se DÉDUIT de la pose : le
 *  coin part à `x − demi_rendu`, le centre revient de `demi_boîte`. */
function fantomeCentre(x, y) {
  const ecart = fantomeDemi - FS.fantome / 2;
  return [x - ecart, y - ecart];
}

function fantomeBouger(x, y) {
  if (!fantome || !fantome.style) return;
  /* 🔴 L'ÉCHELLE EST DANS CE `transform`, ET ELLE DOIT Y RESTER — la sortir
     dans la propriété `scale` de la feuille multiplierait cette translation
     par 1,15 (mesuré : voir l'en-tête de section). Le banc les tient
     ensemble ; on les tient ensemble. */
  /* 🔴 LE DOIGT PARLE EN PIXELS DE FENÊTRE, LE FANTÔME EN BLG — le fantôme vit
     dans `.app`, qui porte le zoom : un `translate(N px)` y est peint à N × zoom.
     Le lot 125 avait fermé cette faute dans `glisser.mjs` en croyant que c'était
     *« le dernier site du dépôt »* ; celui-ci la portait encore, et Eric l'a vue
     sur l'iPad (zoom > 1) : *« le fantôme n'est pas sous les dés »*, et le dé
     n'arrivait pas *« de la case A à la case B »* — on vise avec un fantôme qui
     n'est pas là où la page dépose. On divise donc AVANT de poser, par le facteur
     lu sur la racine d'échelle (jamais sur le fantôme). Sans `.app`, le facteur
     vaut 1 et l'expression est celle d'avant. */
  const z = facteurZoomCourant() || 1;
  fantome.style.transform =
    `translate(${x / z - fantomeDemi}px, ${y / z - fantomeDemi}px) scale(${FANTOME_ECHELLE})`;
}

/** Les quatre rappels du fantôme, les mêmes pour tout dé armé. */
function gestesDuFantome(valeur) {
  return {
    onLever: (x, y) => fantomeLever(valeur, x, y),
    onBouger: (x, y) => fantomeBouger(x, y),
    onPoser: () => fantomeRanger(),
    /* ⭐ LE FANTÔME VISE, PAS LE DOIGT (Eric, 16/08 au soir). Même fonction
       que la peinture : c'est ce qui garantit que la cible allumée est celle
       que le dé recouvre. */
    viseur: fantomeCentre
  };
}

/* ══ LE VIVIER — LA RANGÉE D'ÎLOTS FS ════════════════════════════════════
   CADRES.md §7 : *« un FS n'est pas une fenêtre, c'est une TUILE »* — un petit
   objet flottant, répété en rangée, qui porte UNE chose. Il n'a ni marges ni
   hauteurs : seulement un écart et un nombre de colonnes.

   📌 LA RANGÉE ENTIÈRE EST UNE CIBLE DE DÉPÔT (`data-creneau`), et une seule
   plutôt que six : viser SON îlot à lui, au pouce, sur 54 px, serait un jeu
   d'adresse. Ce que « lâcher ici » veut dire dépend de la méthode — voir
   `RETOUR_VIVIER` juste en dessous.

   🔴 CE QUE « LÂCHER SUR LE VIVIER » FAIT, ET LA DIVERGENCE EST VOULUE
   (§5.3 du mandat) :
   · en **FREE**, le vivier est INÉPUISABLE : y ramener un dé posé le
     **DÉTRUIT**. C'est le geste de retrait qu'Eric décrit — *« tu peux
     dégager les dés posés en les glissant dans le vide »* ;
   · dans les **trois autres**, y ramener un dé posé le REND au podium
     (05/09 au soir, *« aller-retour »*). `rebuild()` JETTE si l'une des six
     valeurs manque au document (`derive.mjs`) — donc le retour ne vide PAS le
     document, il vide la carte `assign` ; la porte compte les poses. La loi du
     lot 45 (« on réarrange en posant, jamais en vidant ») ne visait que le
     document : elle tient toujours, à l'étage où elle est vraie.
   ⭐ FREE peut se le permettre PARCE QUE SA PORTE COMPTE LES POSES, pas les
   valeurs du document (voir `abilitiesValidate`). Le document y garde sa
   dernière valeur — il le doit —, l'écran dit « rien de posé », et `DONE`
   s'éteint. Les deux vérités ne se contredisent pas : elles ne parlent pas de
   la même chose. */
const RETOUR_VIVIER = "vivier";
/** Le préfixe des cibles-pastilles du podium : `podium:<index du jet>`. */
const PODIUM = "podium:";
/* ⛔ `CRENEAU_VIVIER` A VÉCU UNE HEURE. Il nommait les six créneaux que la
   palette de `FREE` remplissait, avant qu'Eric ne reprenne : *« les îlots vont
   être utiles dans 4D6 et 3D6 mais pas ici »*. Sa page n'a que deux dalles, et
   la palette vise directement la zone de réception. */

function renderVivier(ctx) {
  const { rollBatch } = ctx;
  /* ⛔ `FREE` N'A PAS DE RANGÉE D'ÎLOTS, ET C'EST ERIC QUI L'A REPRIS —
     2026-08-16 : *« les îlots vont être utiles dans 4D6 et 3D6 mais pas ici ;
     garde ce code et mets-le de côté »*. Sa page a DEUX dalles, pas trois : la
     FF1 (explication + palette) et, dessous, celle qui contient la ZONE DE
     RÉCEPTION des dés. On glisse de la palette aux caractéristiques, sans
     étape intermédiaire.
     ⭐ LE CODE, LUI, NE BOUGE PAS D'UNE LIGNE : cette fonction sert toujours
     `FH 3D6`, `4D6` et `ARRAY`, qui ont bien six valeurs à poser dans une
     rangée. Ce n'est pas du code mis « de côté » au sens où il dormirait —
     il est sur le chemin vivant de trois méthodes sur quatre. */
  if (ctx.composable) return null;
  const gardes = (rollBatch && Array.isArray(rollBatch.rolls) ? rollBatch.rolls : []).filter((r) => r.kept);
  if (gardes.length === 0) return null;

  /* ⛔ PAS DE `glisse-vivier` ICI, ET C'EST UNE COLLISION MESURÉE : cette
     classe pose `display: flex; flex-wrap: wrap` et une dalle à elle, et sa
     règle vient APRÈS `.fs-rangee` dans la feuille — à spécificité égale, elle
     l'emporterait, et la grille d'îlots redeviendrait une rangée de pastilles
     qui se replient. Le vivier des caractéristiques n'est pas le vivier des
     sorts : c'est une rangée FS, et elle porte son propre nom. */
  const rangee = el("ul", "ability-des-gardes fs-rangee");
  rangee.dataset.creneau = RETOUR_VIVIER;
  rangee.dataset.pool = "fini";
  /* 🏆 LE PODIUM — Eric, 2026-09-05 : *« 6 îlots idem au code actuel sauf que la
     dalle est invisible ; sur chaque îlot un cercle vert (image) ; sur chaque
     cercle, à la fin du tirage, vient se poser un d6 issu de la sélection »*.
     La feuille lit ce drapeau : fond de cercle, plus de verre, et l'animation
     de pose au montage. La pastille bleue est une OPTION DE CONSTRUCTION (Eric)
     — un jeton la commute, `--podium-pastille`. */
  rangee.dataset.podium = "true";
  /* 🎬 LA POSE NE JOUE QU'À L'ARRIVÉE DU LOT — Eric, 05/09 : *« je ne veux pas un
     blink de tous les dés quand je déplace un dé »*. Chaque geste redessine
     l'écran, et les six dés rejouaient leur animation. Le lot est reconnu par
     l'identité de ses DIX JETS (`rolls`) : un dépôt, un retour, un échange
     recréent la carte `assign`, jamais les jets ; seul un nouveau tirage les
     recrée. Le drapeau `data-pose` n'est posé que cette fois-là. */
  if (rollBatch.rolls !== dernierLotPose) { rangee.dataset.pose = "true"; dernierLotPose = rollBatch.rolls; }

  /* 🔁 L'ORDRE DU PODIUM VIT DANS LE LOT (`rollBatch.podium`, des index de jets) —
     Eric, 05/09 : *« manque la possibilité de se déplacer d'un podium à l'autre »*.
     Sans cette carte, l'ordre était celui des jets et un dé revenait toujours à
     SA place. Chaque pastille est désormais une cible à elle (`podium:<index du
     jet dont c'est la place>`), et lâcher un dé dessus ÉCHANGE les deux places —
     que la pastille soit pleine ou vidée. La rangée reste la cible « vivier »
     entre les pastilles : lâcher là rend le dé à sa place. */
  const parIndexGarde = new Map(gardes.map((r) => [r.index, r]));
  const ordre = Array.isArray(rollBatch.podium) && rollBatch.podium.every((i) => parIndexGarde.has(i)) && rollBatch.podium.length === gardes.length
    ? rollBatch.podium.map((i) => parIndexGarde.get(i))
    : gardes;
  for (const roll of ordre) {
    const item = el("li", "fs");
    item.dataset.creneau = `${PODIUM}${roll.index}`;
    /* Un dé PARTI sur une caractéristique laisse un trou — et le trou GARDE SA
       PLACE : la rangée ne se referme pas, sinon les cinq autres bougeraient
       sous le doigt en plein geste. */
    const vide = roll.total === null || roll.total === undefined || ctx.tenuPar(roll) !== null;
    item.dataset.vide = String(vide);
    if (vide) {
      /* 🕳️ L'ORIGINE DEVIENT UN COLLECTEUR QUAND LE DÉ L'A QUITTÉE — Eric, 05/09
         au soir : *« un token = un collecteur = 1 dé = un carré de la forme du dé
         = une dépression carrée. Toujours possible de bouger les tokens entre
         l'origine (qui devient un collecteur quand quitté par le dé) et la
         destination, idem »*. Le disque porte donc la MÊME dépression que les
         six cases d'en bas (`renderCibleVide`), et le dé y revient. Le nœud
         `.fs-vide` tient la place, la hauteur d'un dé. */
      item.append(el("span", "fs-vide", [renderCibleVide()]));
      rangee.append(item);
      continue;
    }
    item.append(renderJetonDe(roll, FS.resolution, {
      chezSoi: true,
      onTap: () => ctx.poserAuPremierLibre(roll),
      onDepot: (ou) => {
        if (ou === RETOUR_VIVIER) return;
        if (ou.startsWith(PODIUM)) { ctx.placerAuPodium(roll, ou, null); return; }
        ctx.poser(ou, roll);
      }
    }));
    rangee.append(item);
  }
  return rangee;
}

/** UN DÉ ARMÉ — le MÊME objet des deux côtés, et c'est tout l'enjeu.
 *  Eric, 2026-08-16 : *« je veux pouvoir les remettre dans le conteneur
 *  d'origine — que ça marche dans les 2 sens »*.
 *
 *  ⭐ UN SEUL FABRICANT, DEUX ORIGINES. Un dé posé dans une cible n'est pas un
 *  autre objet : c'est le même, qui sait seulement d'où il part. Deux
 *  fabricants auraient donné deux gestes qui divergent — la faute que
 *  `glisser.mjs` existe pour éviter.
 *
 *  ⛔ AUCUN MODIFICATEUR SOUS UN DÉ — TRANCHÉ PAR ERIC LE 2026-08-16 :
 *  *« aucun intérêt de mettre les bonus sous chaque dé, seulement en bas dans
 *  le collecteur »*.
 *  🔴 CE QUE ÇA CORRIGE, ET CE N'EST PAS QU'UN GOÛT. Le §5.2 du mandat lisait
 *  son *« à mettre sous chaque dé »* comme valant AUSSI pour le vivier, et un
 *  modificateur BRUT y avait été posé (`abilityModOf`). Deux choses s'en
 *  allaient de travers :
 *  · le vivier montrait un modificateur qui n'est celui de PERSONNE — un dé
 *    n'appartient encore à aucune caractéristique, et son brut ne survit pas
 *    à la pose (les boosts d'héritage le changent). Deux nombres pour un dé,
 *    dont un qui ne sera jamais vrai : c'est la contradiction du lot 46,
 *    réintroduite ailleurs.
 *  · et il coûtait une LIGNE par tuile — mesuré, 91 px de haut au lieu de 73.
 *    C'est ce qui rendait le 4 × 4 trop grand pour son champ, et donc ce qui
 *    m'a fait proposer un plafond et un second défilement. Le retirer résout
 *    les deux d'un coup.
 *  ⭐ LE MODIFICATEUR QUI COMPTE EST DANS LA CIBLE, et il y était déjà : le
 *  FINAL, boosts compris, lu dans `resolved.abilities` par `renderFinalColumn`
 *  — le seul des deux que le joueur puisse opposer à quoi que ce soit. */
function renderJetonDe(roll, taille, { chezSoi, onTap, onDepot, onHorsCible }) {
  /* ⛔ NI `glisse-jeton` : elle habille une PASTILLE (bordure, rembourrage,
     hauteur tactile). Ici l'objet qu'on prend est le DÉ lui-même — `fs-de` ne
     pose que ce qu'il faut pour le prendre (`touch-action`, le curseur, la
     sélection coupée). Deux habillages sur un même bouton se seraient
     contredits, et le plus tardif dans la feuille aurait gagné. */
  const jeton = el("button", "ability-de-garde fs-de");
  jeton.type = "button";
  jeton.dataset.valeur = String(roll.index);
  jeton.dataset.pris = String(!chezSoi);
  jeton.setAttribute("aria-label", chezSoi
    ? `${roll.total} — to place`
    : `${roll.total} — placed, drag to move`);
  /* ⛔ AUCUN TOTAL AU-DESSUS DU DÉ NON PLUS — Eric, 2026-08-16 : *« enlève les
     chiffres au-dessus des dés aussi »*. Le dé PORTE déjà sa valeur, peinte
     sur sa face (`.valeur`) ; la répéter au-dessus était le même nombre écrit
     deux fois à dix pixels d'écart. C'est la seconde ligne que la tuile perd,
     après le modificateur — et c'est ce qui laisse le 4 × 4 tenir sans qu'on
     ait rien à borner.
     ⭐ La valeur reste DITE à qui ne la voit pas : l'`aria-label` du jeton la
     porte en toutes lettres (« 16 — to place »). On retire un doublon visuel,
     pas une information. */
  poserUnDe(jeton, roll.total, taille, roll.index);
  /* Le détail « 5+5+6 » est DANS le croquis, sous chaque dé. Un tirage sans
     détail (le tableau standard, la palette) n'affiche pas de ligne vide.

     ⭐ UNE SEULE NOMENCLATURE, TOUJOURS — Eric, 2026-08-17 : *« tes totaux
     changent de nomenclature avec le 8 et le 14 ; moi je préfère
     minimaliste »*. Deux jets voisins s'écrivaient de deux façons (`3+2+4` et
     `3+6+2 → 14`), et une ligne qui change de forme selon le cas se lit deux
     fois avant d'être comprise. Le détail dit désormais **ce qui est tombé**,
     rien d'autre : trois dés, deux `+`.
     ⛔ CE QUE ÇA RETIRE, ET JE L'AVAIS ÉCRIT COMME UN ARGUMENT CONTRAIRE :
     sous un dé à 14, `3+6+2` ne fait pas 14 — le plancher a parlé et la ligne
     ne le dit plus. C'est assumé : le dé porte le total, la règle est écrite en
     toutes lettres au-dessus (*« si votre meilleur reste sous 14, il devient
     14 ; votre pire devient toujours 8 »*), et l'infobulle du plateau garde la
     forme longue (`abilities-tray.mjs` : `4+4+4 = 12 → 14`). L'écart n'est donc
     ni caché ni répété — il est dit une fois, à l'endroit qui l'explique. */
  /* 🧊 LE DÉTAIL « 5+5+6 » NE VIT PLUS SOUS LE DÉ — Eric, 2026-09-05 : *« ne mets
     pas les calculs sous les podiums »*. Depuis ce jour les DIX cases du tapis
     bleu portent chaque détail, barré quand un plancher a parlé : le dire une
     seconde fois sous le dé gardé serait le même nombre à trente blg d'écart —
     la faute que le 16/08 avait déjà retirée pour le total. ⛔ L'ajustement
     reste VISIBLE, à l'endroit qui l'explique : la case. */
  /* 🗑️ LÂCHÉ HORS DE TOUTE CIBLE — Eric, 06/09 : *« il faut qu'on puisse balancer
     un dé dans le vide pour évacuer un collecteur »*. `glisser.mjs` distingue
     déjà les deux cas depuis le 20/08 (*« pour un jeton du VIVIER c'est un
     non-geste ; pour le contenu d'un RÉCEPTEUR c'est le geste d'annulation »*) —
     il attendait seulement qu'un appelant le lui dise. ⛔ Rien n'est passé quand
     l'appelant n'en veut pas : un dé du podium lâché dans le vide rentre chez lui,
     et B1 est figé. */
  armerJeton(jeton, Object.assign(gestesDuFantome(roll.total), { onTap, onDepot, onHorsCible }));
  return jeton;
}

/* ══ LE COLLECTEUR — les six cibles, et le pied du croquis ═══════════════
   `DRAG AND DROP HERE`, puis STR DEX CON INT WIS CHA.

   ⛔ LE PIED (`BACK` / `DONE`) N'EST TOUJOURS PAS PRODUIT ICI, ET C'EST UNE
   DÉCISION D'ERIC. §5.1 du mandat : *« ils ne sont pas la sortie d'Abilities,
   ils sont LE PATRON de la sortie d'étape »*. Un seul producteur,
   `shell.mjs` (`renderSortieEtape`) — les écrire ici en ferait la sortie d'UN
   écran, et le prochain lot en écrirait une seconde.

   ⭐ MAIS LE CROQUIS LES DESSINE DANS CETTE BOÎTE, et Eric l'a redit le
   2026-08-17 : *« Back et Done vont en dessous du texte “Drag a die onto an
   ability” »*. Ce bloc DÉCLARE donc qu'il les héberge (`data-sortie-ici`) —
   il ne les fabrique pas. C'est le même partage que `data-scroller="grille"`
   au lot 79 : **le marqueur est une déclaration, pas une inférence**, et la
   coquille reste seule à savoir ce qu'est une sortie et quand elle existe.
   📌 Conséquence voulue : sur la page racine, où la coquille ne produit AUCUNE
   sortie, ce marqueur ne reçoit rien — il n'y a rien à accorder entre eux. */
/** LA CIBLE VIDE — une DÉPRESSION CARRÉE à la forme du dé, qui dit « drop here ».
 *  Eric, 05/09 au soir : *« un token = un collecteur = 1 dé = un carré de la
 *  forme du dé = une dépression carrée »* — le creux de la famille §2 (là où
 *  quelque chose SE POSE), jamais le relief (là où quelque chose EST posé) :
 *  le dé, lui, a son relief. La même cible sert le collecteur d'en bas et le
 *  podium quand son dé l'a quitté. Et plus tôt le même jour, devant
 *  les mires à trois cercles : *« tes collecteurs = carrés avec drop here, pas
 *  les trucs moches que t'as là »*. Sa dictée du même soir : *« six collecteurs
 *  carrés pouvant accueillir les dés, même taille que la face supérieure des dés
 *  du podium »*. Le carré fait `--touch` (44) : la face d'un dé du podium en
 *  fait ~42, et 44 est le plancher tactile — une cible se vise au pouce.
 *  🧊 Le dessin SVG à trois cercles (banc `ilots-lab`, validé le 16/08) part :
 *  la demande plus récente l'emporte. Le nom de classe reste — c'est lui que
 *  `[data-vise]` allume et que les gardes comptent. */
function renderCibleVide() {
  /* Deux lignes FIGÉES, « drop » sur « here » : à 28 de large, la phrase se
     repliait au gré de la cascade — sur une ligne au repos, sur deux au moment
     du dépôt (Eric, 05/09 : *« un désalignement au moment du posage »*). Le
     signe ne se replie plus : il est écrit tel qu'il se lit. */
  /* Le mot dans son propre nœud : la dépression est dessinée par `::before`
     (shell.css) et le mot doit passer PAR-DESSUS — un nœud positionné après. */
  return el("span", "glisse-cible-vide", [el("span", "glisse-cible-mot", [text("drop"), el("br"), text("here")])]);
}

/** 🌱 LE TOKEN DU TRAIT — un octogone de §2 bis, posé sous les six caracs.
 *
 *  🔴 IL N'A AUCUNE DESTINATION, et c'est ce qui le distingue de tous les autres
 *  jetons du site : rien à glisser, rien à poser, aucun créneau qui l'attende. Il
 *  ne DEMANDE pas un choix, il CONSTATE un acquis — d'où le liseré **vert** de
 *  §2 ter (*« il a un liseré vert car il est valide »*, Eric 06/09), la teinte qui
 *  dit ailleurs *« l'ensemble est bon »*. Ici l'ensemble est bon d'emblée.
 *
 *  🔦 IL INFORME, SUR N'IMPORTE QUEL GESTE. Eric a dicté *« clic droit pour
 *  info »* — la moitié souris de la loi du 16/08 (*« tap pour info, clic droit
 *  info, gauche select »*). ⭐ Mais le clic GAUCHE, lui, n'a rien à sélectionner :
 *  la moitié qui poserait un choix n'existe pas sur ce token. Lui laisser un clic
 *  MORT serait pire que la divergence — un contrôle qui ne répond pas passe pour
 *  cassé. Les trois gestes ouvrent donc la même fenêtre, et c'est la seule lecture
 *  qui ne fabrique ni geste mort ni faux choix.
 *  ⛔ Pas de `armerJeton` : ce qu'on n'arme pas ne peut pas être glissé par
 *  accident, et le fantôme n'a rien à lever. */
function renderTraitTardif(act) {
  const rangee = el("div", "ability-trait");
  const jeton = el("button", "glisse-jeton ability-trait-jeton", [text(TRAIT_TARDIF.nom)]);
  jeton.type = "button";
  jeton.dataset.trait = "late-bloomer";
  /* Il se nomme entièrement à qui ne le voit pas : le titre du jeton ne dit que
     le nom, l'`aria-label` dit aussi ce qu'il EST. */
  jeton.setAttribute("aria-label", `${TRAIT_TARDIF.nom} — a trait you gained; open it for what it does`);
  const ouvrir = (ev) => {
    if (ev && typeof ev.preventDefault === "function") ev.preventDefault();
    act({ kind: "popup", titre: TRAIT_TARDIF.nom, texte: TRAIT_TARDIF.texte });
  };
  jeton.addEventListener("click", ouvrir);
  /* Le clic droit — l'autre moitié de la même décision (16/08). `preventDefault`
     parce qu'un menu contextuel du navigateur n'est pas une réponse à
     « qu'est-ce que ce trait ? ». */
  jeton.addEventListener("contextmenu", ouvrir);
  rangee.append(jeton);
  return rangee;
}

function renderCollecteur(ctx) {
  const { document: doc, resolved } = ctx;
  /* 📐 35 % (Eric, 05/09 : « toutes les dalles 35 % ») — 50 % avant. */
  const bloc = el("section", "choix-glisse ability-glisse ability-collecteur dalle-simple");
  /* Le pied de la coquille vient s'accrocher ici, sous la consigne (voir la
     note de section). Une DÉCLARATION, pas une fabrication. */
  bloc.dataset.sortieIci = "true";
  /* ⌨️ Eric, 05/09 : *« glissez les scores dans chacune des caractéristiques de votre
     personnage »* — et l'aiguilleur dit la FINALITÉ du geste, pas le geste. */
  bloc.append(el("h3", "ability-dalle-titre", [text("Drag a score onto each of your character's abilities")]));
  /* 🌱 ET C'EST LUI QUI CITE LE TRAIT, DEPUIS LE 06/09 AU SOIR. Il le disait avant
     dans l'aiguilleur de l'organe ; l'organe n'en a plus en scène 2, et « l'unique
     aiguilleur dit juste qu'il existe » (Eric) — l'unique, en scène 2, c'est
     celui-ci. Le token juste dessous porte le nom, l'info porte la règle. */
  /* 📏 SAUF EN FREE — sa palette de seize prend 200 blg là où les autres viviers en
     prennent 62, et les 52 de cet aiguilleur (écart compris) sont la seconde moitié
     de ce qu'il faut rendre pour que `Done` reste à l'écran (le calcul est dans
     `renderAbilitiesStep`). ⭐ Le TITRE juste au-dessus dit déjà le geste ; cette
     phrase-ci en explique la conséquence, et c'est elle qu'on peut lire ailleurs —
     les trois autres méthodes la gardent, et le `?` la porte pour tout le monde. */
  if (!ctx.composable) {
    bloc.append(el("p", "guide-mot ability-collecteur-mot", [
      text("The score you drop becomes that ability. Its bonus is what you add to every roll the ability governs."),
      ...(lotRattrape(ctx.rollBatch) ? [text(" "), el("strong", "ability-bloomer", [text("You gained a trait.")])] : [])
    ]));
  }

  const rangee = el("div", "glisse-creneaux ability-creneaux");
  for (const key of ABILITY_KEYS) {
    const creneau = el("div", "glisse-creneau ability-creneau");
    creneau.dataset.creneau = key;
    const pose = ctx.posePour(key);
    const valeur = currentAbilityValue(doc, key);
    creneau.dataset.rempli = String(pose !== null);
    /* `data-source` — une valeur qui ne vient PAS de cette session se dit. La
       case est trop petite pour une phrase : la feuille le montre, et
       l'`aria-label` le dit à qui n'a pas les yeux dessus. */
    creneau.dataset.source = pose !== null ? "lot" : (valeur !== undefined ? "hors-lot" : "vide");
    creneau.append(el("span", "glisse-creneau-nom", [text(abilityLabel(key))]));

    /* ⌨️ LE CARRÉ NE PORTE QUE LE DÉ, OU LA CIBLE — Eric, 2026-08-16 : *« tu
       dessines un carré avec une cible de la taille du dé, RIEN ÉCRIT
       DEDANS »*.
       ⚠️ CE QUE ÇA RETIRE, ET IL FAUT LE DIRE : la valeur qu'une carac portait
       DÉJÀ au document (le personnage d'exemple en a six) ne s'affiche plus
       tant qu'aucun dé n'est posé. Un joueur qui revient sur l'étape voit donc
       six cibles vides alors que ses scores existent. C'est le dessin d'Eric,
       et il se défend : cet écran sert à POSER des dés, et une cible qui
       montre déjà un nombre n'invite pas à en poser un. La valeur reste dite à
       qui ne la voit pas, par l'`aria-label`. */
    if (pose !== null) {
      /* LE DÉ POSÉ EST LE MÊME OBJET QU'AU VIVIER — il se reprend, et le
         lâcher sur une autre cible ÉCHANGE les deux (lot 51). C'est le geste
         normal quand on réarrange six scores. */
      creneau.append(renderJetonDe(pose, FS.resolution, {
        chezSoi: false,
        onTap: () => ctx.reprendre(key),
        onDepot: (ou) => ctx.deplacer(key, pose, ou),
        /* 🗑️ EN FREE SEULEMENT : le vide ÉVACUE la case (Eric, 06/09). Les trois
           autres méthodes ont un podium — leur dé y retourne, et « le vide » n'y
           est pas un lieu. ⛔ B1 est figé (§7.3) : on ne lui ajoute pas un geste. */
        onHorsCible: ctx.composable ? () => ctx.reprendre(key) : undefined
      }));
    } else {
      /* ⭐ UNE CIBLE VIDE MONTRE UNE CIBLE — trois cercles concentriques,
         DESSINÉS et non un glyphe : un glyphe change de dessin selon la police
         installée. C'est la forme du banc `ilots-lab`, qu'Eric a validée à
         l'écran, et elle dit ce qu'un tiret ne disait pas : ici, on DÉPOSE. */
      creneau.append(renderCibleVide());
    }

    creneau.setAttribute("aria-label", pose !== null
      ? `${abilityLabel(key)} — ${pose.total} placed`
      : valeur !== undefined ? `${abilityLabel(key)} — ${valeur}, not placed this time` : `${abilityLabel(key)} — empty`);

    /* ⭐ LE BONUS APPARAÎT SOUS LE CARRÉ, ET SEULEMENT QUAND UN DÉ EST POSÉ —
       Eric : *« quand un dé se pose sur la cible, en dessous, à l'extérieur de
       ce carré, apparaît le bonus de carac »*. Une cible vide n'a pas de bonus
       à montrer : le nombre qui le produirait n'a pas encore été choisi.
       📌 Il vient de `resolved.abilities[clef].mod`, lu à l'octet et jamais
       recalculé — donc il suit la règle du moteur (12-13 → +1, 14-15 → +2…) et
       se met à jour à chaque `rebuild`, c'est-à-dire à chaque dé posé. */
    const final = pose !== null ? renderFinalColumn(resolved, key, valeur, { compact: true }) : null;
    if (final) creneau.append(final);
    /* 📏 LA LIGNE DU BONUS EST RÉSERVÉE MÊME VIDE — Eric, 05/09 : *« il ne doit pas
       bouger une fois le dé posé »*. Mesuré : la rangée entière montait de 7,7
       quand le PREMIER bonus apparaissait (la dalle recentrait des colonnes plus
       hautes). Une ligne blanche de la même hauteur tient la place ; elle ne porte
       aucune valeur (`.ability-row-final-value`), donc rien à lire. */
    else creneau.append(el("span", "ability-row-final ability-row-final-attente", [
      el("span", "ability-row-final-attente-valeur", [text("\u00a0")]),
      el("span", "ability-row-final-mot", [text("\u00a0")])
    ]));
    rangee.append(creneau);
  }
  bloc.append(rangee);
  /* 🌱 LATE BLOOMER — LE TOKEN SOUS LES SIX CARACS (Eric, 06/09 au soir, en
     renversant la ligne d'or du matin). Le drapeau est celui du moteur des jets
     (`ajuste: "haut"`) ; l'écran le lit. */
  if (lotRattrape(ctx.rollBatch)) bloc.append(renderTraitTardif(ctx.act));
  /* 🧊 LA CONSIGNE EST PARTIE LE 2026-09-05 : la dalle de sélection d'Eric est
     *« six collecteurs · 16 · la cellule livre/Back/Done/? · 8 »* — rien entre
     les cibles et la rangée. Ce qu'elle disait (*« drag a die onto an ability,
     dropping one that is already placed swaps the two »*) vit dans le tutoriel
     du `?`, qui a le droit de respirer (§6 pré bis). Et ses ~30 blg sont ce qui
     fait tenir la scène 2 dans les 492 de l'iPhone SE. */
  return bloc;
}

/* ══ LE SÉLECTEUR DE MÉTHODE — R Abilities, dalle 35 % ═══════════════════
   📐 REFAIT LE 2026-09-04 SUR LA DICTÉE D'ERIC : *« 2 rangées de bouton : 1ère
   rangée nickel ; 2ème rangée contient un élément centré avec livre et ? là où
   il faut »*, *« désormais tout est dans une boîte, toutes les boîtes sont sur
   une grille y compris les boutons »*, *« on définit les espaces en général
   8 blg »*.

   ⛔ CE QUE ÇA REMPLACE, ET CE N'ÉTAIT JUSTE QUE PAR HASARD. La rangée unique
   était un `flex-wrap` : trois boutons tenaient sur la première ligne, `FREE`
   tombait seul sur la seconde, et le livre comme le `?` étaient posés en
   `absolute` aux deux coins BAS de la dalle (`fiche.css`, `shell.css`). Ils
   arrivaient au niveau de `FREE` parce que la dalle mesurait 165 blg — pas
   parce qu'une rangée les y mettait. 📏 Mesuré avant : livre à y=177, `?` à
   y=177, `FREE` à y=177. **Trois organes alignés par coïncidence de cotes**,
   exactement ce que NORMES §6 pré nomme : *« il PARAISSAIT aligné avec eux ; il
   ne l'était que par coïncidence »*. Une dalle plus haute d'un blg les
   séparait, et rien n'aurait crié.

   ⭐ LA SECONDE RANGÉE EST DONC UNE VRAIE RANGÉE DE CONTRÔLES — la forme unique
   de §6 pré, `--touch | 1fr | --touch`, deux bornes et un groupe. Elle ne
   fabrique rien : elle DÉCLARE `data-rangee`, et la coquille lui descend le `?`
   et cadre son groupe comme elle le fait déjà pour les quatre autres rangées du
   site. */

/* 🔴 COMBIEN DE MÉTHODES PAR RANGÉE — DÉDUIT, JAMAIS CHOISI (§1 ter).
   📏 LA DALLE OFFRE 351 BLG (367 de carte − 2 × 8 de rembourrage), un bouton du
   gabarit `small` en vaut 87 (`--glisse-case`, la cote du jeton) et l'écart
   général vaut 8 depuis le 04/09 :

       3 × 87 + 2 × 8 = 277   ✅  il reste 74
       4 × 87 + 3 × 8 = 372   ⛔  21 de trop

   ➡️ **C'est la LARGEUR qui pose le trois**, et c'est la même arithmétique de
   360 qui a fabriqué la cote du jeton (`tokens.css`) — pas un goût, pas un
   `:nth-child` qui compte (§1 ter ter : *« une exception se nomme, elle ne se
   compte pas »*).
   ⭐ ET LE RESTE TOMBE DANS LA RANGÉE DE CONTRÔLES, quel qu'il soit : §6 pré
   dit que le groupe se centre sans savoir combien il porte. Une cinquième
   méthode n'aurait donc aucune règle à rouvrir. */
const METHODES_PAR_RANGEE = 3;

function renderSelecteurMethode(actif, act) {
  const bloc = el("section", "ability-methodes dalle-simple");
  bloc.append(el("h3", "ability-methodes-titre", [text("Choose an ability generation method")]));
  /* 🔴 L'AIGUILLEUR — Eric, 2026-09-04 : *« le texte en dessous, ça devrait
     être en bleu : l'aiguilleur. Pas en noir. L'aiguilleur a toujours besoin
     d'une boîte texte de 3 de hauteur. »*
     ⭐ ET C'EST `.guide-mot`, L'ORGANE QUI EXISTE — pas un sosie. L'aiguilleur
     est l'une des trois voix de §7, bleu par ratification du 26/08, et ses trois
     lignes ont été dictées le 27/08 (*« tu pourras même donner 3 lignes à
     l'aiguilleur »*). La phrase d'aujourd'hui est cette cote redite ; il n'y
     avait rien à inventer, seulement à reconnaître.
     ⛔ `.aiguilleur` EST UN AUTRE OBJET — le recouvrement plein écran
     d'Équipement. Mesuré : le `<p>` qui portait ce nom rendait 375 × 500 blg.
     Même arbitrage que `destiny-step.mjs` : *« C'EST `.guide-mot`, L'ORGANE DU
     RANG B, PAS UN SOSIE »*.
     ⚠️ « BELOW », PAS « ABOVE » — et ce mot a dû changer AVEC la place le
     26/08 : la phrase ne parle pas d'elle-même, elle POINTE. Les deux rangées
     restent sous elle, le mot reste juste. */
  bloc.append(el("p", "guide-mot", [text(
    "Pick one of the methods below to begin. The book explains the key differences."
  )]));

  const tuileDe = (entry) => {
    const tuile = el("button", "ability-entry");
    tuile.type = "button";
    tuile.dataset.entry = entry.id;
    markPressed(tuile, entry.id === actif);
    tuile.append(el("span", "ability-entry-label", [text(entry.label)]));
    tuile.addEventListener("click", () => act({ kind: "abilityMethod", value: entry.id }));
    return tuile;
  };

  /* ── LA PREMIÈRE RANGÉE — une grille, pas un `flex-wrap` ─────────────────
     ⭐ LE COMPTE DE COLONNES N'EST ÉCRIT QU'ICI, ET LA FEUILLE NE LE SAIT PAS :
     elle emploie `grid-auto-flow: column`, qui crée exactement autant de
     colonnes qu'on lui donne d'enfants. Un `repeat(3, …)` en CSS face à un
     `slice(0, 3)` en JS aurait été un nombre écrit deux fois, c'est-à-dire deux
     nombres qui divergent au premier réglage.
     ⛔ ET LES BOUTONS NE S'ÉTIRENT PAS : les colonnes valent `--glisse-case`,
     pas `1fr`. *« Une case qui s'étire ne laisse RIEN à centrer »* — c'est la
     grille qui se centre dans sa boîte, jamais les cases qui comblent. */
  const rang = el("div", "ability-methodes-rang");
  for (const entry of ABILITY_ENTRIES.slice(0, METHODES_PAR_RANGEE)) rang.append(tuileDe(entry));
  bloc.append(rang);

  /* ── LA SECONDE RANGÉE — la forme unique de §6 pré ───────────────────────
     🔴 `INFO` EST DEVENU LE LIVRE — Eric, 2026-08-26 : *« info doit devenir un
     livre et disparaître »*. Les deux moitiés comptent : il prend la forme du
     livre, ET le mot « INFO » quitte l'écran. Porter `ability-entry` lui
     donnait l'octogone des quatre méthodes, si bien qu'un cinquième bouton
     identique proposait quelque chose qui n'est pas un choix.
     ⚠️ IL GARDE SON ÉTAT : c'est un interrupteur (le panneau est ouvert ou
     non), donc `aria-pressed` reste — un livre qui bascule doit le dire.

     ⭐ ET IL EST UNE BORNE, PAS UN VOISIN. `data-rangee` suffit à le dire :
     la coquille reconnaît `.fiche-livre` et `.tuto-point` comme les deux
     bornes (`BORNES`, shell.mjs), pousse tout le reste dans un `.rangee-majeurs`
     et laisse la grille les cadrer. ⛔ Aucune colonne n'est nommée ici — c'est
     la faute que §6 pré a payée trois fois. */
  const controles = el("div", null, []);
  controles.dataset.rangee = "controles";
  /* 📖 LE LIVRE SORT DU BUILDER — Eric, 2026-09-05 : *« le livre doit emmener
     vers le site FH WEB »* · *« en tout cas ton livre doit pointer là »*.

     ⛔ CE QU'IL FAISAIT : il basculait un panneau interne qui comparait les
     trois méthodes. Le panneau n'était pas faux — il était au mauvais ENDROIT.
     Un texte de règle écrit dans l'interface est une règle publiée PAR
     l'interface : sans source, sans version, sans empreinte (§0.8).
     ⭐ Le livre ne RACONTE pas la règle, il y MÈNE (sacré n° 2). Son
     argumentaire part au chapitre `ability-scores` de FH WEB, où il a une
     adresse citable.

     ⚠️ IL N'EST PLUS UN INTERRUPTEUR, donc plus d'`aria-pressed` : un organe qui
     ouvre un onglet n'a pas d'état à dire. Le mettre quand même apprendrait au
     lecteur d'écran une bascule qui n'existe pas.
     📌 `noopener` n'est pas décoratif : sans lui la page ouverte reçoit
     `window.opener` sur le builder et peut le renaviguer (même note qu'à
     `destiny-step.mjs`, dont ceci est le patron). */
  const info = el("button", "fiche-livre ability-methodes-livre");
  info.type = "button";
  info.dataset.entry = "info";
  info.setAttribute("aria-label", "Ability scores — read the rules on FH Web");
  info.addEventListener("click", () => {
    window.open(lienAbilityScoresFhWeb(), "_blank", "noopener");
  });
  controles.append(info);
  for (const entry of ABILITY_ENTRIES.slice(METHODES_PAR_RANGEE)) controles.append(tuileDe(entry));
  bloc.append(controles);
  return bloc;
}

/* ══ LE PANNEAU INFO A DÉMÉNAGÉ — 2026-09-05 ════════════════════════════
   ⛔ IL N'Y A PLUS DE PANNEAU ICI, et ce n'est pas un oubli. Eric : *« ce qui
   est écrit actuellement dans le livre ne trouve pas son équivalent dans
   Ability scores ; il faut écrire ce texte là et effacer l'obsolète. En tout
   cas ton livre doit pointer là. »*

   ⭐ CE QUI EST PARTI, ET OÙ : l'argumentaire des trois façons de trouver ses
   six — le tableau mesuré sur 3 000 000 de tirages, la chute, la commission de
   la maison — s'en va au chapitre `ability-scores` de FH WEB. Il n'était pas
   faux, il était au mauvais ENDROIT : un texte de règle écrit dans l'interface
   est une règle publiée PAR l'interface, sans source, sans version, sans
   empreinte (§0.8). Le livre ne raconte plus, il MÈNE (sacré n° 2).

   📌 LES CHIFFRES SONT SAUVÉS, PAS PERDUS : ils sont transmis mot pour mot à
   l'écrivain de FH WEB, avec leur provenance (simulation du 2026-08-16,
   revérifiée contre `dice.mjs` : moyenne 71,79 · un 18 dans 4,5 % · un 16+
   dans 38 % · un 15+ dans 62 %). ⛔ Le moyen de les revérifier reste de rejouer
   la simulation, jamais de relire la page.

   ⚠️ ET LE TROU EST CONNU : tant que le chapitre ne porte pas ce texte, le
   joueur qui clique le livre arrive sur une page qui ne compare pas les
   méthodes. C'est le prix de la séquence, il est nommé, et il se referme quand
   l'écrivain publie. */

/* ══ LES DEUX LOTS QUI NE SE TIRENT PAS ══════════════════════════════════ */

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

/** `ARRAY` — le temps 1 (tirer) disparaît ; le temps 2 (affecter) demeure, et
 *  il passe par la MÊME machinerie que les dés, `assign` compris.
 *  ⏳ Le jour où ces six valeurs entrent dans une couche, elles se lisent là
 *  et cette liste disparaît. */
export function standardArrayBatch() {
  return {
    rolls: STANDARD_ARRAY.map((total, index) => ({ dice: [], total, index, kept: true })),
    rerollCount: 0,
    method: "standard",
    assign: emptyAbilityAssign()
  };
}

/** `FREE` — 🔴 LA SEULE MÉTHODE QUI CHANGE LA NATURE DU VIVIER (§4.4).
 *
 *  Seize dés statiques, de 3 à 18, et **le vivier ne s'épuise jamais** :
 *  prendre un 14 n'enlève pas le 14 de la grille. Ce n'est pas un stock,
 *  c'est une PALETTE — elle n'a aucun état.
 *
 *  ⭐ LES SEIZE VALEURS SONT `CREATION_SCORES`, PUBLIÉES PAR LE MOTEUR (lot
 *  74) — jamais un `for (let i = 3; i <= 18; …)` écrit ici. Le croquis dit
 *  « seize dés, de 3 à 18 » ; c'est exactement la borne de création, et la
 *  faire coïncider par recopie aurait été la laisser diverger.
 *
 *  ⚠️ CE QUE FREE NE PEUT PAS UTILISER, ET IL FALLAIT LE DIRE AVANT
 *  D'ÉCRIRE : la carte `assign` du lot 50 associe une clef à l'**INDEX** d'un
 *  jet. En FREE il n'y a pas de jet, et deux caractéristiques peuvent porter
 *  la même valeur — l'index d'un dé de palette ne désigne donc pas « le dé que
 *  cette carac tient », il désigne une VALEUR de la grille. C'est licite ici,
 *  et seulement ici, parce que la palette est un catalogue de valeurs et non
 *  un lot de dés distincts.
 *  ⭐ ET LA SORTIE EXISTE DÉJÀ, SANS TOUCHER AU MOTEUR : FREE pose
 *  `{ kind: "set", path: "abilities.<clef>", value }` — le verbe de la saisie
 *  manuelle, avec la peau du glisser-déposer. Aucun champ nouveau, aucune
 *  règle nouvelle : un autre geste pour le même verbe. */
export function freeBatch() {
  return {
    rolls: Array.from({ length: ABILITY_KEYS.length }, (_, index) => ({ dice: [], total: null, index, kept: true })),
    rerollCount: 0,
    method: "free",
    palette: true,
    assign: emptyAbilityAssign()
  };
}

/** LA PALETTE — seize dés STATIQUES, de 3 à 18, dans la dalle FF1 de `FREE`.
 *
 *  🔴 ELLE EST À `FREE` CE QUE LE PLATEAU EST À `FH 3D6` : un ORGANE qui
 *  produit les six valeurs, pas un vivier. C'est la décision d'Eric du
 *  2026-08-16, prise sur son croquis — la rangée de six carrés entre la dalle
 *  et le collecteur porte **tes six valeurs choisies**, et la palette les y
 *  dépose. ⭐ FREE devient alors identique aux trois autres méthodes : un
 *  organe remplit le vivier, le vivier nourrit le collecteur. Ce qui diffère
 *  n'est plus que la façon de remplir — §1 du mandat, tenu jusqu'au bout.
 *
 *  ⛔ ELLE N'A AUCUN ÉTAT, et c'est le point (§4.4, règle 3) : prendre un 14
 *  n'enlève pas le 14. On peut poser 12 trois fois. Elle ne se vide jamais,
 *  donc elle n'a rien à mémoriser — ses seize valeurs sont `CREATION_SCORES`,
 *  publiées par le moteur (lot 74), jamais une plage réécrite ici.
 *
 *  📌 LE TAP y met la valeur dans le PREMIER créneau libre ; le glisser la met
 *  où on le lâche. Même partage que partout : le glisser désigne sa case, le
 *  tap laisse l'écran choisir. */
function renderPalette(ctx, act) {
  const rangee = el("ul", "ability-palette fs-rangee");
  rangee.dataset.pool = "inepuisable";
  for (const [index, valeur] of CREATION_SCORES.entries()) {
    const item = el("li", "fs");
    const jeton = renderJetonDe({ dice: [], total: valeur, index }, FS.resolution, {
      chezSoi: true,
      onTap: () => ctx.poserAuPremierLibreDepuisPalette(valeur),
      onDepot: (ou) => ctx.poserDepuisPalette(ou, valeur)
    });
    jeton.setAttribute("aria-label", `${valeur} — take it`);
    item.append(jeton);
    rangee.append(item);
  }
  return rangee;
}


/** Le lot que porte une méthode qui n'a pas de dés à jeter, ou `null`. */
export function lotSansDes(methodId) {
  if (methodId === "standard") return standardArrayBatch();
  if (methodId === "free") return freeBatch();
  return null;
}

/* ══ L'ÉCRAN ════════════════════════════════════════════════════════════ */

/**
 * @param {object} ctx
 * @param {object} ctx.document   le document brut — les valeurs déjà posées
 * @param {object} ctx.resolved   la fiche dérivée — score final, mod, plafond
 * @param {string} [ctx.method]   la méthode choisie — `null` au repos (B5.1c)
 * @param {object} [ctx.rollBatch] le lot en cours, ou `null` ; `assign` (lot 50) est la carte
 *   `clef → index`, HORS document — voir l'en-tête de ce fichier
 * @param {number} [ctx.revele]   combien de jets sont découverts
 * @param {(action: object) => void} onAction
 */
export function renderAbilitiesStep(ctx, onAction) {
  const doc = ctx.document || null;
  const resolved = ctx.resolved || null;
  const rollBatch = ctx.rollBatch || null;
  const act = onAction || ctx.onAction || (() => {});
  const entry = ABILITY_ENTRIES.find((e) => e.id === ctx.method) || null;
  const section = el("section", "abilities-step");

  /* ══ 🔴 DEUX PAGES, PAS UNE PAGE QUI S'ALLONGE ══════════════════════════
     TRANCHÉ PAR ERIC, 2026-08-16, en regardant le sélecteur : *« ceci doit
     être détaché et être à la racine de Abilities. On arrive sur FREE quand
     on clique sur le bouton FREE, qui est une AUTRE PAGE »*.

     · **la racine** (palier 1) ne porte que le sélecteur — et le panneau INFO
       quand il est ouvert ;
     · **la page d'une méthode** (palier 2) porte son organe, son vivier et son
       collecteur, et PLUS le sélecteur.

     ⭐ ET CE N'EST PAS UNE MACHINE À ÉTATS ÉCRITE ICI : ce sont les PALIERS,
     que la coquille possède déjà (I.4, et l'arbitrage du lot 79 §4.1 —
     *« c'est shell.mjs qui possède l'enchaînement ; une machine à états dans
     un écran ferait DEUX propriétaires de la même porte »*, la faute que
     `rollBatch` a payée). Cet écran ne fait que LIRE `ctx.palier` ; c'est le
     shell qui l'avance en recevant `abilityMethod`, et `BACK` qui le recule —
     le même `BACK` que partout, qui redescend d'un palier avant de reculer
     d'une étape. Rien à inventer, rien à câbler en double.
     📌 Conséquence gratuite : revenir sur l'étape repart de la racine
     (`goToStep` remet le palier à 1), donc on retrouve toujours le choix des
     méthodes, jamais une page dont on ne sait plus comment on est arrivé. */
  const surLaRacine = ctx.palier !== 2;

  if (surLaRacine) {
    /* 🏁 R2 — LE BILAN REMPLACE LE CHOIX (Eric, 06/09 : *« on remonte en R avec les
       résultats, R1 l'ancien choix disparaît, devient R2 un bilan »*). La coquille
       dit lequel des deux (`ctx.bilan`) ; l'écran ne le déduit pas d'un lot. */
    if (ctx.bilan) { section.append(renderBilan({ document: doc, resolved, rollBatch, act })); return section; }
    section.append(renderSelecteurMethode(ctx.method || null, act));
    return section;
  }

  /* Un palier 2 sans méthode ne peut pas exister (c'est le choix qui l'ouvre),
     mais un état d'écran se lit, il ne se suppose pas. */
  if (!entry) return section;

  /* 🔴 LA PAGE D'UNE MÉTHODE DÉCLARE QU'ELLE EST À TROIS BANDES — et c'est une
     DÉCLARATION, jamais une inférence (le même partage que `data-sortie-ici` et
     `data-scroller`). La racine, elle, ne la porte pas : 125 px mesurés dans une
     fenêtre de 493, aucune zone de scroll, donc rien à encadrer — la portée que
     le croquis se donne lui-même.
     ⚠️ ET C'EST UN ATTRIBUT PARCE QUE LE CSS NE SAIT PAS LE DEMANDER : la forme
     naturelle, `.stage:has(> .decision-card > .abilities-step:has(> .ability-collecteur))`,
     est INVALIDE — `:has()` ne s'imbrique pas dans `:has()`. Mesuré dans la page
     avant de le comprendre : la règle passait pour écrite et la carte gardait
     677 px de contenu pour 493 de fenêtre. Une déclaration invalide crie ; une
     déclaration que le navigateur jette en silence, non. */
  section.dataset.bandes = "true";

  /* ── L'ORGANE : l'explication, et le jet quand il y en a un ────────── */
  /* 📐 35 %, PLUS 50 — Eric, 2026-09-05 : *« toutes les dalles 35 % / grid »*. */
  const organe = el("section", "ability-organe dalle-simple");
  organe.dataset.methode = entry.id;
  /* ⭐ LA PAGE DIT DE QUELLE MÉTHODE ELLE EST. Sans le sélecteur au-dessus,
     c'est la seule chose qui replace le joueur après un `BACK` mal visé — et
     le libellé est celui du croquis, jamais un id.
     🔴 DANS LA DALLE, PAS AU-DESSUS (Eric, 2026-08-17 : *« Free doit être en
     titre de la première dalle et à l'intérieur, pas en dehors et au-dessus »*).
     Il flottait sur le fond, entre la ceinture et la dalle — un titre posé
     dans le vide n'appartient à rien de ce qu'il titre. Il porte désormais la
     MÊME classe que le titre du collecteur : deux dalles de la même page qui
     se titrent de deux façons se mettraient à diverger au premier réglage. */
  organe.append(el("h2", "ability-dalle-titre ability-methode-titre", [text(entry.label)]));
  /* ══ LES TROIS BANDES — croquis d'Eric du 2026-08-26 ═══════════════════
     `fh-phb/croquis/2026-08-26-gabarit-ecran-trois-bandes.jpg` : un TITRE
     fixe · une ZONE DE SCROLL dont **le cadre ne bouge pas** et dont **le bord
     est invisible** · une bande basse fixe.

     📏 CE QUE ÇA RÉPARE, MESURÉ LE 26/08 (Chrome, 360 × 553) : la page d'une
     méthode débordait `.stage` de **200 px** en `FREE`, **66** en `FH 3D6`,
     **47** en `4D6` — et c'était la SCÈNE ENTIÈRE qui défilait, le pied
     compris. Relevé en `FREE` : le pied de la coquille tombait à y=677 pour
     une fenêtre qui s'arrête à 553 — il fallait faire défiler le collecteur
     pour atteindre `Done`, c'est-à-dire perdre de vue les six cibles sur
     lesquelles on venait de poser ses dés. `ARRAY`, lui, tenait déjà (0 de
     débordement) : le gabarit est un DÉFAUT, il ne lui impose rien.

     🔴 LE TITRE RESTE DANS SA DALLE, et ce n'est pas un compromis : c'est
     l'ordre d'Eric du 17/08 (*« Free doit être en titre de la première dalle
     et à l'intérieur »*) ET la forme de la recette qui marche — sur Species et
     Class, `.guide-titre` vit lui aussi DANS `.parcours-guide`. La bande titre
     du croquis est le haut de la dalle, jamais une barre posée par-dessus.

     ⭐ CE QUI CÈDE ICI, C'EST L'EXPLICATION ET LE VIVIER DE VALEURS — de la
     prose et un tableau, exactement ce que NORMES §5 bis autorise à défiler.
     ⛔ CE QUI NE CÈDE PAS : le collecteur. Ses six créneaux sont la CIBLE d'un
     glisser ; une cible qu'il faut aller chercher n'est plus une cible. */
  const flux = el("div", "ability-flux");
  organe.append(flux);
  /* 🔵 CE TEXTE EST L'AIGUILLEUR — Eric, 2026-09-05, en le désignant sur
     l'écran : *« Ten rolls of 3d6 … = aiguilleur »*.
     ⭐ IL N'Y AVAIT RIEN À INVENTER, SEULEMENT À RECONNAÎTRE : la classe locale
     `.ability-organe-mot` décrivait un paragraphe ; l'organe, lui, s'appelle
     `.guide-mot` et il existe depuis le 26/08 (§6 pré bis). Un texte qui dit
     comment se sert l'écran est un aiguilleur, où qu'il se trouve — c'est
     exactement la faute que R Abilities a payée la veille avec `.aiguilleur`,
     prise par l'autre bout : là un nom était pris, ici un organe était ignoré. */
  /* 📌 IL EST POSÉ PLUS BAS, une fois la scène connue : depuis le 06/09 il DIT LES
     BOUTONS, et les boutons ne sont là qu'en scène 1. */

  /* ══ 🎬 DEUX SCÈNES — Eric, 2026-09-05 ═══════════════════════════════════
     *« Scène 1 : ça s'arrête à la dalle 3 + boutons livre · Cancel · ?. Scène 2 :
     disparition de la dalle 3d6 de tirage une fois tous les jets effectués, et
     apparition de la dalle podium et de la dalle sélection ; les boutons
     transitent vers la dalle sélection — livre · Cancel · Done · ? »*.

     ⭐ LA BASCULE EXISTAIT DÉJÀ, ELLE N'AVAIT PAS DE NOM : `abilityLot` est *la
     seule exception* qui redessine (shell.mjs), posée le jour où l'écran était
     une impasse sans elle. Un lot rangé dans `state` est toujours COMPLET
     (en-tête du plateau) — donc « il y a un lot » EST « les dix sont tombés ».
     La scène se lit sur ce fait, jamais sur un compteur.
     ⛔ Et rien ne redessine EN COURS de salve : la scène 1 est écrite à la main
     par le plateau, jet après jet, dans des nœuds qui existent déjà. */
  /* ⭐ `composable` REMONTE ICI (il vivait avec le contexte du glisser) : depuis le
     06/09 il ne dit plus seulement *« FREE compose son vivier »*, il décide aussi si
     l'organe porte un aiguilleur. Une donnée lue plus haut qu'avant, pas une donnée
     nouvelle — et surtout pas un `if` sur un id (§ « une exception se nomme »). */
  const composable = Boolean(rollBatch && rollBatch.palette);
  const meca = entry.mecanique ? mecaniqueDeJet(entry.mecanique) : null;
  const lot = rollBatch && rollBatch.method === entry.mecanique ? rollBatch : null;
  /* La scène se lit sur « un lot existe » — pas sur la méthode qui l'a produit :
     c'est ce que le vivier et le collecteur faisaient déjà avant les scènes. Le
     plateau, lui, ne repeint que le lot de SA mécanique. */
  const scene2 = Boolean(meca && rollBatch && Array.isArray(rollBatch.rolls) && rollBatch.rolls.length > 0);
  /* 🔵 L'AIGUILLEUR, MAINTENANT QUE LA SCÈNE EST CONNUE. Il dit la règle de la
     méthode (`explicationDe`, la même phrase que sa tuile à la racine) PUIS ce que
     font les trois boutons — mais seulement là où ils sont. ⛔ Un aiguilleur qui
     parlerait d'organes absents est la faute du 05/09, prise par l'autre bout : un
     texte qui NOMME un organe se périme avec lui. */
  /* 🔴 UN ÉCRAN, UN AIGUILLEUR — Eric, 06/09 au soir : *« dans FH 3D6, B1 : le
     premier aiguilleur disparaît quand le 2ᵉ apparaît en scène 2. Il ne reste que
     le titre FH 3D6 »*.
     ⭐ C'EST LA MÊME LOI QUE CELLE QUI VIENT DE TUER LA LIGNE D'OR, prise par
     l'autre bout : là c'était un second aiguilleur AJOUTÉ sous les caracs, ici
     c'est le premier qui reste ALLUMÉ quand celui du collecteur s'ouvre. Deux
     paragraphes de guidage sur un écran, c'est deux fois la même faute.
     📏 ET ÇA RÉPARE UNE MESURE : en scène 2 le gabarit trois bandes écrasait cette
     dalle — son flux ne montrait plus qu'une ligne et demie de l'aiguilleur, donc
     un texte tronqué que personne ne pouvait lire. La dalle ne porte plus que son
     titre, et il n'y a plus rien à tronquer.
     ⚖️ LA PORTÉE EST CELLE DE LA SCÈNE, PAS DE L'ÉCRAN : `scene2` n'existe que sur
     les deux méthodes À DÉS. ARRAY et FREE gardent donc leur aiguilleur — chez eux
     il n'y a pas de bascule, et c'est le seul endroit où la méthode s'explique.
     ⏳ Qu'ils portent EUX AUSSI deux aiguilleurs à la fois est vrai, mesuré, et
     c'est une question pour Eric — pas une déduction à prendre ici. */
  /* 📏 FREE N'EN A PAS, ET C'EST LE BUDGET QUI LE DIT — 06/09, Eric ayant tranché
     *« c'est 4×4 »* pour les seize valeurs. La carte fait 486 blg à 375 × 553 :

         palette 4 × 4, dés à 44 ........... 200
         collecteur COMPLET ................ 279
         organe, titre seul .................  40
         écarts .............................  16   ➜  535, soit 49 de TROP

     Les deux aiguilleurs de la page valent 53 (l'organe) et 52 (le collecteur avec
     son écart) : il faut les deux pour rentrer, et aucun autre poste ne bouge —
     le collecteur est figé (§7), et un dé de contrôle ne descend pas sous 44.
     ⚠️ CE QUI PART N'EST PAS RIEN, ET IL FAUT LE DIRE : cet aiguilleur était le
     SEUL endroit du produit qui écrive *« take any value, as often as you like »*
     et *« drag a die off to discard it »*. ⛔ J'ai failli le retirer en écrivant
     qu'il se lisait aussi sur la tuile du sélecteur — **mesuré : faux**,
     `renderSelecteurMethode` ne rend que les libellés. Il descend donc dans le `?`,
     qui a le droit de respirer (§6 pré bis), pas dans le vide.
     ⭐ ET LE TITRE DU COLLECTEUR RESTE LA CONSIGNE : *« Drag a score onto each of
     your character's abilities »* dit le geste. La page garde une phrase, pas zéro. */
  if (!scene2 && !composable) {
    flux.append(el("p", "guide-mot ability-organe-mot", [
      text(explicationDe(entry) + (meca ? " " + motDesBoutons(meca) : ""))
    ]));
  }
  let plateau = null;
  if (meca) {
    /* ⭐ LE PLATEAU SERT LES DEUX MÉCANIQUES — trois dés et dix jets, ou quatre
       dés et six jets. C'est le tableau qui le dit, jamais un `if` ici. ⛔ Ses
       rappels ne passent PAS par `refresh()` : voir l'en-tête du plateau. */
    plateau = renderTray({
      mecanique: meca, lot, revele: ctx.revele || 0,
      onNouveauLot: (lotNeuf) => act({ kind: "abilityLot", lot: lotNeuf }),
      onRevele: (valeur) => act({ kind: "abilityRevele", valeur }),
      onClear: () => act({ kind: "abilityClear" })
    });
    /* 🎬 LES COMMANDES NE VIVENT QU'EN SCÈNE 1 — Eric, 06/09 : *« Roll Options peut
       disparaître avec les trois boutons et les dés mobiles en scène 2 »*. Le titre,
       les trois boutons et le tapis vert partent ensemble : il n'y a plus rien à
       jeter, et la place va au podium et à la sélection.
       ⚖️ CE QUE ÇA RETIRE, ET QUI LE REPREND : `Reset` ramenait à la scène 1
       (Eric, 05/09) ; en scène 2 c'est `Cancel` qui le fait — il efface le lot
       (verbe `abilityClear` déclaré sur la dalle de sélection). Le geste survit,
       il change de bouton parce que sa dalle a changé. */
    if (!scene2) flux.append(plateau.commandes);
  }

  /* ══ LE CONTEXTE PARTAGÉ DES TROIS ÉTAGES DU BAS ═══════════════════════
     🔴 UNE SEULE DÉFINITION DES GESTES POUR LES QUATRE MÉTHODES, et depuis
     que FREE compose son vivier, un SEUL VERBE aussi : `assignAbilityRoll`.
     Ce qui change entre les méthodes n'est plus que la façon dont le vivier
     se REMPLIT — le plateau pour les deux méthodes à dés, le tableau standard
     d'un coup, la palette pour FREE. ⛔ Écrire deux collecteurs pour ça aurait
     été la faute du §1 du mandat. */
  /* ⭐ `composable` — FREE COMPOSE son vivier au lieu de le recevoir. C'est
     la SEULE chose qui le distingue désormais des trois autres méthodes : ses
     six créneaux sont des CIBLES que la palette remplit. Tout le reste — le
     glisser vers une caractéristique, l'échange, la porte — est identique. */
  const assign = (rollBatch && rollBatch.assign) || {};
  const parIndex = new Map((rollBatch && rollBatch.rolls ? rollBatch.rolls : []).map((r) => [r.index, r]));

  const glisseCtx = {
    document: doc, resolved, rollBatch, assign,
    /* ⭐ `act` EST DANS LE CONTEXTE, PAS UN SECOND PARAMÈTRE : le collecteur
       reçoit déjà tout ce qu'il rend par ce seul objet, et le token du trait est
       le premier de ses enfants qui parle à la coquille (une fenêtre d'info).
       Deux façons de descendre le même acteur en feraient deux à tenir. */
    act,
    /** Le jet posé sur cette clef, ou `null` — lu dans `assign`, la SEULE
     *  carte qui le sache (lot 50, §2a : elle vit hors document et meurt avec
     *  le lot). Jamais une comparaison de valeurs : c'était le défaut du
     *  lot 50, et deux dés à 14 le rejouraient. */
    posePour(key) {
      const index = assign[key];
      if (index === null || index === undefined) return null;
      return parIndex.get(index) || null;
    },
    composable,
    /** QUI TIENT CE DÉ — `null` si personne. */
    tenuPar(roll) {
      for (const [key, tenu] of Object.entries(assign)) if (tenu === roll.index) return key;
      return null;
    },
    /* ⭐ UN SEUL VERBE POUR LES QUATRE MÉTHODES DEPUIS QUE FREE COMPOSE SON
       VIVIER : `assignAbilityRoll`, la forme du lot 50, avec sa clef, son
       index de créneau et sa valeur. FREE n'a plus de verbe à lui.
       ⛔ ET C'EST CE QUI FAIT TOMBER LE PIÈGE DU §4.4 : la carte `assign`
       associe une clef à un INDEX, et l'index d'un créneau du vivier est
       parfaitement défini — même quand deux créneaux portent la même valeur.
       Le problème n'était pas l'index, c'était de faire pointer `assign` vers
       une palette sans état. */
    poser(key, roll) {
      act({ kind: "assignAbilityRoll", key, rollIndex: roll.index, value: roll.total });
    },
    /** LA PALETTE DÉPOSE DIRECTEMENT SUR UNE CARACTÉRISTIQUE — le seul geste
     *  propre à `FREE`, et il n'a pas d'étape intermédiaire (Eric, 2026-08-16).
     *
     *  ⭐ POURQUOI IL LUI FAUT SON VERBE, ET UN SEUL. `assignAbilityRoll`
     *  suppose qu'un dé EXISTE déjà dans le lot et qu'on lui donne une clef ;
     *  ici la valeur naît du geste — elle n'est nulle part avant qu'on la
     *  lâche. Le shell fait donc les deux d'un coup : il inscrit la valeur
     *  dans le créneau de cette clef, ET la pose au document par le `set`
     *  ordinaire. Aucun champ nouveau, aucune règle nouvelle.
     *  ⛔ ET RECOUVRIR REMPLACE, là où les trois autres ÉCHANGENT (§5.3,
     *  divergence voulue) : un échange n'a de sens qu'entre dés en nombre
     *  fini. Ici le vivier est inépuisable, il n'y a rien à rendre. */
    poserDepuisPalette(ou, valeur) {
      if (!ABILITY_KEYS.includes(ou)) return;
      act({ kind: "abilityFreeDirect", key: ou, value: valeur });
    },
    /** LE TAP DE LA PALETTE : la première caractéristique encore servie par
     *  aucun dé de cette session. */
    poserAuPremierLibreDepuisPalette(valeur) {
      const libre = ABILITY_KEYS.find((key) => assign[key] === undefined || assign[key] === null);
      if (libre) act({ kind: "abilityFreeDirect", key: libre, value: valeur });
    },
    /** LE TAP : la première caractéristique encore servie par aucun dé. Le
     *  croquis ne nomme que le glisser ; ce raccourci ne lui retire rien et
     *  évite six glissers au pouce quand l'ordre est indifférent. */
    poserAuPremierLibre(roll) {
      const libre = ABILITY_KEYS.find((key) => assign[key] === undefined || assign[key] === null);
      if (libre) glisseCtx.poser(libre, roll);
    },
    /** LE RETOUR — un dé posé REVIENT au podium, par tap ou par glisser.
     *  Eric, 2026-08-16 : *« je veux pouvoir les remettre dans le conteneur
     *  d'origine — que ça marche dans les 2 sens »* ; et le 05/09 au soir, devant
     *  un écran qui ne le faisait toujours pas : *« le drag and drop doit se
     *  faire en aller-retour »*.
     *  🔴 CE QUI L'INTERDISAIT, ET POURQUOI ÇA NE TIENT PAS : « `rebuild()` jette
     *  si l'une des six valeurs manque au document ». Vrai — et c'est pour ça que
     *  le retour NE TOUCHE PAS LE DOCUMENT : il retire la clef de la carte
     *  `assign` (hors document, elle meurt avec le lot), le document garde sa
     *  dernière valeur, l'écran montre le collecteur vide, et `Done` s'éteint
     *  parce que la porte compte les POSES quand un lot existe
     *  (`abilitiesValidate`). C'est exactement la mécanique que FREE tenait
     *  déjà seul (*« deux vérités qui ne parlent pas de la même chose »*) —
     *  elle vaut pour les quatre méthodes. En FREE, le vivier n'existe pas :
     *  reprendre y vide la case, comme la palette l'aurait recouverte. */
    reprendre(key) {
      act({ kind: "unassignAbilityRoll", key });
    },
    /** LE GLISSER D'UNE CIBLE VERS AILLEURS. Sur une autre cible, il ÉCHANGE
     *  (lot 51) ou, en FREE, il RECOUVRE — l'échange n'a de sens que si les
     *  dés sont en nombre fini ; ici le vivier est inépuisable, il n'y a rien
     *  à rendre (§5.3, divergence voulue n° 1). Sur le vivier, il retire —
     *  en FREE seulement (divergence voulue n° 2). */
    /** UN DÉ PREND UNE PASTILLE DU PODIUM — depuis le podium (échange de places)
     *  ou depuis un collecteur (il revient, ET prend cette place-là). Le shell
     *  échange les deux index dans `podium` et, si `key` est donné, retire la
     *  clef de `assign`. */
    placerAuPodium(roll, ou, key) {
      const slotOf = Number(ou.slice(PODIUM.length));
      if (!Number.isInteger(slotOf)) return;
      act({ kind: "abilityPodium", rollIndex: roll.index, slotOf, key: key || null });
    },
    deplacer(key, roll, ou) {
      if (ou === key) return;
      /* ⭐ LÂCHER SUR LE PODIUM = REPRENDRE — le retour du geste (voir `reprendre`) ;
         sur UNE pastille, il prend cette place-là (Eric, 05/09). */
      if (ou === RETOUR_VIVIER) { glisseCtx.reprendre(key); return; }
      if (ou.startsWith(PODIUM)) { glisseCtx.placerAuPodium(roll, ou, key); return; }
      /* 🔴 EN `FREE`, UN DÉPLACEMENT LATÉRAL VIDE SA SOURCE — Eric, 06/09 :
         *« il faut qu'on puisse déplacer un dé posé latéralement, vider le
         collecteur et le poser ailleurs ; ici, pas fait, on duplique »*.
         ⛔ CE QUE ÇA RENVERSE, ET LA RAISON D'ALORS ÉTAIT INCOMPLÈTE. On lisait
         *« la palette est inépuisable, donc déplacer RECOPIE »* — vrai de la
         PALETTE, faux du COLLECTEUR. Prendre une valeur au magasin ne l'épuise
         pas ; prendre un dé POSÉ, si : le geste dit « celui-là, ailleurs », et
         un geste de déplacement qui laisse l'objet derrière lui n'est pas un
         déplacement. Les deux origines ne portent pas le même verbe, et c'est
         l'origine qui décide — pas la nature du vivier.
         ⭐ DEUX ÉCRITURES, ET L'ORDRE COMPTE : on POSE d'abord (la valeur est
         lue sur `roll`, pas relue du document), on VIDE ensuite. L'inverse
         laisserait un instant où la valeur n'est nulle part. */
      if (composable) {
        glisseCtx.poserDepuisPalette(ou, roll.total);
        glisseCtx.reprendre(key);
        return;
      }
      glisseCtx.poser(ou, roll);
    }
  };

  section.append(organe);
  /* 🎨 LA PALETTE EST UNE RANGÉE À ELLE, SUR LE MODÈLE DU PODIUM DE B1 — Eric,
     2026-09-06 : *« toujours un grid, prends B1 en exemple »*.

     🔴 CE QUE ÇA RENVERSE, ET LA RAISON D'ALORS ÉTAIT BONNE : elle vivait DANS
     `.ability-flux`, la zone de défilement du gabarit trois bandes, parce que le
     croquis du 16/08 dessine la palette et son explication dans UN SEUL cadre
     (« CHOOSE EXPLICATION ») et parce qu'elle était le plus gros bloc de la page —
     c'était donc à elle de céder plutôt qu'au collecteur.
     📏 MAIS LE PRIX SE VOIT À L'ÉCRAN, et c'est ce qu'Eric a repris : mesuré à
     375, la palette fait **344 blg** dans un flux qui n'en montre que ~90 — on ne
     voyait QUE la première rangée (3 · 4 · 5 · 6), et les douze autres valeurs
     étaient sous un défilement que rien n'annonce. **Un vivier dont on ne voit
     qu'un quart n'est pas un vivier** — c'est NORMES §5 bis, mot pour mot :
     *« on lit un texte de haut en bas ; on CHOISIT parmi des jetons, et un jeton
     hors écran est introuvable »*.
     ⭐ ELLE PREND DONC LA PLACE EXACTE DU PODIUM : rangée `.fs-rangee` fille de
     l'étape, entre l'organe et le collecteur, hors de tout défilement. C'est la
     structure de B1 en scène 2, à la lettre — dalle · rangée de valeurs · dalle.
     ⛔ Et l'explication ne se perd pas : elle reste l'aiguilleur de l'organe,
     juste au-dessus. Ce que le croquis voulait — la phrase À CÔTÉ des valeurs —
     tient toujours ; c'est le CADRE commun qui s'en va, pas la proximité. */
  if (composable) section.append(renderPalette(glisseCtx, act));

  if (plateau) {
    /* ── DALLE 2 — le tapis vert porte les trois dés 3D. Invisible, centrée :
       *« la dalle est invisible centrée horizontalement / l'image porte les dés /
       elle remplit l'intégralité de la cellule »* (Eric, 05/09). Scène 1 seule :
       en scène 2 le tirage est fini, le tapis disparaît. */
    if (!scene2) {
      const tapis = el("section", "ability-tapis");
      tapis.append(plateau.des);
      section.append(tapis);
    }
    /* ── DALLE RÉSULTATS — *« îlot large, continu, voile 0, image tapis bleu,
       dans une cellule »*. Les dix cases vivent SUR l'image. En scène 1, la
       rangée de contrôles (livre · Cancel · ?) est sa dernière cellule — sacré
       n° 2, 8 blg du bas ; en scène 2 elle a transité vers la sélection.
       🟢 Le tapis est VERT depuis le 05/09 au soir (*« plus cohérent visuellement »*),
       le bleu du croquis reste une option (`--tapis-selection`, tokens.css) : la
       dalle porte le nom de son rôle, pas de sa couleur. */
    const resultats = el("section", "ability-resultats");
    const tapisSelection = el("div", "ability-tapis-selection");
    tapisSelection.append(plateau.cases);
    resultats.append(tapisSelection);
    section.append(resultats);
    if (!scene2) {
      /* 🟦 LA RANGÉE DE SCÈNE 1 EST SUR SA DALLE — Eric, 05/09, en la voyant flotter
         sur le fond sous le tapis bleu (voile 0) : *« ton cancel doit être sur une
         dalle »*. C'est la dalle flottante du sacré n° 2, sixième clause, posée
         ici sans défilement : du verre à 35 %, 8 de rembourrage, la rangée à 8 du
         bas. Elle disparaît avec la scène — en scène 2 la rangée a transité. */
      const dalleSortie = el("section", "ability-sortie-dalle dalle-simple");
      dalleSortie.dataset.sortieIci = "true";
      /* 🗣️ LA DÉCLARATION, PAS LA FABRICATION (garde 17) : l'hôte DIT ce qu'il
         attend de la coquille — `Cancel` (on abandonne, rien n'est posé) et pas de
         `Done` (rien à valider avant le dixième jet). La coquille produit. */
      dalleSortie.dataset.sortieMot = "Cancel";
      dalleSortie.dataset.sortieSansDone = "true";
      dalleSortie.append(renderLivreDeLaMethode("the-3d6-10-method"));
      section.append(dalleSortie);
    }
    /* Scène 1 s'arrête ici : ni podium ni sélection tant que les dix ne sont
       pas tombés — *« ça s'arrête à la dalle 3 »*. */
    if (!scene2) return section;
  }

  const vivier = renderVivier(glisseCtx);
  if (vivier) {
    /* ⭐ EN `FREE`, LA PALETTE VIT DANS LA BOÎTE DE L'EXPLICATION — le croquis
       les dessine dans UN SEUL cadre, titré « CHOOSE EXPLICATION », et les
       seize dés sont dedans. Ce n'est pas cosmétique : la phrase explique
       comment se sert la palette (*« take any value, as often as you like »*),
       et une explication séparée de ce qu'elle explique se lit deux fois.
       ⛔ Les trois autres viviers restent des RANGÉES posées sous leur organe :
       six dés sur une ligne n'ont besoin ni de cadre ni de mesure. Ce qui
       diffère est ce qui remplit le vivier — et seize valeurs, ça se loge. */
    section.append(vivier);
  }
  const collecteur = renderCollecteur(glisseCtx);
  if (plateau) {
    /* 🗣️ SCÈNE 2 : `Cancel` EFFACE LE LOT et ramène en scène 1 — c'est ce que le
       mot promet (rouge : *« il abandonne ou efface du travail fait »*). Reculer
       jusqu'au R se fait ensuite, du même bouton, depuis la scène 1 : une échelle
       où chaque `Cancel` défait le dernier pas. `Done` valide les six posés. */
    collecteur.dataset.sortieMot = "Cancel";
    collecteur.dataset.sortieVerbe = "abilityClear";
  } else {
    /* 🔴 ARRAY ET FREE DISENT `Cancel`, PAS `Back` — Eric, 06/09 : *« remplacer le
       back par un cancel rouge »*, *« idem dans array »*, *« cancel est toujours
       rouge »*. §6 : *« back n'annule rien · cancel abandonne ou efface du travail
       fait »* — et quitter cette page ABANDONNE les scores qu'on vient d'y poser.
       Le mot était donc faux, et la teinte l'était avec lui : *« quand une teinte
       se déduit d'un MOT, changer le vocabulaire change le dessin »*.
       ⛔ AUCUN VERBE, ET C'EST VOULU : `abilityClear` jette le LOT — sur ces deux
       méthodes, le lot n'est pas tiré, il EST la méthode (`lotSansDes`). Le jeter
       laisserait une page sans vivier, mesurée vide. C'est le retour par défaut de
       la coquille (un palier en arrière) qui vaut ici — exactement ce que la dalle
       de scène 1 de B1 déclare déjà : le mot seul, le geste de la coquille. */
    collecteur.dataset.sortieMot = "Cancel";
  }
  /* 🔴🔴 L'ABSOLU DU 04/09 — *« dernière rangée de boutons = `?` ET livre dedans.
     C'est un absolu »* (§6 pré). ARRAY et FREE ne le tenaient pas : leur rangée
     portait le `?` (la coquille le descend seule) et **pas le livre**, parce que
     ce `append` vivait sous la porte `if (plateau)` — donc sous les deux méthodes
     À DÉS, et sous elles seules.
     ⚠️ ET LA FAUTE ÉTAIT INVISIBLE À LA SUITE : une borne ABSENTE ne casse aucune
     rangée — les trois organes restants se centrent très bien à trois. C'est
     exactement ce que §6 pré nomme, *« il PARAISSAIT aligné ; il ne l'était que
     par coïncidence »*, pris par l'autre bout : ici il paraissait complet.
     ⭐ Ce qui reste sous la porte du plateau, c'est le MOT du bouton (`Cancel`,
     qui efface un lot — ARRAY et FREE n'en ont pas à effacer, ils gardent `Back`).
     Le livre, lui, ne dépend d'aucune mécanique : il mène au chapitre. */
  collecteur.append(renderLivreDeLaMethode(plateau ? "the-3d6-10-method" : null));
  section.append(collecteur);
  return section;
}

/** 📖 LE LIVRE DE LA MÉTHODE — il SORT vers la section `3d6 × 10` de FH WEB
 *  (sacré n° 2 : le livre mène, il ne raconte pas). L'écran le DÉPOSE dans
 *  l'hôte de sa sortie ; `poserLesBornes` le range en tête de la dernière rangée.
 *  Même patron qu'à `destiny-step.mjs` et qu'au R d'Abilities. */
/* ══ 🏁 LE BILAN — R2, l'écran de la racine une fois l'étape validée ═══════════
   Eric, 06/09 : *« les résultats des abilities sont disposés sur un tapis vert,
   comme en fin B1 : strength / 14 sur un dé / +2 / bonus, × 6 caracs. L'aiguilleur
   dans une dalle en dessous expliquant que cette étape est validée. Dans une
   cellule en dessous, les boutons : livre · Cancel · Next · ? Le Cancel revient à
   R1 »*. Le tapis est celui du tirage (552 × 176, il loge les trois lignes) ; les
   cellules sont celles du collecteur — nom en accent, dé dans sa cellule
   (`--de-pose`), bonus signé et son mot — un seul dessin pour un même objet. */
function renderBilan({ document: doc, resolved, rollBatch, act }) {
  const section = el("section", "ability-bilan");
  section.dataset.bandes = "true";
  const tapis = el("section", "ability-bilan-tapis");
  const cellules = el("div", "ability-bilan-cellules");
  ABILITY_KEYS.forEach((key, i) => {
    const valeur = currentAbilityValue(doc, key);
    const cellule = el("div", "ability-bilan-cellule");
    cellule.dataset.carac = key;
    cellule.append(el("span", "ability-bilan-nom", [text(abilityLabel(key))]));
    const de = el("span", "ability-bilan-de");
    if (Number.isInteger(valeur)) poserUnDe(de, valeur, FS.resolution, i);
    cellule.append(de);
    const final = renderFinalColumn(resolved, key, valeur, { compact: true });
    if (final) cellule.append(final);
    cellule.setAttribute("aria-label", `${abilityLabel(key)} — ${Number.isInteger(valeur) ? valeur : "not set"}`);
    cellules.append(cellule);
  });
  tapis.append(cellules);
  section.append(tapis);

  const dalle = el("section", "ability-bilan-dalle dalle-simple");
  /* 🌱 LE MÊME TOKEN, SOUS LES MÊMES CARACS — R2 est la destination commune des
     quatre méthodes (§7.9) : le trait s'y présente comme il se présente en B1,
     jamais dans une seconde forme. Il vient AVANT l'aiguilleur : sous le tapis,
     donc sous les caracs, exactement là où Eric le place. */
  if (lotRattrape(rollBatch)) dalle.append(renderTraitTardif(act));
  dalle.append(el("p", "guide-mot ability-bilan-mot", [text(
    "Your six ability scores are set. Next moves on to Skills; Cancel reopens the choice of method."
  )]));
  /* 🗣️ La déclaration, pas la fabrication : `Cancel` rend le choix (verbe déclaré),
     le bouton d'avance s'appelle `Next`, le livre ouvre la règle publiée. */
  dalle.dataset.sortieIci = "true";
  dalle.dataset.sortieMot = "Cancel";
  dalle.dataset.sortieVerbe = "abilityBilanCancel";
  dalle.dataset.sortieDoneMot = "Next";
  dalle.append(renderLivreDeLaMethode("the-3d6-10-method"));
  section.append(dalle);
  return section;
}

/* ⚓ ET SON ANCRE DÉPEND DE LA MÉTHODE — 06/09.
   `#the-3d6-10-method` est une ancre RELEVÉE sur la page publiée (curl du 05/09),
   et elle ne décrit QUE le tirage de Fate's Hand. ⛔ Y envoyer le joueur d'`ARRAY`
   ou de `FREE` serait le poser sur une section qui parle d'autre chose : le
   chapitre `ability-scores` ne porte aucune section pour ces deux méthodes —
   ⚠️ vérifié en le lisant, pas supposé. Ils ouvrent donc le chapitre ENTIER.
   ⛔ Et on n'invente pas une troisième ancre : une ancre morte ne se voit qu'en
   cliquant (la règle de `liens-fh.mjs`). */
function renderLivreDeLaMethode(ancre) {
  const livre = el("button", "fiche-livre livre-de-sortie");
  livre.type = "button";
  livre.setAttribute("aria-label", ancre
    ? "Ability scores — read the 3d6 × 10 rules on FH Web"
    : "Ability scores — read the rules on FH Web");
  livre.addEventListener("click", () => {
    window.open(lienAbilityScoresFhWeb(ancre || null), "_blank", "noopener");
  });
  return livre;
}

/** LA PORTE DE B5 — il n'y en a plus qu'UNE : *avancer quand les six scores
 *  sont posés*.
 *
 *  🔴 CE QUI A DISPARU AU LOT 79, ET POURQUOI C'EN ÉTAIT LE CŒUR. Il existait
 *  un premier palier — `roll` sans lot ⇒ la porte rendait `{kind:"rollBatch"}`,
 *  et la coquille JETAIT. Le plateau jette lui aussi, par le bouton que le
 *  joueur presse. **DEUX PROPRIÉTAIRES DU MÊME LOT** : quatre tentatives de
 *  branchement s'y sont cassées. C'est le palier qui est parti, pas le
 *  plateau — le geste d'Eric est *« je presse ROLL et je regarde tomber »*, et
 *  un `Validate` qui jette est un jet sans dés.
 *
 *  ⭐ ET IL N'Y A PLUS QU'UNE PORTE POUR LES QUATRE MÉTHODES. FREE en avait
 *  une à lui, qui comptait les POSES au lieu de lire le document : il le
 *  fallait tant que sa palette écrivait directement sur les caractéristiques
 *  (son geste de retrait ne pouvait pas effacer une valeur du document —
 *  `rebuild()` jette si l'une des six manque). Depuis qu'il COMPOSE un vivier
 *  comme les trois autres, il n'écrit au document qu'à l'affectation, et la
 *  porte commune redit la vérité pour lui aussi. Une exception qui tombe
 *  parce que sa cause a disparu, pas parce qu'on l'a désarmée. */
export function abilitiesValidate(ctx) {
  const document = ctx.document;
  /* ⭐ QUAND UN LOT EXISTE, LA PORTE COMPTE LES POSES, PAS LES VALEURS — c'est ce
     qui rend le RETOUR possible (05/09) : un dé repris laisse sa valeur au
     document (sinon `rebuild()` jette), et c'est la carte `assign` qui dit
     qu'il manque. Sans lot (saisie d'un score à la main), les valeurs décident. */
  const assign = ctx.rollBatch && ctx.rollBatch.assign ? ctx.rollBatch.assign : null;
  const toutesPosees = assign
    ? ABILITY_KEYS.every((key) => Number.isInteger(assign[key]))
    : ABILITY_KEYS.every((key) => Number.isInteger(currentAbilityValue(document, key)));
  /* 🏁 DEUX SORTIES POUR UN MÊME BOUTON (Eric, 06/09) : sur la page d'une méthode,
     `Done` mène au BILAN (`next: "bilan"`) ; sur le bilan, `Next` avance
     (`next: "step"`). Sans lot (un score saisi à la main), on avance comme avant. */
  if (ctx.bilan) return { exists: true, ready: true, action: null, next: "step" };
  return { exists: true, ready: Boolean(ctx.method) && toutesPosees, action: null, next: assign ? "bilan" : "step" };
}

