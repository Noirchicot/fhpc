/* ══ L'ÉTAPE ABILITIES — refaite au vocabulaire des cadres, lot 80 ═══════
   📐 Croquis `2026-08-16-abilities-quatre-methodes.jpg`, et le mandat
   `LOT-80-ABILITIES.md`. Le croquis fait foi.

   ⭐ CE LOT N'A RIEN INVENTÉ, IL A ASSEMBLÉ. Tous les organes existaient,
   déployés et éprouvés au banc : le glisser (`glisser.mjs`), la rangée FS et
   le collecteur (`ilots-lab.html`), le panneau INFO
   (`abilities-info-lab.html`), le plateau de dés (`abilities-tray.mjs`), la
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

import { markPressed } from "./carnet.mjs?v=56";
import { renderTray } from "./abilities-tray.mjs?v=56";
import { armerJeton } from "./glisser.mjs?v=56";
import { mecaniqueDeJet, rollAbilitySet } from "./dice.mjs?v=56";
import { createDieHost, mount } from "./dice3d.mjs?v=56";
import { ABILITY_KEYS, CREATION_SCORES, CREATION_SCORE_MAX } from "../../src/build/index.mjs?v=56";

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
  fantome: 46         // ⚠️ la seule cote d'affichage écrite — voir `fantomeLever`
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
    blurb: "Sixteen dice, 3 to 18 — take any value, as often as you like; the pool never runs out. "
      + "Drag a die off to discard it, or drop another on top to replace it."
  }
];

/** L'explication d'une méthode — celle de sa mécanique de jet quand elle en
 *  a une, la sienne sinon. ⛔ Jamais un `if` sur un id : l'entrée porte soit
 *  `mecanique`, soit `blurb`. */
function explicationDe(entry) {
  if (entry.mecanique) return mecaniqueDeJet(entry.mecanique).summary;
  return entry.blurb;
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

function abilityLabel(key) { return key.toUpperCase(); }

/** Le modificateur, écrit comme un joueur l'écrit : `+2`, `0`, `-1`. */
function motDuMod(mod) {
  if (typeof mod !== "number") return "—";
  return mod >= 0 ? `+${mod}` : String(mod);
}

/* ⚖️ LE PLAFOND DE 18 NE PARLE QU'AU NIVEAU 1 (lot 50, §2d) : au-delà, le SRD
   reprend la main (plafond 20). Le niveau se lit dans `resolved.identity`,
   jamais recalculé. */
function renderCapWarning(resolved, key) {
  if (!resolved || !resolved.abilities || !resolved.abilities[key]) return null;
  if (!resolved.identity || resolved.identity.level !== 1) return null;
  const score = resolved.abilities[key].score;
  if (typeof score !== "number" || score <= ABILITY_CAP) return null;
  /* ⛔ Alerte seulement — RIEN n'empêche `onAction` de partir plus haut. */
  return el("span", "ability-cap-warning", [text(`> ${ABILITY_CAP} at creation`)]);
}

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
export function renderFinalColumn(resolved, key, rawValue) {
  if (!resolved || !resolved.abilities || !resolved.abilities[key]) return null;
  const { score, mod } = resolved.abilities[key];
  if (typeof score !== "number") return null;
  const cell = el("span", "ability-row-final");
  cell.dataset.boosted = String(rawValue !== undefined && score !== rawValue);
  cell.append(el("span", "ability-row-final-label", [text("Final")]));
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
function poserUnDe(hote, valeur, taille, index) {
  const porte = el("span", "porte-de");
  porte.append(createDieHost({
    /* `result: 6` — la POSE du dé, honnête : c'est la face qu'il montre. */
    sides: 6, result: 6, sizePx: taille, index, animate: false, snapshot: true
  }));
  porte.append(el("b", "valeur", [text(String(valeur))]));
  hote.append(porte);
  mount(porte);
}

/* ══ LE FANTÔME — le dé qui suit le doigt ════════════════════════════════
   Eric, 2026-08-16 : *« je veux voir l'image du dé qui se déplace »*.

   🔴 IL EST POSÉ EN COORDONNÉES D'ÉCRAN, et c'est la seule façon honnête :
   le jeton d'origine vit dans une scène qui défile ; un fantôme dans le même
   flux se ferait couper par le premier `overflow`.
   ⛔ `pointer-events: none` (feuille) — sans elle, le fantôme se trouve SOUS
   le doigt quand `elementFromPoint` cherche la cible, et l'organe ne verrait
   jamais que lui-même. C'est le piège classique de cette forme.
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
let fantome = null;
let fantomeDemi = 0;

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
     📌 DEUX COTES SONT RECOPIÉES DE LA FEUILLE, et ce sont les seules :
     `FS.fantome` (46 px, sa largeur — il vit hors de toute colonne, donc il
     n'a aucune largeur à hériter) et `1.15` (son agrandissement,
     `.ability-fantome { scale: 1.15 }`). Toutes deux nommées des deux côtés. */
  fantomeDemi = (FS.fantome * 1.15) / 2;
  document.body.append(fantome);
  fantomeBouger(x, y);
}

function fantomeBouger(x, y) {
  if (!fantome || !fantome.style) return;
  /* Centré sur le doigt : la moitié de la taille est retirée pour que le
     curseur tombe au milieu du dé, jamais sur son coin. */
  fantome.style.transform = `translate(${x - fantomeDemi}px, ${y - fantomeDemi}px)`;
}

/** Les trois rappels du fantôme, les mêmes pour tout dé armé. */
function gestesDuFantome(valeur) {
  return {
    onLever: (x, y) => fantomeLever(valeur, x, y),
    onBouger: (x, y) => fantomeBouger(x, y),
    onPoser: () => fantomeRanger()
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
   · dans les **trois autres**, il ne se passe RIEN, et ce n'est pas un oubli :
     `rebuild()` JETTE si l'une des six valeurs manque au document (mesuré,
     `derive.mjs` : « un score ne se dérive de rien »). Il n'existe donc aucune
     action qui VIDE une cible sans en remplir une autre — on réarrange en
     posant, jamais en vidant (loi du lot 45, tenue depuis).
   ⭐ FREE peut se le permettre PARCE QUE SA PORTE COMPTE LES POSES, pas les
   valeurs du document (voir `abilitiesValidate`). Le document y garde sa
   dernière valeur — il le doit —, l'écran dit « rien de posé », et `DONE`
   s'éteint. Les deux vérités ne se contredisent pas : elles ne parlent pas de
   la même chose. */
const RETOUR_VIVIER = "vivier";

function renderVivier(ctx) {
  const { rollBatch } = ctx;
  const gardes = (rollBatch && Array.isArray(rollBatch.rolls) ? rollBatch.rolls : []).filter((r) => r.kept);
  if (gardes.length === 0) return null;
  const inepuisable = Boolean(rollBatch.inepuisable);

  /* ⛔ PAS DE `glisse-vivier` ICI, ET C'EST UNE COLLISION MESURÉE : cette
     classe pose `display: flex; flex-wrap: wrap` et une dalle à elle, et sa
     règle vient APRÈS `.fs-rangee` dans la feuille — à spécificité égale, elle
     l'emporterait, et la grille d'îlots redeviendrait une rangée de pastilles
     qui se replient. Le vivier des caractéristiques n'est pas le vivier des
     sorts : c'est une rangée FS, et elle porte son propre nom. */
  const rangee = el("ul", "ability-des-gardes fs-rangee");
  rangee.dataset.creneau = RETOUR_VIVIER;
  /* ══ ✅ LA PALETTE EST UN 4 × 4, DANS UNE FENÊTRE À HAUTEUR LIBRE ════════
     TRANCHÉ PAR ERIC, 2026-08-16 : *« je veux 4×4 dés en 3d sur une page F2 »*
     — puis, devant mon hésitation : *« sur une page F2 ! »*. Le croquis dit
     quatre rangs de quatre ; il les garde.

     🔴 ET LE « 2 » EST LA RÉPONSE AU PROBLÈME QUE SIX COLONNES CONTOURNAIT.
     Mesuré à 375 : un 4 × 4 fait **406 px** de haut, et avec le collecteur
     (243) il demande 649 px pour un champ de 493. La source et la cible d'un
     glisser ne seraient JAMAIS visibles ensemble — et `elementFromPoint` ne
     voit que le champ visible, donc le geste central de la méthode
     disparaîtrait. J'avais résolu ça en compressant à six colonnes (276 px) ;
     Eric résout la même chose sans toucher au dessin, en donnant à la palette
     **sa propre fenêtre à hauteur libre** : un PLAFOND, et le contenu qui
     défile DEDANS.

     ⭐ C'EST LA PROMESSE DE F2, RENDUE STRUCTURELLE — et `CADRES.md` §4
     l'annonçait mot pour mot comme ce qui la rendrait vraie : *« un plafond
     sur la carte, et le contenu qui défile À L'INTÉRIEUR »*, avec la mention
     ⏳ « personne ne l'emploie, rien ne l'implémente ». La palette est son
     premier utilisateur. Et le plafond obéit à la décision 3 du même
     fichier : *« seulement en secours »* — il ne se voit pas tant que le
     contenu tient (sur un bureau, les seize rangent d'un coup).

     ⚠️ UNE PRÉCISION DE VOCABULAIRE, DITE PLUTÔT QUE TUE : à la lettre du §1,
     un écran SANS menu latéral est un **FF**, et Abilities n'en a pas. Eric a
     dit « F2 » deux fois ; ce qu'il nomme est le **2** — hauteur libre,
     plafond, air autour —, pas la famille. La forme construite ici est donc
     un FF2 à plafond. Si le mot doit changer, c'est le mot, pas la fenêtre.

     ⚠️ ET CE QUE ÇA COÛTE, ANNONCÉ PAR `CADRES.md` LUI-MÊME : **un second
     défilement dans la scène**. Le dépôt en a déjà un (les grilles de sorts,
     lot 79) et il en connaît le prix — un jeton qui vit dans une grille qui
     défile ne peut pas porter `touch-action: none`, sinon la grille devient
     indéfilable au doigt. Le glisser y demande donc un MAINTIEN de 350 ms
     avant de soulever le dé. C'est la même machinerie, déjà éprouvée et
     gardée : `armerJeton({ maintien: true })`. */
  /* Une palette n'a AUCUN état : elle ne se vide pas, donc elle n'a rien à
     annoncer. Une rangée finie, si — et la feuille lit ce mot-là. C'est aussi
     ce mot qui lui donne sa fenêtre : quatre colonnes, un plafond, et le
     défilement dedans. */
  rangee.dataset.pool = inepuisable ? "inepuisable" : "fini";
  /* ⛔ ET AUCUN `data-scroller` : la palette ne défile PAS. Eric, 2026-08-16 :
     *« ça ne doit pas scroller »*. La scène en garde donc UN SEUL, comme le
     socle l'a toujours voulu (B0.21a) — le second défilement que la fenêtre
     bornée coûtait n'a pas eu lieu. */

  for (const roll of gardes) {
    const item = el("li", "fs");
    const pris = ctx.tenuPar(roll) !== null;
    /* ⛔ UN ÎLOT VIDÉ GARDE SA PLACE — la rangée ne se referme pas derrière un
       dé parti, sinon les cinq autres bougeraient sous le doigt en plein
       geste. ⭐ Et une palette ne se vide jamais : prendre un 14 n'enlève pas
       le 14 (§4.4, règle 1). */
    item.dataset.vide = String(pris && !inepuisable);
    if (pris && !inepuisable) {
      item.append(el("span", "fs-vide", [text("—")]));
      rangee.append(item);
      continue;
    }
    item.append(renderJetonDe(roll, FS.resolution, {
      /* ⛔ AUCUN MAINTIEN NULLE PART, ET C'EST LE BON ÉTAT. Il avait été posé
         sur la palette quand elle défilait dans sa fenêtre : dans une grille
         qui défile, un jeton ne peut pas porter `touch-action: none` sans
         rendre la grille indéfilable, et le glisser s'y paie alors 350 ms
         (lot 79). ⭐ La palette ne défile plus — le geste redevient immédiat
         partout, et le second défilement que `CADRES.md` annonçait comme le
         PRIX de la fenêtre n'est jamais payé. */
      chezSoi: true,
      onTap: () => ctx.poserAuPremierLibre(roll),
      onDepot: (ou) => { if (ou !== RETOUR_VIVIER) ctx.poser(ou, roll); }
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
function renderJetonDe(roll, taille, { chezSoi, onTap, onDepot }) {
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
     ⭐ ET UN JET AJUSTÉ LE DIT : le plancher du haut ou du bas a changé son
     total, et le détail seul mentirait (« 4+4+4 » sous un 14). */
  if (Array.isArray(roll.dice) && roll.dice.length > 0) {
    const detail = roll.ajuste ? `${roll.dice.join("+")} → ${roll.total}` : roll.dice.join("+");
    jeton.append(el("span", "ability-de-detail", [text(detail)]));
  }
  armerJeton(jeton, Object.assign(gestesDuFantome(roll.total), { onTap, onDepot }));
  return jeton;
}

/* ══ LE COLLECTEUR — les six cibles, et le pied du croquis ═══════════════
   `DRAG AND DROP HERE`, puis STR DEX CON INT WIS CHA.

   ⛔ LE PIED (`BACK` / `DONE`) N'EST PAS ICI, ET C'EST UNE DÉCISION D'ERIC.
   Le croquis les dessine dans cette boîte ; §5.1 du mandat dit ce qu'ils
   sont : *« ils ne sont pas la sortie d'Abilities, ils sont LE PATRON de la
   sortie d'étape »*. Ils sont donc produits UNE FOIS, par `shell.mjs`
   (`renderSortieEtape`), et se posent juste sous ce bloc. Les écrire ici en
   ferait la sortie d'UN écran, et le prochain lot en écrirait une seconde. */
function renderCollecteur(ctx) {
  const { document: doc, resolved } = ctx;
  const bloc = el("section", "choix-glisse ability-glisse ability-collecteur dalle-intermediaire");
  bloc.append(el("h3", "ability-collecteur-titre", [text("Drag and drop here")]));

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

    if (pose !== null) {
      /* LE DÉ POSÉ EST LE MÊME OBJET QU'AU VIVIER — il se reprend, et le
         lâcher sur une autre cible ÉCHANGE les deux (lot 51). C'est le geste
         normal quand on réarrange six scores. */
      creneau.append(renderJetonDe(pose, FS.resolution, {
        chezSoi: false,
        onTap: () => ctx.reprendre(key),
        onDepot: (ou) => ctx.deplacer(key, pose, ou)
      }));
    } else {
      creneau.append(el("span", "glisse-creneau-valeur", [text(valeur === undefined ? "—" : String(valeur))]));
    }

    creneau.setAttribute("aria-label", pose !== null
      ? `${abilityLabel(key)} — ${pose.total} placed`
      : valeur !== undefined ? `${abilityLabel(key)} — ${valeur}, not placed this time` : `${abilityLabel(key)} — empty`);

    /* La colonne « Final » du lot 46, au même octet : le score dérivé et son
       modificateur, boosts d'Inheritance compris. C'est le SEUL endroit de
       l'écran où le joueur lit ce que son choix DONNE. */
    const final = renderFinalColumn(resolved, key, valeur);
    if (final) creneau.append(final);
    const alerte = renderCapWarning(resolved, key);
    if (alerte) creneau.append(alerte);
    rangee.append(creneau);
  }
  bloc.append(rangee);
  bloc.append(el("p", "glisse-consigne", [text(ctx.consigne)]));
  return bloc;
}

/* ══ LE SÉLECTEUR DE MÉTHODE — FF2, dalle 35 % (croquis) ═════════════════ */
function renderSelecteurMethode(actif, infoOuvert, act) {
  const bloc = el("section", "ability-methodes dalle-simple");
  bloc.append(el("h3", "ability-methodes-titre", [text("Choose an ability generation method")]));
  const rangee = el("div", "ability-methodes-boutons");
  for (const entry of ABILITY_ENTRIES) {
    const tuile = el("button", "ability-entry");
    tuile.type = "button";
    tuile.dataset.entry = entry.id;
    markPressed(tuile, entry.id === actif);
    tuile.append(el("span", "ability-entry-label", [text(entry.label)]));
    tuile.addEventListener("click", () => act({ kind: "abilityMethod", value: entry.id }));
    rangee.append(tuile);
  }
  /* ⛔ `INFO` N'EST PAS UNE CINQUIÈME MÉTHODE — c'est un interrupteur. Il vit
     dans la même rangée parce que le croquis l'y met, et il porte son état
     (`aria-pressed`) parce qu'il en a un : le panneau est ouvert, ou non. */
  const info = el("button", "ability-entry ability-info-bouton");
  info.type = "button";
  info.dataset.entry = "info";
  markPressed(info, infoOuvert);
  info.append(el("span", "ability-entry-label", [text("INFO")]));
  info.addEventListener("click", () => act({ kind: "abilityInfo", value: !infoOuvert }));
  rangee.append(info);
  bloc.append(rangee);
  /* ⌨️ LE MOT DE LA RACINE, D'ERIC, MOT POUR MOT (2026-08-16) — et il vit DANS
     la dalle du sélecteur, pas en dessous : *« texte à intégrer dedans »*.

     ⚠️ CE QU'IL REMPLACE, ET POURQUOI CE N'EST PAS QU'UN LIBELLÉ. La phrase
     d'avant (« Nothing to act on yet — pick one of the methods above to
     begin ») était une note de PORTE : elle n'apparaissait que tant que
     `DONE` restait éteint, pour qu'un bouton muet ne le reste pas (lot 74).
     🔴 Or la racine n'a plus de `DONE` du tout (Eric, le même jour) : une
     note qui explique un bouton absent n'explique rien. Celle-ci ne parle plus
     d'un état, elle dit QUOI FAIRE — donc elle est là en permanence, comme le
     titre au-dessus d'elle.
     ⭐ Et sa seconde phrase fait un travail que rien ne faisait : elle rend
     `INFO` DÉCOUVRABLE. C'est d'autant plus utile depuis qu'il a la taille des
     quatre autres et ne se distingue plus par sa forme. */
  bloc.append(el("p", "ability-methodes-mot", [text(
    "Pick one of the methods above to begin. Click on info to understand the key differences."
  )]));
  return bloc;
}

/* ══ LE PANNEAU INFO — levé du banc `abilities-info-lab.html` ════════════
   L'argumentaire des trois façons de trouver ses six, en FF2, qu'on ferme en
   cliquant (III.4, « un popup se ferme en cliquant »).

   ⛔ LES CHIFFRES VIENNENT D'UNE SIMULATION DE 3 000 000 DE TIRAGES
   (2026-08-16), et aucun n'est arrondi à la louche : ils sont recopiés. Le
   moyen de les revérifier est de rejouer la simulation, pas de les relire.
   📌 Ils ont été REVÉRIFIÉS le 2026-08-16 contre l'implémentation de la règle
   telle qu'elle est écrite dans `dice.mjs` : moyenne 71,79 · un 18 dans
   4,5 % · un 16+ dans 38 % · un 15+ dans 62 %. Les quatre concordent.

   ⚠️ LES DEUX LECTURES DU MÊME ÉCART, ET IL FAUT LES DEUX. « Trois
   millièmes » est une FRACTION du total (0,21 sur 72) ; dit seul, il se lit
   comme trois millièmes DE POINT, ce qui est faux d'un facteur soixante-dix.
   On donne donc la valeur ET la proportion. */
/* 🔴 AUCUNE RÈGLE N'EST RECOPIÉE ICI — `methode` dit de quelle méthode chaque
   entrée parle, et sa règle se LIT au même endroit que l'explication de sa
   page (`explicationDe`). Le panneau et la page se lisent dans le MÊME écran,
   à un clic l'un de l'autre : deux formulations de la même règle, écrites par
   la même main, à deux endroits, c'est la divergence que ce dépôt passe son
   temps à éviter ailleurs. Relevé par l'architecte du lot 79, qui avait les
   deux textes sous les yeux et a vu qu'ils ne disaient pas la même chose.
   ⛔ Ce qui reste écrit ici est ce que le panneau SEUL raconte : le
   commentaire, les chiffres, la chute. Pas la règle. */
const INFO_METHODES = [
  {
    methode: "standard", titre: "Standard array", des: "15 · 14 · 13 · 12 · 10 · 8",
    corps: ["No luck, no regret, and nothing to tell anyone about afterwards. You will play the "
      + "character you meant to play — not the one the dice gave you."]
  },
  {
    methode: "fh3d6", titre: "Fate's Hand", des: "3d6 × 10",
    corps: ["On average it lands exactly where the array lands — 71.8 against 72.0 — but you rolled "
      + "for it. A 14 is promised, an 8 is owed, and nothing caps the top: one character in "
      + "twenty-two rolls an 18."],
    note: "That fifth of a point between 71.8 and 72.0 — three thousandths of your total — is the "
      + "house's commission. A casino has to pay for itself somehow; call it the price of the thrill."
  },
  {
    methode: "4d6", titre: "Four dice, six times", des: "4d6 × 6, drop the lowest",
    corps: ["The most generous method, and the least fair. Half of these characters have no real "
      + "weakness at all — and some end up plainly worse off than the array would have made them."]
  }
];

/** La règle d'une méthode, LUE là où sa page la lit. Une seule chaîne, deux
 *  surfaces — elles ne peuvent plus diverger sans qu'on le fasse exprès. */
function regleDe(methodeId) {
  const entry = ABILITY_ENTRIES.find((e) => e.id === methodeId);
  return entry ? explicationDe(entry) : "";
}

const INFO_TABLEAU = [
  ["Average total", "72.0", "71.8", "73.5"],
  ["Two characters alike", "always", "rarely", "never"],
  ["At least one 15", "always", "62%", "79%"],
  ["At least one 16", "never", "38%", "57%"],
  ["An 18", "never", "4.5%", "9.3%"],
  ["A real weakness", "always", "always", "48%"]
];

function renderPanneauInfo(act) {
  const bloc = el("section", "ability-info dalle-intermediaire");
  bloc.setAttribute("role", "dialog");
  bloc.setAttribute("aria-label", "How ability scores are found");

  const tete = el("div", "ability-info-tete");
  tete.append(el("h3", "ability-info-titre", [text("Three ways to find your six")]));
  const fermer = el("span", "ability-info-fermer", [text("tap to close")]);
  fermer.setAttribute("aria-hidden", "true");
  tete.append(fermer);
  bloc.append(tete);
  bloc.append(el("p", "ability-info-chapeau", [text(
    "They are not equally generous — and the generous one is not the fairest."
  )]));

  for (const methode of INFO_METHODES) {
    const bloc2 = el("div", "ability-info-methode");
    const enTete = el("div", "ability-info-methode-tete");
    enTete.append(el("h4", null, [text(methode.titre)]));
    enTete.append(el("span", "ability-info-des", [text(methode.des)]));
    bloc2.append(enTete);
    bloc2.append(el("p", "ability-info-regle", [text(regleDe(methode.methode))]));
    for (const paragraphe of methode.corps) bloc2.append(el("p", null, [text(paragraphe)]));
    if (methode.note) bloc2.append(el("p", "ability-info-note", [text(methode.note)]));
    bloc.append(bloc2);
  }

  /* ⚠️ LE TABLEAU DÉFILE DANS SA BOÎTE, jamais en emportant la page : un
     débordement horizontal casserait le glisser autant que la lecture. */
  const boite = el("div", "ability-info-tableau");
  boite.dataset.scroller = "info";
  const table = el("table");
  table.append(el("caption", null, [text("Measured over three million characters")]));
  const thead = el("thead");
  const ligneTete = el("tr");
  for (const titre of ["", "Array", "Fate's Hand", "4d6 × 6"]) {
    const th = el("th", null, [text(titre)]);
    th.setAttribute("scope", "col");
    ligneTete.append(th);
  }
  thead.append(ligneTete);
  table.append(thead);
  const tbody = el("tbody");
  for (const [intitule, array, fh, quatre] of INFO_TABLEAU) {
    const tr = el("tr");
    const th = el("th", null, [text(intitule)]);
    th.setAttribute("scope", "row");
    tr.append(th);
    tr.append(el("td", null, [text(array)]));
    /* La colonne du milieu est celle de la maison : elle se lit en premier. */
    tr.append(el("td", "fort", [text(fh)]));
    tr.append(el("td", null, [text(quatre)]));
    tbody.append(tr);
  }
  table.append(tbody);
  boite.append(table);
  bloc.append(boite);

  const chute = el("div", "ability-info-chute");
  chute.append(el("p", null, [text(
    "The array is a decision. Fate's Hand is a wager with a floor and a ceiling. "
    + "Four dice is a wager with neither."
  )]));
  chute.append(el("p", "ability-info-note", [text(
    "Note the last line: the most generous method is also the only one that lets you off without a flaw."
  )]));
  chute.append(el("p", "ability-info-pied", [text("Tap anywhere to close.")]));
  bloc.append(chute);

  bloc.addEventListener("click", () => act({ kind: "abilityInfo", value: false }));
  return bloc;
}

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
    rolls: CREATION_SCORES.map((total, index) => ({ dice: [], total, index, kept: true })),
    rerollCount: 0,
    method: "free",
    inepuisable: true,
    assign: emptyAbilityAssign()
  };
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
 * @param {boolean} [ctx.info]    le panneau INFO est ouvert
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
    section.append(renderSelecteurMethode(ctx.method || null, Boolean(ctx.info), act));
    if (ctx.info) section.append(renderPanneauInfo(act));
    return section;
  }

  /* Un palier 2 sans méthode ne peut pas exister (c'est le choix qui l'ouvre),
     mais un état d'écran se lit, il ne se suppose pas. */
  if (!entry) return section;

  /* ⭐ LA PAGE DIT DE QUELLE MÉTHODE ELLE EST. Sans le sélecteur au-dessus,
     c'est la seule chose qui replace le joueur après un `BACK` mal visé — et
     le libellé est celui du croquis, jamais un id. */
  section.append(el("h2", "ability-page-titre", [text(entry.label)]));

  /* ── L'ORGANE : l'explication, et le jet quand il y en a un ────────── */
  const organe = el("section", "ability-organe dalle-intermediaire");
  organe.dataset.methode = entry.id;
  organe.append(el("p", "ability-organe-mot", [text(explicationDe(entry))]));
  if (entry.mecanique) {
    /* ⭐ LE PLATEAU SERT LES DEUX MÉCANIQUES depuis ce lot — trois dés et dix
       jets, ou quatre dés et six jets. C'est le tableau qui le dit, jamais un
       `if` ici. ⛔ Ses rappels ne passent PAS par `refresh()` : voir l'en-tête
       d'`abilities-tray.mjs` et les actions du shell. */
    organe.append(renderTray({
      mecanique: mecaniqueDeJet(entry.mecanique),
      lot: rollBatch && rollBatch.method === entry.mecanique ? rollBatch : null,
      revele: ctx.revele || 0,
      onNouveauLot: (lot) => act({ kind: "abilityLot", lot }),
      onRevele: (valeur) => act({ kind: "abilityRevele", valeur }),
      onClear: () => act({ kind: "abilityClear" })
    }));
  }
  section.append(organe);

  /* ══ LE CONTEXTE PARTAGÉ DES DEUX ÉTAGES DU BAS ════════════════════════
     🔴 UNE SEULE DÉFINITION DES GESTES POUR LES QUATRE MÉTHODES. Ce qui
     change entre elles n'est pas le geste, c'est le VERBE qu'il commet :
     · lot fini (FH 3D6 · 4D6 · ARRAY) → `assignAbilityRoll` (clef + index +
       valeur), et `shell.mjs` décide POSE ou ÉCHANGE (lot 51, §1b) ;
     · palette (FREE) → `set` sur `abilities.<clef>`, plus la carte d'écran.
     ⛔ Écrire deux collecteurs pour ça aurait été la faute du §1 du mandat. */
  const inepuisable = Boolean(rollBatch && rollBatch.inepuisable);
  const assign = (rollBatch && rollBatch.assign) || {};
  const parIndex = new Map((rollBatch && rollBatch.rolls ? rollBatch.rolls : []).map((r) => [r.index, r]));

  const glisseCtx = {
    document: doc, resolved, rollBatch, assign,
    /** Le jet posé sur cette clef, ou `null` — lu dans `assign`, la SEULE
     *  carte qui le sache (lot 50, §2a : elle vit hors document et meurt avec
     *  le lot). Jamais une comparaison de valeurs : c'était le défaut du
     *  lot 50, et deux dés à 14 le rejouraient. */
    posePour(key) {
      const index = assign[key];
      if (index === null || index === undefined) return null;
      return parIndex.get(index) || null;
    },
    /** QUI TIENT CE DÉ — `null` si personne. ⛔ Sur une palette, personne ne
     *  « tient » rien : le dé se copie, il ne se déplace pas. */
    tenuPar(roll) {
      if (inepuisable) return null;
      for (const [key, tenu] of Object.entries(assign)) if (tenu === roll.index) return key;
      return null;
    },
    poser(key, roll) {
      if (inepuisable) { act({ kind: "abilityFree", key, value: roll.total, rollIndex: roll.index }); return; }
      act({ kind: "assignAbilityRoll", key, rollIndex: roll.index, value: roll.total });
    },
    /** LE TAP : la première caractéristique encore servie par aucun dé. Le
     *  croquis ne nomme que le glisser ; ce raccourci ne lui retire rien et
     *  évite six glissers au pouce quand l'ordre est indifférent. */
    poserAuPremierLibre(roll) {
      const libre = ABILITY_KEYS.find((key) => assign[key] === undefined || assign[key] === null);
      if (libre) glisseCtx.poser(libre, roll);
    },
    /** LE TAP SUR UN DÉ POSÉ. En FREE il le retire ; ailleurs il ne fait
     *  rien — voir `RETOUR_VIVIER`, il n'existe aucune action qui vide une
     *  cible sans en remplir une autre. */
    reprendre(key) {
      if (inepuisable) act({ kind: "abilityFreeRetirer", key });
    },
    /** LE GLISSER D'UNE CIBLE VERS AILLEURS. Sur une autre cible, il ÉCHANGE
     *  (lot 51) ou, en FREE, il RECOUVRE — l'échange n'a de sens que si les
     *  dés sont en nombre fini ; ici le vivier est inépuisable, il n'y a rien
     *  à rendre (§5.3, divergence voulue n° 1). Sur le vivier, il retire —
     *  en FREE seulement (divergence voulue n° 2). */
    deplacer(key, roll, ou) {
      if (ou === RETOUR_VIVIER) { glisseCtx.reprendre(key); return; }
      if (ou === key) return;
      glisseCtx.poser(ou, roll);
      /* ⭐ EN FREE, RECOUVRIR NE VIDE PAS LA SOURCE — le dé est une COPIE, il
         reste où il était. C'est ce qu'Eric décrit : on dégage un dé en le
         glissant dans le vide, pas en le déplaçant. */
    },
    consigne: inepuisable
      ? "Drag a die onto an ability · drop one on top to replace it · drag it back up to discard it"
      : "Drag a die onto an ability · dropping one that is already placed swaps the two"
  };

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
    if (inepuisable) organe.append(vivier);
    else section.append(vivier);
  }
  section.append(renderCollecteur(glisseCtx));
  return section;
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
 *  ⚠️ FREE COMPTE AUTREMENT, ET C'EST LA CONTREPARTIE DE SON RETRAIT (§5.3).
 *  Les trois autres méthodes lisent le DOCUMENT : les six valeurs y sont, la
 *  porte s'ouvre. FREE ne le peut pas — son geste de retrait ne peut PAS
 *  effacer une valeur du document (`rebuild()` jette si l'une des six manque,
 *  `derive.mjs`), donc le document reste complet même quand l'écran montre une
 *  case vide. Sa porte compte donc les POSES, la seule chose qui dise la
 *  vérité de ce que le joueur voit.
 *  ⛔ Et cette divergence est BORNÉE à FREE : ailleurs, revenir sur l'étape
 *  avec six scores déjà choisis rouvrirait la porte, comme aujourd'hui — la
 *  faire compter les poses partout obligerait à reposer six dés pour repasser
 *  sur un écran déjà rempli. */
export function abilitiesValidate(ctx) {
  const document = ctx.document;
  const lot = ctx.rollBatch;
  if (lot && lot.inepuisable) {
    const assign = lot.assign || {};
    const toutesPosees = ABILITY_KEYS.every((key) => assign[key] !== null && assign[key] !== undefined);
    return { exists: true, ready: toutesPosees, action: null, next: "step" };
  }
  const toutesPosees = ABILITY_KEYS.every((key) => Number.isInteger(currentAbilityValue(document, key)));
  return { exists: true, ready: Boolean(ctx.method) && toutesPosees, action: null, next: "step" };
}
