/* ══ LA COUCHE FH — ESPÈCES : LE CANON D'ERIC, DÉCLARÉ ═════════════════
   Lot 15-couche-fh-especes. Premier contenu maison du dépôt : jusqu'ici tout
   était de l'infrastructure.

   CE FICHIER EST LA SOURCE LISIBLE, pas la couche. Le générateur
   (`gen-fh-species-layer.mjs`) en tire `layers/fh-species-en.layer.json`.
   Deux fichiers plutôt qu'un parce qu'Eric doit pouvoir RELIRE ses règles sans
   traverser 1 500 lignes de JSON — et parce qu'un patch de couche s'écrit avec
   des chemins, ce qui est de la mécanique, pas du canon.

   ── LES SOURCES, ET LAQUELLE GAGNE ───────────────────────────────────
   1. `7.CLAUDE AND ERIC LOGBOOK/Chantier FH & FHPC/FHV2 - Couche FH.md` —
      les décisions qu'Eric a prises le 2026-08-08 en relisant ses chapitres.
      **Postérieur, validé phrase par phrase : il gagne.**
   2. `5.RPG/Fate's Hand/0. D&D 5+ Rules/2. Species Modifications/
      D&D 5+ Races & Species.md` — le chapitre. Il porte encore deux passages
      périmés que (1) corrige, et qui sont nommés ci-dessous.

   ── LA LOI DE LA COUCHE : ELLE NE PORTE QUE LA DIFFÉRENCE ────────────
   Le SRD est dessous. Quand le chapitre d'Eric écrit « Stonecunning —
   Tremorsense 60 ft, a few times per day », il RÉSUME une aptitude que le SRD
   porte déjà avec ses vrais nombres : la couche n'y touche pas. Une règle
   recopiée diverge un jour de son original.

   Conséquence visible ici : CINQ des douze espèces ne reçoivent qu'UNE ligne
   — leur Base de Destinée — et deux autres n'y ajoutent qu'un seul trait
   maison. C'est le signe que la couche fait son travail, pas qu'elle est
   incomplète.

   ── CE QUE LA COUCHE NE FAIT PAS, ET POURQUOI ────────────────────────
   · ⚠️ RÉVISION DU 2026-08-08 (lot 17). Elle touche MAINTENANT
     `data.description`, sur trois records — et pas en la recopiant. Voir
     « LES DESCRIPTIONS » plus bas : le prix est réel, l'architecte l'a dit à
     Eric et l'assume, et il est payé par une SUBSTITUTION DÉCLARÉE que le
     générateur recalcule à chaque exécution depuis le texte SRD courant.
   · Elle ne retire pas la compétence Perception (elle n'existe pas en FH,
     remplacée par Vigilance / Delve / Survival). Le SRD la porte aussi dans
     son glossaire et `resolved.senses` la transporte : ce n'est pas un
     `disable` de record, et ce n'est pas ce lot. Question Q15-3.
   · Elle ne renomme AUCUN id de trait. `gnomish-cunning` reste
     `gnomish-cunning` et s'appelle « Hoddon Cunning » : le moteur produit des
     identifiants, l'interface produit des mots (loi §0.13). Et
     techniquement : deux chemins de patch visant le même trait, dont l'un
     réécrirait son `id`, ne peuvent pas fonctionner ensemble — le second ne
     retrouverait plus l'élément (`paths.mjs`, sélection par identité). */

/* ── L'EN-TÊTE DE LA COUCHE ─────────────────────────────────────────── */

export const LAYER = {
  id: "fh-species-en",
  version: "0.1.0",
  name: "Fate's Hand — Species (EN)",
  lang: "en",

  /* LES DRAPEAUX. Un drapeau ALLUME un module moteur ; il n'a pas de valeur.
     Deux sont levés, et chacun se justifie par un contenu de CETTE couche :
     · `fh.destiny` — les douze espèces portent une Base de Destinée, et
       trois portent un pouvoir de Destinée. Sans le module, ces champs ne
       veulent rien dire.
     · `fh.chaos` — « Outlasting » (Halfelin) donne l'avantage aux jets de
       Chaos. Sans le module, le trait nomme une mécanique qui ne tourne pas,
       c'est-à-dire exactement la dégradation silencieuse que ce dépôt refuse.
     Les trois autres drapeaux FH (`fh.arcana`, `fh.exhaustion`,
     `fh.overreach`) ne sont PAS levés ici : aucun contenu de cette couche ne
     les appelle. Ils viendront avec le chapitre qui les porte. ⚠️ À ratifier
     (question Q15-2). */
  flags: ["fh.chaos", "fh.destiny"],

  /* AUCUN `ruleValues`, et ce n'est pas un oubli.
     · La Base de Destinée est PAR ESPÈCE : ce n'est pas un réglage global du
       moteur, c'est une donnée de record. Elle voyage donc dans `data`.
     · Et c'est mesuré : `createLayers({ruleValueKeys})` REFUSE toute couche
       portant des valeurs de règle tant que le moteur n'a pas déclaré ses
       clefs (stack.mjs). Le pont entre une clef pointée de couche et une clef
       de règle du moteur est ajourné, sciemment et daté
       (contracts/layers.md, arbitrage n°4). Une couche d'espèces qui
       exigerait ce pont ne se monterait nulle part aujourd'hui. */

  attribution: {
    license: "all-rights-reserved",
    text:
      "Original Fate's Hand content: all rights reserved. This layer modifies and extends " +
      "material from the System Reference Document 5.2.1 (“SRD 5.2.1”) by Wizards of the Coast LLC, " +
      "available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative " +
      "Commons Attribution 4.0 International License, available at " +
      "https://creativecommons.org/licenses/by/4.0/legalcode. Portions of the SRD material — " +
      "including the Elf, Human, Gnome and Orc species — have been modified for this work."
  },

  description:
    "The twelve playable species of Nymedes. Nine modify their SRD 5.2.1 counterparts; three " +
    "(Araag, Loroka, Elestu) are new. Every species carries a Destiny Base of 2; the Elf, the " +
    "Human and the Halfling each carry one additional Destiny power."
};

/** La couche SRD sous laquelle cette couche se monte. Le générateur y puise
 *  les traits que les espèces neuves partagent avec le SRD, et il REFUSE
 *  bruyamment de travailler sur une autre. */
export const SRD_LAYER_ID = "srd-5.2.1-en";

/** L'id d'un record d'espèce SRD, par son slug. */
export const srdSpeciesId = (slug) => `srd:species:en:${slug}`;

/* ── LA DESTINÉE ─────────────────────────────────────────────────────
   « Base » = ce que l'espèce ajoute au calcul du Score de Destinée.
   **Base 2 pour les douze** (FHV2 - Couche FH.md, « La Destinée — ce qui est
   tranché »). Le chapitre porte encore, dans ses encarts « ancienne version »,
   des Bases 1/3/4 : elles sont périmées.

   L'Elfe est le seul cas chiffré : « Splinter of Anon » monte la Base de +2,
   soit 4 à la création. La Base reste donc 2 dans le record et le bonus est
   porté à part, nommé par le trait qui le donne — sans quoi « Base 2 pour les
   douze » deviendrait faux dans les données mêmes qui prétendent le dire. */
export const DESTINY_BASE = 2;

/* ══ LA CONVERSION « PROFICIENCY BONUS » → L'ÉCHELLE ÉCRITE ═══════════════
   Eric, 2026-08-27/28 : *« certaines species donnent… c'est pas SRD, à
   corriger »* puis *« fais faire le boulot de prose par un agent »* et *« sur
   FH web modifie les species pour que ça s'adapte »*.
   ⛔ « Proficiency Bonus » n'existe pas en FH (les paliers Novice/Adept/
   Expert ne le remplacent PAS ici : un compteur d'utilisations n'est pas un
   palier de compétence). La conversion retenue — candidat A de la passe de
   prose, valeurs 5e EXACTES à tous les niveaux — écrit l'échelle en clair :
   2, puis +1 aux niveaux de personnage 5, 9, 13 et 17.
   ⏳ [À TRANCHER par Eric] : nommer un TERME FH pour cette échelle (écrit une
   fois au chapitre, cité partout) au lieu de la recopier — cinq copies
   peuvent dériver. La source du texte reste le chapitre du vault
   (D&D 5+ Races & Species.md), converti le même jour, même formulation.
   🔴 Le FRAGMENT est commun aux cinq traits (vérifié verbatim au layer) :
   un `find` qui casse au premier SRD reformulé est un garde, pas un bug. */
const PROF_USES = {
  find: "a number of times equal to your Proficiency Bonus, and you regain",
  put: "twice — plus one more use at character levels 5, 9, 13, and 17 — and you regain",
  why: "PROF n'existe pas en FH ; l'échelle écrite reproduit les valeurs 5e exactes (conversion 27/08, candidat A)"
};


/* ── LES POINTS DE COMPÉTENCE — LA VERSION VRAIE ─────────────────────
   ⚠️ Les chapitres 2 et 4 se CONTREDISAIENT. Eric a tranché le 2026-08-08 :

     · Human — +2 à la création, ET C'EST TOUT.
     · Araag et Elestu — « Fast Learner » : +2 aux niveaux 1, 3 et 6.
     · toutes les autres : 0.

   Deux passages du chapitre restent donc périmés et sont IGNORÉS ici :
   « Fast Learner — +2 skill points at levels 3 and 6 » (il manque le niveau 1)
   et le tableau des *species bumps* du chapitre 4 (il donnait les bumps à
   « Araag, Human » et zéro à l'Elestu).

   ══ 🔴 2026-08-17 — UN SEUL DON PAR ESPÈCE, ET C'EST LA FIN DE LA DÉRIVE ══
   Eric, en regardant le site : *« je vois skillful + fast learner »*, puis
   *« pourquoi pas juste se simplifier la vie : Fast Learner qui recouvre tout.
   Statué et corrigé partout. J'en ai plein le cul de voir cette règle pas
   figée remonter. »*

   ⛔ CE QUI CLOCHAIT, ET CE N'ÉTAIT PAS UN LIBELLÉ : **deux espèces portaient
   DEUX dons de compétence en même temps.**

     · Humain — `Skillful` (`granted_skill_choice`, une maîtrise pleine, donc
       2 points au coût plein) **ET** `Educated` (+2 points au niveau 1) ;
     · Araag  — le même `Skillful` hérité de l'Humain **ET** `Fast Learner`.

   Chacune recevait donc l'équivalent de **4 points au niveau 1** là où le
   chapitre en annonce 2. Ce n'était visible nulle part : les deux dons sont
   de FORMES différentes (un choix de maîtrise / un barème par niveau), donc
   aucun total ne les additionnait à l'écran.

   ⭐ LA RÈGLE, MAINTENANT UNIQUE — un don par espèce, nommé par son trait :

     · Humain            → `Skillful`     : +2 points au niveau 1
     · Araag et Elestu   → `Fast Learner` : +2 aux niveaux 1, 3 et 6
     · les neuf autres   → rien

   `Educated` DISPARAÎT, absorbé par `Skillful` — Eric, 2026-08-17 : *« skillful
   origine SRD écrase educated »*, puis, quand la question lui a été reposée sur
   le NOM à afficher : *« non, SRD de base si possible »*. Et `Skillful` disparaît
   de l'Araag, absorbé par `Fast Learner` (*« Fast Learner qui recouvre tout »*).
   ⭐ Aucun nom neuf n'a été inventé : les deux survivants sont ceux que le SRD
   portait déjà. On hérite plutôt qu'on invente.

   📏 POURQUOI CETTE LECTURE-LÀ ET PAS L'AUTRE, et c'est un chiffre qui tranche.
   L'autre consistait à retirer `Educated` en gardant la maîtrise SRD. Mesurée
   contre le garde « LIGNE ROUGE : Human et Araag 12 », elle donne **10** : la
   maîtrise de `Skillful` est NET-ZÉRO — elle ajoute 2 points au pool et les
   dépense aussitôt — donc elle ne remplace pas les +2 d'`Educated`. Elle CASSE
   la ligne rouge. La conversion en points la tient au chiffre près.

   ⛔ CE QU'ELLE COÛTE, ET IL FAUT LE DIRE : `granted_skill_choice` quitte les
   deux espèces qui le portaient, donc l'Humain et l'Araag n'ont plus de 2ᵉ
   palier de choix d'espèce — et l'état « choix imposé » de `species-step.mjs`
   n'a plus AUCUN utilisateur. Ce n'est pas un effet de bord caché : c'est le
   prix de la règle, il a été remonté à Eric avant d'être payé, et il l'a
   confirmée deux fois.

   🔴 ET C'EST GARDÉ, pas seulement écrit — `tests/fh-species.test.mjs` compte
   les dons LIBRES de chaque espèce et refuse le second. Cette règle est
   remontée assez souvent pour qu'un commentaire ne suffise pas. */

const SKILLFUL = { trait: "skillful", by_level: { 1: 2 } };
const FAST_LEARNER = { trait: "fast-learner", by_level: { 1: 2, 3: 2, 6: 2 } };

/* Le texte SRD de `Skillful` dit « proficiency in one skill of your choice ».
   Sous la règle générale de conversion des ADDENDUMS — *ce qui arrive au
   niveau 1 est converti en points du pool* — cette maîtrise VAUT 2 points, et
   c'est cette forme-là que Fate's Hand emploie partout ailleurs. Le trait
   garde son nom SRD et change de monnaie. */
const SKILLFUL_TEXT = "You gain 2 skill points at character creation.";

/* ── PERCEPTION N'EXISTE PAS DANS FATE'S HAND ────────────────────────
   Elle est remplacée par trois compétences : Vigilance (danger immédiat),
   Delve (bâti / urbain) et Survival (naturel). C'est pour ça que « Keen
   Senses » pointe vers ces trois-là — et cette forme vaut pour TOUTES les
   espèces FH qui portent le trait (Elfe, Elestu).

   ⚠️ Les deux compétences neuves n'existent pas encore : le chapitre des
   compétences est un lot d'après. Ces deux ids sont donc une AVANCE, et le
   lot des compétences doit les honorer tels quels sous peine de laisser deux
   références pendantes. Question Q15-3. */
export const KEEN_SENSES_SKILLS = [
  "srd:skill:en:survival",
  "fh:skill:en:delve",
  "fh:skill:en:vigilance"
];
export const KEEN_SENSES_TEXT = "You have proficiency in the Survival, Delve, or Vigilance skill.";

/* ── LOT 34 — KEEN SENSES EST UN BUDGET, PAS UN CHOIX ────────────────
   ⭐ Précision d'Eric (2026-08-09, redite en toutes lettres) : Keen Senses
   n'accorde PAS une maîtrise pleine au choix parmi les trois — ce sont
   **2 points à répartir** sur `KEEN_SENSES_SKILLS`, dépensables à ½ (1 pt)
   ou Plein (2 pts). Donc ½ sur deux des trois, OU Plein sur une seule.
   `granted_skill_budget = {points, from}` porte cette forme ; elle est
   distincte de `granted_skill_choice = {count, from}` (Araag, Human —
   Skillful, qui reste un choix plein et non restreint par palier). Voir
   `INVENTAIRE-LOT-34.md` pour l'arbitrage complet. */
export const KEEN_SENSES_BUDGET_POINTS = 2;

/* ── LES TROIS POUVOIRS DE DESTINÉE ──────────────────────────────────
   « chosen » est un terme GÉNÉRIQUE du chapitre (« ces peuples ont un pouvoir
   supplémentaire sur la Destinée »), pas un trait mécanique. Les trois noms
   ci-dessous sont RATIFIÉS PAR ERIC (2026-08-08) et sont désormais canoniques.
   Deux ont été récoltés dans sa propre prose, le troisième fabriqué — et
   « Patient Luck » a été écarté parce que le Halfelin porte DÉJÀ un trait
   nommé « Luck ». */

const SPLINTER_OF_ANON = {
  id: "splinter-of-anon",
  name: "Splinter of Anon",
  text: "Your Destiny Base increases by 2, for a Destiny Base of 4 at character creation."
};

const TWICE_BORN = {
  id: "twice-born",
  name: "Twice-Born",
  text: "You recover 2 Destiny Points on a Long Rest instead of 1."
};

const OUTLASTING = {
  id: "outlasting",
  name: "Outlasting",
  text: "You have Advantage on Chaos rolls."
};

/* ── LES TRAITS MAISON QUI NE SONT PAS DE LA DESTINÉE ────────────────
   Chacun est la phrase d'Eric, remise en vocabulaire SRD 2024 (Hit Points,
   Resistance, Necrotic — majuscules du SRD). Aucun n'ajoute d'effet que le
   chapitre n'écrit pas. */

/* ⛔ `EDUCATED_TRAIT` A ÉTÉ SUPPRIMÉ le 2026-08-17, pas désactivé. Il portait
   les +2 du Humain à côté de `Skillful`, qui les portait déjà sous une autre
   forme. Un trait gardé « au cas où » derrière un interrupteur est ce que ce
   dépôt refuse (loi §0.6) ; son texte survit dans `SKILLFUL_TEXT`, plus haut. */

const FAST_LEARNER_TRAIT = {
  id: "fast-learner",
  name: "Fast Learner",
  text: "You gain 2 skill points at levels 1, 3 and 6."
};

const SOULFORGED_AFFINITY = {
  id: "soulforged-affinity",
  name: "Soulforged Affinity",
  text: "You can Body Forge a Soulgem into your own flesh at no cost in Hit Points."
};

const NECROTIC_RESISTANCE = {
  id: "necrotic-resistance",
  name: "Necrotic Resistance",
  text: "You have Resistance to Necrotic damage."
};

/* ── LES DESCRIPTIONS — DÉCLARÉES, JAMAIS RECOPIÉES ──────────────────
   Lot 17, sur demande d'Eric du 2026-08-08.

   LE PROBLÈME QUE LE LOT 15 A NOMMÉ ET LAISSÉ OUVERT (Q15-4). Chaque record
   d'espèce SRD porte un blob `data.description` qui REDIT ses traits en
   toutes lettres. Le Hoddon dit donc encore « As a Gnome » et l'Elfe cite
   encore « Perception », alors que Fate's Hand a remplacé la Perception par
   Vigilance / Delve / Survival. Eric veut le texte corrigé.

   LE PRIX, DIT ET ASSUMÉ PAR L'ARCHITECTE : patcher `data.description`, c'est
   RECOPIER la prose du SRD avec quelques mots changés. Le jour où `fh-srd`
   retouche ce texte, une copie figée ne bouge pas — et personne ne le voit.

   D'OÙ LA FORME : ON NE RECOPIE PAS, ON DÉCLARE LA SUBSTITUTION.
   Ce fichier ne contient AUCUNE phrase du SRD. Il déclare, par record, ce
   qu'on cherche, ce qu'on pose à la place, et POURQUOI. Le générateur lit le
   texte SRD COURANT, applique les substitutions, et écrit le résultat.

   ET C'EST L'ALARME QUI FAIT TOUT LE TRAVAIL :
   · une substitution qui ne trouve pas sa cible fait JETER le générateur, en
     nommant le motif, le record, et la raison déclarée. Une dérive silencieuse
     devient un échec bruyant ;
   · `mustNotContain` est le second filet, et il attrape ce que le premier ne
     peut pas voir : si le SRD ajoute une PHRASE NEUVE qui dit « Gnome », tous
     les motifs déclarés trouvent encore leur cible — et le mot survit quand
     même. Le résultat est donc relu, et le mot interdit fait jeter.

   ⚠️ CE QUI N'ENTRE PAS DANS LA DESCRIPTION. Les traits FH (Educated,
   Twice-Born, Splinter of Anon, Outlasting) n'y sont PAS ajoutés : les
   écrire serait écrire de la prose à la main, ce que ce dispositif existe
   précisément pour interdire. FH rend ses fiches depuis `data.traits` +
   `data.fh_traits` ; `description` reste de la PROVENANCE.

   ✅ Q17-3 EST TRANCHÉE — Eric, 2026-08-20 : *« faut remplacer par Hoddon
   partout »*. Le texte du trait `gnomish-lineage` disait encore « Forest Gnome »
   et « Rock Gnome » ; il passe par `traitSubstitutions` (même dispositif, un
   cran plus bas). 🔴 ET LE RÉSIDU AVAIT ÉTÉ NOMMÉ ICI PENDANT DES SEMAINES —
   nommé en commentaire, donc invisible à la machine, donc jamais rougi. Une
   dette écrite dans une prose n'est pas une dette tenue. */

const HODDON_DESCRIPTION = {
  substitutions: [
    PROF_USES, /* la prose complète porte le même fragment que le trait — même conversion */
    { find: "As a Gnome", put: "As a Hoddon",
      why: "le Hoddon EST le Gnome, renommé (Eric, chapitre 2 : « Hoddon = Gnome, simple renommage »)" },
    { find: "Gnomish Cunning", put: "Hoddon Cunning",
      why: "la couche renomme déjà ce trait dans data.traits[gnomish-cunning].name ; la prose disait le contraire" },
    { find: "Gnomish Lineage", put: "Hoddon Lineage",
      why: "idem, data.traits[gnomish-lineage].name" },
    /* 🔴 « FOLK », PAS « HODDON » — corrigé le 2026-08-20. Ces deux lignes
       posaient « Forest Hoddon » et « Rock Hoddon », un nom que PERSONNE
       n'emploie : ni le livre d'Eric (`D&D 5+ Races & Species`, table des
       lignées hoddon), ni `LINEAGES.hoddon` deux cents lignes plus bas, qui
       disent tous deux **Forest Folk · Rock Folk · The Mole People**. C'était
       une substitution mécanique posée quand la décision n'était pas prise —
       elle a survécu à la décision, et le même record portait donc TROIS noms
       pour la même lignée : le bouton « Folk », le trait « Gnome », la
       description « Hoddon ».
       ⚠️ Et Eric a dit *« remplacer par Hoddon partout »* : c'est le GNOME
       qu'il chasse, et sa destination est déjà écrite dans son livre. Le
       manuscrit tranche, pas la dictée de mémoire. */
    { find: "Forest Gnome", put: "Forest Folk",
      why: "le nom de la lignée dans le livre d'Eric et dans LINEAGES.hoddon — une seule vérité" },
    { find: "Rock Gnome", put: "Rock Folk",
      why: "idem" }
  ],
  /* Les deux formes, parce que « Gnomish » ne contient pas « Gnome ». */
  mustNotContain: ["Gnome", "Gnomish"]
};

/* ── LE TEXTE DU TRAIT DE LIGNÉE, MÊME DISCIPLINE UN CRAN PLUS BAS ────
   Le paragraphe SRD du trait `gnomish-lineage` énumère ses deux sous-lignées
   en toutes lettres. On ne le recopie pas : on déclare, et le générateur
   recalcule depuis le texte SRD courant. */
/* le lignage du Hoddon porte AUSSI le fragment PROF commun (Speak with
   Animals « a number of times equal to… ») — la même échelle s'applique. */
const HODDON_LINEAGE_TRAIT = {
  substitutions: [
    PROF_USES,
    { find: "Forest Gnome", put: "Forest Folk",
      why: "le trait disait « Forest Gnome » pendant que le bouton du builder disait « Forest Folk » — " +
        "le joueur lisait un nom et cliquait sur un autre" },
    { find: "Rock Gnome", put: "Rock Folk", why: "idem" }
  ],
  mustNotContain: ["Gnome", "Gnomish"]
};

const ELF_DESCRIPTION = {
  substitutions: [
    { find: "Keen Senses. You have proficiency in the Insight, Perception, or Survival skill.",
      put: `Keen Senses. ${KEEN_SENSES_TEXT}`,
      why: "Perception n'existe pas dans Fate's Hand — elle est remplacée par Vigilance, Delve et " +
        "Survival, et la couche porte déjà cette forme dans data.traits[keen-senses].text" }
  ],
  mustNotContain: ["Perception"]
};

/* ⚠️ CELLE-CI N'EST PAS UNE CORRECTION DEMANDÉE : C'EST LA CONSÉQUENCE DU
   RETRAIT. Eric retire Resourceful à l'Humain ; la description SRD le décrit
   encore, phrase entière. La laisser ferait dire au record, dans le même
   souffle, qu'il n'a pas le trait et qu'il l'a. La contradiction serait CRÉÉE
   PAR CE LOT — c'est à lui de ne pas la livrer. La phrase entière part, saut
   de paragraphe compris, pour ne pas laisser un blanc double. Question Q17-2. */
const HUMAN_DESCRIPTION = {
  substitutions: [
    { find: "Resourceful. You gain Heroic Inspiration whenever you finish a Long Rest.\n\n", put: "",
      why: "l'Humain PERD Resourceful (Eric, 2026-08-08) — le trait est retiré de data.traits, " +
        "la prose qui le décrit ne peut pas rester" },
    /* La description est la SEULE copie du texte qu'un lecteur voit en entier.
       Laisser « proficiency in one skill » ici pendant que le trait dit « 2
       skill points » referait la divergence que ce fil répare — deux versions
       d'une règle dans le même record. */
    { find: "Skillful. You gain proficiency in one skill of your choice.",
      put: `Skillful. ${SKILLFUL_TEXT}`,
      why: "Skillful passe de la maîtrise aux points (Eric, 2026-08-17) — il absorbe " +
        "Educated, qui disparaît ; la prose doit dire la même chose que le trait" }
  ],
  mustNotContain: ["Resourceful", "proficiency in one skill"]
};

/* ── LES DOUZE ESPÈCES ───────────────────────────────────────────────
   Ordre du chapitre d'Eric (alphabétique). Les Eluzi n'y sont PAS : ils ne
   sont pas une espèce de départ, on y arrive en jeu.

   `patch` : le record SRD est dessous, on ne pose que la différence.
   `add`   : aucun record dessous, le record se tient tout seul.

   Décision d'architecte D2, prise : Araag, Loroka et Elestu sont des espèces
   à PART ENTIÈRE — on ne reporte pas la commodité D&D Beyond « construit sur
   X ». Le Hoddon est le cas à part : c'est le Gnome, RENOMMÉ, donc un patch.

   ⚠️ Ce que `lift` veut dire, et pourquoi il existe. Une espèce neuve partage
   des traits avec le SRD (l'Elestu a Fey Ancestry et Trance, le Loroka a
   Relentless Endurance). Les recopier ici les ferait diverger du SRD le jour
   où il bouge. Le générateur va donc les PRENDRE dans la couche SRD, à la
   génération, et il JETTE en nommant le trait s'il ne l'y trouve pas. */

/* ══ LES LIGNAGES QUE LE SRD N'A PAS ════════════════════════════════════════
   Cinq espèces portent un second choix DANS l'espèce. Le SRD en monte DEUX
   tout seul — `data.lineages` de l'Elfe et du Tiefling, trois options
   chacune, `{ id, name, levels }`. Trois lui manquent : le Dragonborn, le
   Goliath et le Hoddon décrivent leur choix en prose dans un trait, mais
   n'offrent aucune donnée pour l'INSCRIRE. Cette table comble ce trou, et
   rien d'autre.

   ⭐ POURQUOI CE N'EST PAS UN CHAMP NEUF. Un premier jet inventait
   `lineage_choice` et le posait sur les cinq. C'était fabriquer un second
   écrivain pour une question qui en avait déjà un : deux champs, deux
   lecteurs, et l'Elfe aurait porté ses lignages DEUX FOIS — une divergence
   programmée. On reprend donc le nom et la forme du SRD, `data.lineages`, et
   un seul lecteur sert les cinq espèces.

   ⛔ ET L'ELFE ET LE TIEFLING NE SONT PAS ICI. Leurs lignages sont déjà
   montés par le SRD, et j'ai comparé règle par règle avec le chapitre du
   vault (2026-08-18) : identiques au mot d'esprit près — le chapitre resserre
   la plume, il ne change aucune règle. Une différence de plume ne se patche
   pas. Le jour où Eric change une RÈGLE de lignage elfique dans le chapitre,
   elle entre ici, et pas avant.

   ── LA FORME ────────────────────────────────────────────────────────────
   Celle du SRD : `{ id, name, levels: { "1": …, "3": …, "5": … } }`.
   Le Goliath et le Hoddon n'ont qu'un palier — `levels: { "1": … }` — et
   c'est vrai : le don est acquis au niveau 1, il ne progresse pas.
   ⚠️ LE DRAGONBORN EST LA SEULE EXCEPTION, et sa table la force : choisir
   « Black » ne donne aucun texte de bénéfice, ça donne un TYPE DE DÉGÂTS que
   les traits Breath Weapon et Damage Resistance vont lire. Il porte donc
   `damage` et pas `levels` — écrire `levels: { "1": "Acid" }` serait annoncer
   un bénéfice de niveau 1 qui n'existe pas.

   ⛔ CES VALEURS NE SE CORRIGENT PAS ICI. Leur source est le chapitre du
   vault publié par le site — `0. D&D 5+ Rules/2. Species Modifications/
   D&D 5+ Races & Species.md`. Une règle se corrige DANS le chapitre. */
export const LINEAGES = {
  dragonborn: [
    { id: "black",  name: "Black",  damage: "Acid" },
    { id: "blue",   name: "Blue",   damage: "Lightning" },
    { id: "brass",  name: "Brass",  damage: "Fire" },
    { id: "bronze", name: "Bronze", damage: "Lightning" },
    { id: "copper", name: "Copper", damage: "Acid" },
    { id: "gold",   name: "Gold",   damage: "Fire" },
    { id: "green",  name: "Green",  damage: "Poison" },
    { id: "red",    name: "Red",    damage: "Fire" },
    { id: "silver", name: "Silver", damage: "Cold" },
    { id: "white",  name: "White",  damage: "Cold" }
  ],

  goliath: [
    { id: "cloud", name: "Cloud's Jaunt", levels: {
      "1": "As a Bonus Action, you magically teleport up to 30 feet to an unoccupied space you can see." } },
    { id: "fire", name: "Fire's Burn", levels: {
      "1": "When you hit a target with an attack roll and deal damage to it, you can also deal 1d10 Fire damage to that target." } },
    { id: "frost", name: "Frost's Chill", levels: {
      "1": "When you hit a target with an attack roll and deal damage to it, you can also deal 1d6 Cold damage to that target and reduce its Speed by 10 feet until the start of your next turn." } },
    { id: "hill", name: "Hill's Tumble", levels: {
      "1": "When you hit a Large or smaller creature with an attack roll and deal damage to it, you can give that target the Prone condition." } },
    { id: "stone", name: "Stone's Endurance", levels: {
      "1": "When you take damage, you can take a Reaction to roll 1d12. Add your Constitution modifier to the number rolled and reduce the damage by that total." } },
    { id: "storm", name: "Storm's Thunder", levels: {
      "1": "When you take damage from a creature within 60 feet of you, you can take a Reaction to deal 1d8 Thunder damage to that creature." } }
  ],

  /* Le Hoddon est le gnome renommé (voir son entrée). Ses deux premières
     voies sont celles du gnome SRD ; la troisième — The Mole People — est une
     création Fate's Hand, marquée `(FH)` dans le chapitre et `fh: true` ici.
     C'est la seule option de tout ce fichier qui n'a pas d'équivalent SRD. */
  hoddon: [
    { id: "forest-folk", name: "Forest Folk", levels: {
      "1": "You know the Minor Illusion cantrip. You also always have the Speak with Animals spell prepared, and you can cast it without expending a spell slot twice — plus one more use at character levels 5, 9, 13, and 17 —, and you regain all expended uses when you finish a Long Rest." } },
    { id: "rock-folk", name: "Rock Folk", levels: {
      "1": "You know the Mending and Prestidigitation cantrips. In addition, you can spend 10 minutes creating a Tiny clockwork device (AC 5, 1 HP) that carries one Prestidigitation effect of your choice; you can have up to three such devices at a time." } },
    { id: "mole-people", name: "The Mole People", fh: true, levels: {
      "1": "The range of your Darkvision increases to 120 feet. You also gain Meticulous — you have Advantage on Investigation checks — and 1 skill point (Novice) in tinker's tools." } }
  ]
};

export const SPECIES = [
  {
    fhName: "Araag",
    op: "add",
    id: "fh:species:en:araag",
    slug: "araag",
    /* Taille et vitesse : le chapitre ne les écrit pas espèce par espèce, il
       écrit « every species keeps its standard speed ». Vitesse et type de
       créature sont donc PRIS chez l'Humain, la taille est déclarée Medium.
       ⚠️ La taille est la seule valeur de ce fichier qu'Eric n'a pas écrite —
       question Q15-1, corrigible en une ligne. */
    /* 🔴 `granted_skill_choice` ET `skillful` ONT QUITTÉ L'ARAAG le 2026-08-17.
       Il les héritait de l'Humain EN PLUS de son `Fast Learner`, donc deux dons
       de compétence pour une espèce qui n'en annonce qu'un — Eric l'a vu sur le
       site publié : *« je vois skillful + fast learner »*, puis *« Fast Learner
       qui recouvre tout »*. Le +2 du niveau 1 est déjà dans son barème ; le
       reprendre par `Skillful` le comptait deux fois. */
    lift: { from: "human", fields: ["creature_type", "speed", "speed_ft"] },
    size: "Medium",
    size_key: "medium",
    senses: { from: "elf" },
    traits: [
      { lift: { from: "elf", trait: "darkvision" } },
      FAST_LEARNER_TRAIT,
      NECROTIC_RESISTANCE,
      SOULFORGED_AFFINITY
    ],
    skillPoints: FAST_LEARNER
  },

  {
    fhName: "Dragonborn",
    op: "patch",
    target: srdSpeciesId("dragonborn"),
    traitSubstitutions: {
      "breath-weapon": { substitutions: [
        { find: "(DC 8 plus your Constitution modifier and Proficiency Bonus)",
          put: "(DC 8 plus your Constitution modifier, plus 2 — the bonus rises to 3 at character level 5, 4 at level 9, 5 at level 13, and 6 at level 17)",
          why: "même échelle que PROF_USES — le DC 5e est reproduit à l'unité près à tous les niveaux" },
        PROF_USES
      ] }
    }
  },

  {
    fhName: "Dwarf",
    op: "patch",
    target: srdSpeciesId("dwarf"),
    traitSubstitutions: { "stonecunning": { substitutions: [PROF_USES] } }
  },

  {
    fhName: "Elestu",
    op: "add",
    id: "fh:species:en:elestu",
    slug: "elestu",
    lift: { from: "elf", fields: ["creature_type", "speed", "speed_ft"] },
    size: "Medium",
    size_key: "medium",
    senses: { from: "elf" },
    grantedSkillBudget: { points: KEEN_SENSES_BUDGET_POINTS, from: KEEN_SENSES_SKILLS },
    traits: [
      { lift: { from: "elf", trait: "darkvision" } },
      { lift: { from: "elf", trait: "fey-ancestry" } },
      /* Keen Senses vient de l'Elfe, mais son TEXTE est la forme FH : c'est la
         seule différence, et elle est portée à un seul endroit. */
      { lift: { from: "elf", trait: "keen-senses" }, text: KEEN_SENSES_TEXT },
      { lift: { from: "elf", trait: "trance" } },
      FAST_LEARNER_TRAIT
    ],
    skillPoints: FAST_LEARNER
  },

  {
    fhName: "Elf",
    op: "patch",
    target: srdSpeciesId("elf"),
    keenSenses: true,
    description: ELF_DESCRIPTION,
    fhTraits: [SPLINTER_OF_ANON],
    destinyBaseBonus: { value: 2, trait: SPLINTER_OF_ANON.id }
  },

  {
    fhName: "Goliath",
    op: "patch",
    target: srdSpeciesId("goliath"),
    traitSubstitutions: { "giant-ancestry": { substitutions: [PROF_USES] } }
  },

  {
    fhName: "Halfling",
    op: "patch",
    target: srdSpeciesId("halfling"),
    fhTraits: [OUTLASTING]
  },

  {
    fhName: "Hoddon",
    op: "patch",
    target: srdSpeciesId("gnome"),
    /* Le Hoddon EST le Gnome, renommé (retcon validé par Eric : les Hoddon
       sont des gnomes, pas des halfelins). La mécanique ne bouge pas. */
    rename: {
      name: "Hoddon",
      slug: "hoddon",
      traits: {
        "gnomish-cunning": "Hoddon Cunning",
        "gnomish-lineage": "Hoddon Lineage"
      }
    },
    description: HODDON_DESCRIPTION,
    traitSubstitutions: { "gnomish-lineage": HODDON_LINEAGE_TRAIT }
  },

  {
    fhName: "Human",
    op: "patch",
    target: srdSpeciesId("human"),
    /* ⭐ LE RETRAIT, décidé par Eric le 2026-08-08 : « l'humain perd
       Resourceful, il a Educated à la place ». Le chapitre le disait déjà
       (« Resourceful (Heroic Inspiration on each long rest) — retiré ») et le
       lot 15 avait REFUSÉ de le faire, faute de moyen : un patch ne savait pas
       supprimer, et réécrire `data.traits` en entier aurait recopié le texte
       SRD de Skillful et Versatile. Le moyen existe depuis le lot 17
       (`opPatch.remove`), et il désigne le trait PAR SON IDENTITÉ. */
    removeTraits: ["resourceful"],
    /* ⛔ SUPPRIMÉ LE 2026-08-17 — le motif chiffré est remonté en tête de fichier.
       ANCIEN COMMENTAIRE, gardé pour le raisonnement :
       Eric : *« l'humain n'a que +2 au lvl 1 : donc Skillful origine SRD
       écrase Educated »*. Deux lectures, et elles ne donnent PAS le même
       total — mesuré contre le garde « LIGNE ROUGE : Human et Araag 12 » :

         a. retirer `Educated`, garder la maîtrise -> total **10**. La
            maîtrise de `Skillful` est NET-ZÉRO (elle ajoute 2 et les dépense
            aussitôt), elle ne remplace donc pas les +2 d'`Educated`. Cette
            lecture CASSE la ligne rouge.
         b. convertir `Skillful` en +2 points libres et retirer
            `granted_skill_choice` -> total **12**, ligne rouge tenue, phrase
            d'Eric tenue au chiffre près. ⛔ Mais elle retire à l'Humain son
            2ᵉ palier de choix d'espèce — et comme l'Araag vient de perdre le
            sien, l'état « choix imposé » de `species-step.mjs` n'aurait plus
            AUCUN utilisateur. C'est un changement de ce que le joueur peut
            faire, donc du PRODUIT, et la charte d'autonomie l'exclut.

       (b) est la bonne réponse mécanique ; Eric l'a confirmée deux fois. */
    removeFields: ["granted_skill_choice"],
    traitText: { skillful: SKILLFUL_TEXT },
    description: HUMAN_DESCRIPTION,
    fhTraits: [TWICE_BORN],
    skillPoints: SKILLFUL
  },

  {
    fhName: "Loroka",
    op: "add",
    id: "fh:species:en:loroka",
    slug: "loroka",
    lift: { from: "orc", fields: ["creature_type", "speed", "speed_ft"] },
    size: "Medium",
    size_key: "medium",
    senses: { from: "orc" },
    traits: [
      { lift: { from: "orc", trait: "darkvision" } },
      { lift: { from: "orc", trait: "relentless-endurance" } },
      { lift: { from: "human", trait: "versatile" } }
    ]
  },

  {
    fhName: "Orc",
    op: "patch",
    target: srdSpeciesId("orc"),
    traitSubstitutions: {
      "adrenaline-rush": { substitutions: [
        { find: "a number of Temporary Hit Points equal to your Proficiency Bonus",
          put: "2 Temporary Hit Points — 3 at character level 5, 4 at level 9, 5 at level 13, and 6 at level 17",
          why: "même échelle que PROF_USES, appliquée aux PV temporaires (valeurs 5e exactes)" },
        PROF_USES
      ] }
    }
  },

  {
    fhName: "Tiefling",
    op: "patch",
    target: srdSpeciesId("tiefling")
  }
];

/** Les douze noms, dans l'ordre du chapitre. Exporté pour que la suite
 *  d'acceptation les NOMME au lieu de les compter : un garde qui compte reste
 *  vert quand la pile rend douze mauvaises espèces. */
export const TWELVE_NAMES = SPECIES.map((entry) => entry.fhName);
