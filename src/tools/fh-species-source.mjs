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
   · Elle ne touche pas `data.description`. C'est la prose SRD, qui redit les
     traits en toutes lettres ; la corriger serait la RECOPIER. FH rend ses
     fiches depuis `traits`/`fh_traits`. ⚠️ Conséquence assumée et signalée à
     l'architecte : la description du Hoddon dit encore « As a Gnome », celle
     de l'Elfe dit encore « Perception ». Question Q15-4.
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

/* ── LES POINTS DE COMPÉTENCE — LA VERSION VRAIE ─────────────────────
   ⚠️ Les chapitres 2 et 4 se CONTREDISAIENT. Eric a tranché le 2026-08-08 :

     · Human — « Educated » : +2 à la création, ET C'EST TOUT.
     · Araag et Elestu — « Fast Learner » : +2 aux niveaux 1, 3 et 6.
     · toutes les autres : 0.

   Deux passages du chapitre restent donc périmés et sont IGNORÉS ici :
   « Fast Learner — +2 skill points at levels 3 and 6 » (il manque le niveau 1)
   et le tableau des *species bumps* du chapitre 4 (il donnait les bumps à
   « Araag, Human » et zéro à l'Elestu). */

const EDUCATED = { trait: "educated", by_level: { 1: 2 } };
const FAST_LEARNER = { trait: "fast-learner", by_level: { 1: 2, 3: 2, 6: 2 } };

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

const EDUCATED_TRAIT = {
  id: "educated",
  name: "Educated",
  text: "You gain 2 skill points at character creation."
};

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
    lift: { from: "human", fields: ["creature_type", "speed", "speed_ft", "granted_skill_choice"] },
    size: "Medium",
    size_key: "medium",
    senses: { from: "elf" },
    traits: [
      { lift: { from: "human", trait: "skillful" } },
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
    target: srdSpeciesId("dragonborn")
  },

  {
    fhName: "Dwarf",
    op: "patch",
    target: srdSpeciesId("dwarf")
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
    grantedSkillChoice: { count: 1, from: KEEN_SENSES_SKILLS },
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
    fhTraits: [SPLINTER_OF_ANON],
    destinyBaseBonus: { value: 2, trait: SPLINTER_OF_ANON.id }
  },

  {
    fhName: "Goliath",
    op: "patch",
    target: srdSpeciesId("goliath")
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
    }
  },

  {
    fhName: "Human",
    op: "patch",
    target: srdSpeciesId("human"),
    fhTraits: [EDUCATED_TRAIT, TWICE_BORN],
    skillPoints: EDUCATED
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
    target: srdSpeciesId("orc")
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
