/* ══ LE MOT DE L'ÉCRAN QUI NE PEUT PAS SE DESSINER ════════════════════════
   §5 du canon — LE REFUS QUI NOMME. Un cran qui DÉCLARE lire la fiche ou la
   classe (`lit`, etapes.mjs — lot 198 ; avant lui, une liste par nom dans
   shell.mjs) n'a rien à montrer quand ce qu'il lit n'existe pas, et il doit
   le DIRE — la cause ET la sortie, jamais l'une sans l'autre.

   📏 LE DÉFAUT MESURÉ EN LIGNE LE 2026-09-09, sur v606 : la pile passe de 7 à
   9 couches, un personnage gardé la veille ne correspond alors à aucun des
   deux jeux de règles, et les six écrans rendaient *« This screen reads your
   character sheet, and it cannot be derived yet. »* — ni cause, ni sortie.
   Le Menu, lui, disait la vérité au même instant (*« doesn't match either
   ruleset — flip Fate's Hand to realign it »*, `universe-step.mjs`). Le même
   personnage recevait donc deux traitements selon l'onglet regardé.

   ⭐ LE PATRON ÉTAIT DÉJÀ ÉCRIT DEUX LIGNES PLUS HAUT — le cas « pas de
   classe » nomme sa cause et son geste depuis le 2026-08-20. Ce module
   l'EXTRAIT et l'ÉTEND ; il n'invente pas une seconde manière de parler.

   🔴 POURQUOI UN MODULE, ET PAS TROIS LIGNES DANS `shell.mjs` : `shell.mjs`
   n'a AUCUN harnais de rendu (`tests/shell-wiring.test.mjs` le déclare depuis
   le lot 50) — tout ce qui y vit ne peut être gardé que sur les octets. Une
   phrase de joueur choisie par une CONDITION mérite mieux : ici, un test
   fabrique un document dont la pile ne correspond à rien et LIT la phrase
   rendue. Le garde peut accuser.

   ⚠️ LES TEXTES SONT DES BROUILLONS. Ils sont en anglais (arbitrage d'Eric,
   voir la tête de `shell.mjs`) et ils attendent sa relecture — c'est lui qui
   arrête les mots que le joueur lit.

   ⛔ CE MODULE NE RÉPARE RIEN, ET C'EST DÉLIBÉRÉ. Remonter la pile vers
   `srdfh` serait « toujours sûr » au sens où ça n'ENLÈVE aucune couche, et
   c'est précisément ce qui rend l'automatisme tentant : réécrire
   `build.layers` d'un personnage que personne n'a touché, c'est écrire dans
   SON document sans qu'il le demande. Décision d'Eric, pas d'un lot. */

import { currentStack } from "./universe-step.mjs?v=622";
/* ⭐ LOT 188 — UN SOUS-ENSEMBLE DE COUCHES EST LÉGITIME, PAS INCONNU. Depuis
   l'écran `Layers`, un joueur coupe Trainings, ou Destiny, une par une ;
   `currentStack` ne sait nommer que les deux piles entières et rend `null` sur
   ce personnage-là. L'accuser d'une « pile inconnue » l'enverrait flipper
   Fate's Hand pour défaire ce qu'il vient de choisir. `compositionFh` lit le
   document interrupteur par interrupteur : seule une composition qu'AUCUN
   interrupteur ne peut produire reste innommable. */
import { compositionFh } from "./layers-ecran.mjs?v=622";
/* LOT 191 — le nom d'un record absent : l'id humanisé, jamais l'id ; et
   l'interrupteur qui le porte, pour que la phrase nomme la bonne ligne. */
import { motHumainDeLId, MOT_HORS_PILE } from "./mot-du-choix.mjs?v=622";
import { interrupteurDUnId } from "./interrupteurs.mjs?v=622";
/* 🌱 LOT 198 — les six clefs se LISENT au moteur (la même liste que `derive`
   exige), jamais recopiées ici ; et le numéro du cran où aller se lit sur la
   ceinture, jamais écrit en dur (la loi d'`etapeParId`). */
import { ABILITY_KEYS } from "../../src/build/index.mjs?v=622";
import { etapeParId } from "./etapes.mjs?v=622";

/** LA TÊTE COMMUNE — les trois phrases partent du même mot, parce qu'elles
 *  décrivent le même écran dans le même état. */
const TETE = "This screen reads your character sheet, and ";

/** 🔴 LA PILE NE CORRESPOND À AUCUN DES DEUX JEUX DE RÈGLES.
 *  Les mots reprennent ceux du Menu (*« doesn't match either ruleset »*,
 *  *« flip Fate's Hand to realign it »*) et ajoutent ce que le Menu n'a pas
 *  besoin de dire, parce qu'il EST l'écran de l'interrupteur : OÙ il se
 *  trouve. Un joueur qui lit cette phrase sur Equipment doit savoir où
 *  aller. */
export const MOT_PILE_INCONNUE = TETE
  + "this character's layer stack doesn't match either ruleset, nor any mix of its layers, so there is nothing to derive it from. "
  + "Open Menu, the first tab, and flip the Fate's Hand switch: it realigns the stack, "
  + "and this screen comes back with it.";

/** 🔴 LOT 186 — LE CRAN N'EST PLUS SUR LA CEINTURE.
 *
 *  ⚖️ La ceinture est devenue VERSATILE : chaque cran déclare le drapeau dont
 *  il a besoin, et la pile montée décide (voir `etapes.mjs`). Un joueur peut
 *  donc se retrouver DEVANT un écran que la ceinture ne montre plus.
 *
 *  📏 CE QUE ÇA DONNAIT AVANT CE MOT, MESURÉ LE 2026-09-09 : en vue double, le
 *  panneau PASSIF peut être Destiny pendant que l'actif est le Menu, c'est-à-
 *  dire pendant qu'on éteint Fate's Hand. La pile perd `fh.destiny`, le
 *  catalogue des arcanes tombe à 0 record (mesuré : 22 → 0), et l'écran
 *  continuait d'afficher le R — *« Twenty-two cards watch over Nymedes »* — et
 *  un bouton `Draw` qui ne fait RIEN, en silence (`drawArcana([])` rend
 *  `null`). Un faux magasin, exactement ce que §0.5 interdit.
 *
 *  ⛔ ET ON NE DÉPLACE PAS LE JOUEUR À SA PLACE. Le rasseoir d'office sur le
 *  cran voisin serait une réparation silencieuse — la même que ce module
 *  refuse déjà pour la pile (voir sa tête). On NOMME, il décide.
 *
 *  ⚠️ LE MOT NE CITE AUCUNE ÉTAPE PAR SON NOM, et c'est voulu : le cran absent
 *  n'a par définition plus de libellé résolu sur la ceinture. En nommer un
 *  reviendrait à rouvrir la seconde voix que le lot vient de fermer. */
export const MOT_CRAN_NON_MONTE =
  "This step belongs to a ruleset your layer stack no longer carries, so there is nothing here to settle. "
  + "Open Menu, the first tab, and turn Fate's Hand back on to bring it back — "
  + "or leave it: your character is complete without it, and nothing you chose has been erased.";

/** 🔴 LOT 191 — UN CHOIX QUE LA PILE NE RÉSOUT PAS, DIT AU PIED DE L'ÉTAPE.
 *
 *  📏 LE DÉFAUT, VU EN LIGNE LE 2026-09-09 (v614) : un Araag, Fate's Hand
 *  éteint depuis `Layers`, et l'écran Species disait *« This step is settled.
 *  Change your mind if you want to start it over. »* sous `fh:species:en:araag`.
 *  Rien n'était réglé, et le joueur lisait un id.
 *
 *  ⭐ LA MÊME VOIX QUE `MOT_CRAN_NON_MONTE`, parce que c'est la même cause vue
 *  d'un cran plus près : là, tout le cran appartient à un jeu de règles que
 *  la pile ne porte plus ; ici, UN choix de ce cran. La cause ET la sortie,
 *  jamais l'une sans l'autre — et la sortie nomme SES boutons mot pour mot :
 *  l'interrupteur de `Layers`, ou `I changed my mind` (*« change your
 *  mind »*, comme le pied du guide).
 *
 *  ⚖️ ET ELLE NOMME L'INTERRUPTEUR QUI PORTE CHAQUE RECORD — Eric, 09/09 :
 *  *« Araag comes with World — switch it on in Layers »* (World, ex-Lore :
 *  le lexique du 10/09 ; le mot lit le label de la table). Un Araag, un don et
 *  deux langues n'appartiennent pas au même interrupteur : les noms se
 *  groupent PAR interrupteur (*« Auspicious comes with Destiny, and Language
 *  elf and Language human come with Trainings »*), jamais « Fate's Hand » en
 *  général quand une ligne précise de `Layers` suffit.
 *
 *  ⛔ ON NE RÉPARE RIEN ET ON N'EFFACE RIEN : rallumer la couche est le geste
 *  du joueur, et son choix l'attend (Eric, 09/09 : *« que le personnage ne se
 *  dissocie pas, pas trop grave »*).
 *
 *  ⚠️ LE TEXTE EST UN BROUILLON en attente d'Eric, comme les autres de ce
 *  module ; le garde lit ce qu'il PORTE (les noms, la cause, le geste), pas
 *  sa ponctuation.
 *
 *  @param {Array<{id:string}>} refs les refs morts de l'étape (`refsMortsDeLEtape`)
 *  @returns {string|null} la phrase, ou `null` s'il n'y a rien à dire */
export function motDesChoixNonResolus(refs) {
  /* Les noms, groupés par interrupteur, dans l'ordre où les refs arrivent. */
  const groupes = [];
  for (const r of Array.isArray(refs) ? refs : []) {
    const nom = motHumainDeLId(r && r.id);
    if (!nom) continue;
    const sw = interrupteurDUnId(r.id);
    const clef = sw ? sw.label : null;
    let groupe = groupes.find((g) => g.clef === clef);
    if (!groupe) { groupe = { clef, noms: [] }; groupes.push(groupe); }
    if (!groupe.noms.includes(nom)) groupe.noms.push(nom);
  }
  if (groupes.length === 0) return null;
  const liste = (noms) => (noms.length === 1 ? noms[0] : `${noms.slice(0, -1).join(", ")} and ${noms[noms.length - 1]}`);
  const clauses = groupes.map(({ clef, noms }) => {
    const pluriel = noms.length > 1;
    return clef
      ? `${liste(noms)} ${pluriel ? "come" : "comes"} with ${clef}`
      : `${liste(noms)} ${pluriel ? "are" : "is"} ${MOT_HORS_PILE}`;
  });
  const total = groupes.reduce((n, g) => n + g.noms.length, 0);
  const nommes = groupes.filter((g) => g.clef).length;
  const sortie = nommes === 0
    ? "Open Menu, the first tab, and turn that ruleset back on in Layers"
    : `switch ${nommes > 1 || total > 1 ? "them" : "it"} on in Layers (Menu, the first tab)`;
  return `${liste(clauses)} — ${sortie}, or change your mind and pick again. Nothing you chose has been erased.`;
}

/** LE MOT DU 2026-08-20, REPRIS À LA LETTRE — il n'avait aucun défaut.
 *  Il reste le mot EXACT du personnage qui a ses scores et perd sa classe
 *  (`I changed my mind` sur Class — le chemin mesuré ce jour-là).
 *  ⭐ LA CAUSE ET LA SORTIE VIVENT À PART DE LA TÊTE (lot 198) : un chapitre
 *  qui VIT sans fiche (Skills) les emploie telles quelles à la place du
 *  chiffre déduit — mêmes mots, un seul écrivain ; la tête reste celle de
 *  l'écran qui ne se dessine pas. La constante composée n'a pas bougé d'un
 *  octet. */
const CAUSE_SANS_CLASSE = "there is no sheet without a class. Choose one on Class, and this screen comes back with it.";
export const MOT_SANS_CLASSE = TETE + CAUSE_SANS_CLASSE;

/* ══ 🌱 LOT 198 — LES CHOIX QUE LA DÉRIVATION EXIGE, LUS DANS LE DOCUMENT ══
   📏 MESURÉ SUR v621 en retirant chaque choix d'un personnage dérivable :
   `derive` refuse sans `level` (*« aucun choix `level` entier entre 1 et
   20 »*), sans `class` (*« aucun choix `class` »*), et sans l'un des six
   `abilities.*` (*« les six scores de caractéristique sont des CHOIX, et
   ceux-ci manquent : … »*) ; `species` n'est PAS exigé. Trois causes, trois
   lectures ci-dessous — sur la DONNÉE, jamais sur le message du moteur, qui
   est en français et pour la machine.

   ⭐ ET CHAQUE CAUSE NOMME LE CRAN OÙ ELLE SE RÈGLE, parce que c'est là tout
   l'intérêt : Abilities est l'écran qui POSE les scores. Avant ce lot, le
   personnage neuf lisait *« it cannot be derived yet »* sur Abilities — la
   phrase muette, sur l'écran même qui aurait réparé l'état. */

/** Le score posé pour une clef, ou `undefined` — la même lecture que `derive`
 *  (`takeValue("abilities.<clef>")`, un entier), sans en recopier le refus. */
function scorePose(choices, clef) {
  const choix = choices.find((c) => c && c.path === `abilities.${clef}`);
  return choix && Number.isInteger(choix.value) ? choix.value : undefined;
}

/** CE QUI MANQUE AU DOCUMENT POUR DÉRIVER, choix par choix.
 *  @param {object} doc le document `fh-char/1` vivant
 *  @returns {{niveau:boolean, classe:boolean, scores:string[]}}
 *    `niveau`/`classe` : vrai si le choix MANQUE ; `scores` : les clefs sans
 *    score entier, dans l'ordre du moteur (vide quand les six sont posés). */
export function choixExigesManquants(doc) {
  const choices = (doc && doc.build && Array.isArray(doc.build.choices)) ? doc.build.choices : [];
  const niveau = choices.find((c) => c && c.path === "level");
  return {
    niveau: !(niveau && Number.isInteger(niveau.value) && niveau.value >= 1 && niveau.value <= 20),
    classe: !choices.some((c) => c && c.path === "class" && c.ref),
    scores: ABILITY_KEYS.filter((clef) => scorePose(choices, clef) === undefined)
  };
}

/** Le mot d'un cran tel que la ceinture le montre — jamais un libellé écrit
 *  ici (`etapeParId`, la loi des voix multiples). ⚠️ Class et Abilities
 *  n'exigent aucun drapeau : ils sont sur toutes les ceintures, et
 *  `etapeParId` les trouve sans drapeau. Le repli (l'id, capitalisé) n'est
 *  jamais atteint ; il est là pour qu'un cran retiré ne fasse pas jeter la
 *  phrase qui devait aider. ⚠️ `MOT_SANS_CLASSE`, lui, écrit « Class » en
 *  toutes lettres : c'est le mot du 2026-08-20, gardé à la lettre.
 *  Exporté (lot 198) pour qu'un chapitre qui nomme un cran dans une phrase
 *  (Equipment : « choose a class on Class ») lise le même mot ici. */
export function motDuCran(id) {
  const cran = etapeParId(id, []);
  return cran ? cran.mot : id.charAt(0).toUpperCase() + id.slice(1);
}

/** LES SCORES MANQUENT, LA CLASSE EST LÀ — et la sortie nomme le cran qui
 *  les pose. Les clefs manquantes sont nommées EN MAJUSCULES, comme le tapis
 *  d'Abilities les écrit. ⚠️ Brouillon en attente d'Eric, comme les autres. */
function causeSansScores(clefs) {
  const liste = clefs.map((c) => c.toUpperCase());
  const combien = liste.length === ABILITY_KEYS.length ? "all six" : `${liste.length} of the six`;
  return `there is no sheet until its six ability scores are set — ${combien} are still missing (${liste.join(", ")}). `
    + `Set them on ${motDuCran("abilities")}, and this screen comes back with them.`;
}
export function motSansScores(clefs) { return TETE + causeSansScores(clefs); }

/** LA CLASSE ET LES SCORES MANQUENT — le personnage NEUF, tel que `composer`
 *  le fait naître. Les deux manques sont nommés ENSEMBLE, avec les deux crans,
 *  parce qu'un joueur envoyé sur Class reviendrait ici lire « set them on
 *  Abilities » : un refus qui ne nomme que la moitié fait faire deux voyages. */
function causeSansClasseNiScores() {
  return "there is no sheet without a class and its six ability scores. "
    + `Choose a class on ${motDuCran("class")}, then set the scores on ${motDuCran("abilities")}, and this screen comes back with them.`;
}
export function motSansClasseNiScores() { return TETE + causeSansClasseNiScores(); }

/** LE NIVEAU MANQUE — un document ouvert depuis un fichier d'avant le lot 198,
 *  quand aucun écrivain ne posait le niveau de naissance. ⚠️ AUCUN cran ne
 *  pose un niveau (c'est un fait du produit, écrit par `composer`), donc la
 *  seule sortie du builder est un personnage neuf. ⚠️ BROUILLON : le mot, et
 *  surtout le geste qu'il propose, attendent Eric — le magasin (lot 195) est
 *  hors de ce lot, et c'est lui qui dira un jour si un tel fichier se répare. */
const CAUSE_SANS_NIVEAU = "this character carries no level, and nothing in the builder sets one. "
  + "Open Menu, the first tab, and start a new character with Build a character: it is born at level 1.";
export const MOT_SANS_NIVEAU = TETE + CAUSE_SANS_NIVEAU;

/** ══ 🌱 LOT 198 — LE MANQUE, NOMMÉ POUR UN CHAPITRE QUI VIT ═════════════════
 *  ⚖️ Eric, 10/09 : *« Ce que tu crées dans Sheet est un précurseur de la
 *  fiche, non ? Pourquoi ne pas dériver tous ces éléments dans le bilan de
 *  Sheet ? »* — les chapitres travaillent sur les choix, un seul déduit :
 *  Sheet. Un chapitre qui montre un chiffre déduit en chemin (Skills : le
 *  pool) ne meurt donc pas quand la fiche manque, et il ne ment pas non plus
 *  (*« No free pool — the SRD rules apply »* sur une pile qui PORTE le pool,
 *  mesuré le 10/09) : il NOMME, avec CES mots — la cause et la sortie, sans
 *  la tête de l'écran mort, qui décrit un écran qui ne se dessine pas.
 *  ⛔ UN SEUL ÉCRIVAIN : l'écran qui nomme importe cette fonction, il ne
 *  recopie aucune phrase (garde : tests/naitre-derivable.test.mjs, « Skills
 *  sans fiche »). `motDeLEcranMort` est composé sur elle : la tête, puis le
 *  même manque.
 *  @returns {string|null} la cause et la sortie, ou `null` quand aucun des
 *    choix exigés (niveau, classe, scores) ne manque — la fiche manque alors
 *    pour une raison que le document ne sait pas nommer (`MOT_SANS_RAISON`). */
export function motDuManque(doc) {
  /* LES TROIS CHOIX EXIGÉS, DANS L'ORDRE DU MOTEUR (level, puis class, puis
     les scores), lus dans le document et jamais dans le message de `derive`.
     Le niveau seul quand il manque : sa sortie (un personnage neuf) rend les
     deux autres sans objet. Classe et scores ENSEMBLE quand les deux manquent
     — c'est le personnage neuf, et on ne fait pas faire deux voyages pour un
     seul refus. */
  const manques = choixExigesManquants(doc);
  if (manques.niveau) return CAUSE_SANS_NIVEAU;
  if (manques.classe && manques.scores.length > 0) return causeSansClasseNiScores();
  if (manques.classe) return CAUSE_SANS_CLASSE;
  if (manques.scores.length > 0) return causeSansScores(manques.scores);
  return null;
}

/** ⛔ LE MOT MUET, GARDÉ TEL QUEL ET NOMMÉ COMME MUET.
 *  Depuis le lot 198, il ne couvre plus ni le niveau, ni la classe, ni les
 *  scores — chacun a son mot. Il reste pour les causes qu'aucun geste du
 *  builder ne produit et qu'aucune lecture du document ne sait nommer : un
 *  choix qui pointe un record que la pile ne porte plus, un refus d'invariant
 *  du moteur. Leur phrase de joueur n'est pas inventée ici — c'est à Eric de
 *  la dire, ou à un lot qui l'aura mesurée.
 *  ⚠️ Cette constante existe pour être TROUVABLE : tant qu'elle est atteinte,
 *  il reste un joueur qui lit une impasse sans sortie. */
export const CAUSE_SANS_RAISON = "it cannot be derived yet.";
export const MOT_SANS_RAISON = TETE + CAUSE_SANS_RAISON;

/** LA PHRASE DE L'ÉCRAN MORT, pour un document donné.
 *
 *  🔴 L'ORDRE DES DEUX CAUSES EST CELUI DU MOTEUR, PAS CELUI DE MA LECTURE :
 *  `build.rebuild` (block.mjs) confronte la pile AVANT d'appeler `derive`,
 *  et c'est `derive` qui refuse l'absence de classe. Un personnage qui porte
 *  les deux défauts est donc arrêté par la PILE : lui dire « choisis une
 *  classe » l'enverrait faire un geste qui ne débloquerait rien.
 *
 *  ⚠️ ET LE RELEVÉ DE LA PILE EST SOUPÇONNÉ AVANT D'ACCUSER — une pile VIDE
 *  rend `null` elle aussi (`tests/universe-step.test.mjs`, A2 : « aucune
 *  couche déclarée »), et pourtant elle n'empêche RIEN : `rebuild` adopte
 *  alors la pile montée sans un mot (block.mjs, « un document dont
 *  `build.layers` est VIDE n'a jamais été construit »). Accuser la pile là
 *  serait accuser un innocent, et le joueur irait basculer un interrupteur
 *  qui ne changerait pas son problème. On n'accuse donc que ce qui est
 *  DÉCLARÉ et faux, jamais ce qui est absent.
 *
 *  📌 CE QUE CETTE FONCTION NE PROMET PAS, dit plutôt que masqué :
 *  `currentStack` compare la pile DÉCLARÉE aux deux piles NOMMÉES, tandis que
 *  `rebuild` compare la pile déclarée à la pile MONTÉE — deux lectures
 *  voisines, pas identiques. Elles coïncident tant que la page ne monte que
 *  l'une des deux piles nommées (`engine.mjs`, et le garde 3 de
 *  `tests/fiche-360.test.mjs` tient les deux listes ensemble). Le jour où une
 *  troisième composition se monte, c'est ce garde-là qui rougit en premier.
 *
 *  @param {object} doc le document `fh-char/1` vivant
 *  @returns {string} la phrase à poser dans l'écran
 */
export function motDeLEcranMort(doc) {
  const layers = (doc && doc.build && Array.isArray(doc.build.layers)) ? doc.build.layers : [];
  /* ⭐ LOT 188 — `currentStack` accuse tout ce qui n'est pas l'une des deux
     piles entières ; `compositionFh` ne retient l'accusation que si aucun
     interrupteur ne peut produire cette composition. Les deux se lisent
     ensemble : une pile nommée est toujours légitime (garde dans
     `tests/ecran-layers.test.mjs`), l'inverse n'est plus vrai. */
  if (layers.length > 0 && currentStack(doc) === null && !compositionFh(doc).legitime) return MOT_PILE_INCONNUE;
  /* 🌱 LOT 198 — la tête, puis LE MÊME manque que celui qu'un chapitre vivant
     nomme (`motDuManque`) : un seul écrivain de la cause et de la sortie. */
  const manque = motDuManque(doc);
  return manque === null ? MOT_SANS_RAISON : TETE + manque;
}
