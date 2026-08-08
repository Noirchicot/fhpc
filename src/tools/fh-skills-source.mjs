/* ══ LE CANON DÉCLARÉ — CHAPITRE 4, COMPÉTENCES ET OUTILS ══════════════
   Lot 22-chapitre-4-competences.

   Ce fichier est la SOURCE, pas le générateur. Il ne lit rien, n'écrit rien
   et ne calcule rien : il déclare ce que le chapitre 4 de Fate's Hand dit, et
   `gen-fh-skills-layer.mjs` le confronte à la couche SRD commitée.

   ── D'OÙ VIENT CHAQUE LIGNE ───────────────────────────────────────────
   Canon : vault `5.RPG/Fate's Hand/0. D&D 5+ Rules/4. Skills/Skill chapters/
   D&G 5+ Revisited Skills.md`, §« A new list of 26 Skills » et §« Tools ».
   Décisions : logbook `FHV2 - Couche FH.md`, §« Chapitre 4 — Compétences ·
   décisions d'Eric du 2026-08-08 ».

   ⚠️ QUAND LES DEUX DIVERGENT, LA DÉCISION GAGNE — elle est postérieure, et
   Eric l'a prise en relisant son propre chapitre. Les divergences connues
   sont nommées à l'endroit où elles mordent, jamais corrigées en silence.

   ── LA COUCHE RETIRE AUTANT QU'ELLE AJOUTE ────────────────────────────
   C'est la propriété qui distingue ce lot d'un simple ajout de contenu, et
   c'est elle qui rend l'arithmétique vérifiable :

     COMPÉTENCES  18 SRD − 1 retirée (Perception) + 9 neuves        = 26
     OUTILS       25 SRD − 2 retirés (générique) + 13 éclatés/neufs = 36

   Les 17 compétences et 23 outils CONSERVÉS n'apparaissent PAS ici. Une
   couche ne porte que ses deltas : recopier un record SRD pour le laisser
   identique, ce serait le figer contre une correction future de `fh-srd`.

   ── CE QUE CE FICHIER N'ÉCRIT JAMAIS ──────────────────────────────────
   Aucune phrase du SRD n'est saisie à la main. Les sept outils qui ÉCLATENT
   un record SRD (les quatre jeux, les trois familles d'instruments) héritent
   son `utilize` — le générateur va le LIRE dans la couche commitée. Ce qui
   est déclaré ici en toutes lettres est du contenu Fate's Hand original. */

/* ══ LES SIX CARACTÉRISTIQUES, ET POURQUOI ELLES SONT ICI ══════════════
   Le nom affichable (`ability`) accompagne la clef (`ability_key`) dans tout
   record SRD de genre `skill` et `tool` — mesuré sur les 18 et les 25. La
   couche doit donc porter les deux, sous peine de rendre des records d'une
   forme différente de ceux qu'elle côtoie.

   ⚠️ Ce n'est PAS une violation de la loi §0.13. Cette table vit dans
   `src/tools/` — un générateur hors ligne, pas le moteur. `src/build/` reste
   vierge de tout nom de compétence et de caractéristique, et son garde de
   frontière le vérifie. */
export const ABILITY_NAMES = {
  str: "Strength",
  dex: "Dexterity",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma"
};

/* ══ LA COMPÉTENCE QUI S'EN VA ═════════════════════════════════════════
   Perception est RETIRÉE, pas remplacée : le chapitre la scinde en Vigilance,
   Delve et Hunting (Survival existait déjà). C'est un `disable`, pas un
   `patch` — le record SRD n'est pas modifié, et une pile qui retire la couche
   FH le retrouve intact.

   ⚠️ CONSÉQUENCE CONNUE, ET ELLE N'EST PAS À MOI. Le SRD porte la Perception
   passive dans son glossaire, et `resolved.senses` la transporte
   (`senses[perception-passive]`, déjà déclarée « non dérivée » au contrat
   `build`). Retirer le record de compétence ne retire pas cette ligne de
   sens. Le logbook la signale comme « conséquence technique à traiter par
   l'architecte » ; ce lot ne la traite pas et ne fait pas semblant. */
export const SKILLS_REMOVED = [
  {
    target: "srd:skill:en:perception",
    reason: "Fate's Hand replaces Perception with three specialised skills — Vigilance (immediate " +
      "threat detection), Delve (built structures and ruins) and Hunting (tracking and motionless " +
      "camouflage). Survival already covered the wilderness."
  }
];

/* ══ LES NEUF COMPÉTENCES NEUVES ═══════════════════════════════════════
   Réparties 1 For · 3 Int · 3 Sag · 2 Cha. Avec les 17 conservées
   (2 For + 3 Dex + 5 Int + 4 Sag + 4 Cha... voir le générateur, qui COMPTE
   au lieu de croire cette parenthèse), le total tient : 26.

   ⚠️ DEUX SLUGS SONT DÉJÀ ENGAGÉS AILLEURS ET NE PEUVENT PAS BOUGER.
   `layers/fh-species-en.layer.json` référence `fh:skill:en:delve` et
   `fh:skill:en:vigilance` dans le `granted_skill_choice` de l'Elestu — la
   couche des espèces a été écrite AVANT celle-ci et pointe vers des records
   que ce lot crée. Renommer l'un des deux casserait un `ref` déjà commité ;
   le générateur le vérifie au lieu de l'espérer. */
export const SKILLS_ADDED = [
  {
    slug: "might",
    name: "Might",
    ability: "str",
    exampleUses: "Raw power—lifting gates, pushing boulders, tearing down obstacles."
  },
  {
    slug: "appraise",
    name: "Appraise",
    ability: "int",
    exampleUses: "Determining the value, authenticity, or quality of items (treasure, art, goods)."
  },
  {
    slug: "academics",
    name: "Academics",
    ability: "int",
    exampleUses: "Formal learning: reading, research, and theoretical knowledge, accounting, " +
      "mathematics, commerce."
  },
  {
    slug: "tactics",
    name: "Tactics",
    ability: "int",
    exampleUses: "Battlefield strategy, military history, assessing enemy strength, planning maneuvers."
  },
  {
    slug: "hunting",
    name: "Hunting",
    ability: "wis",
    exampleUses: "Tracking, skinning and butchering, and camouflage while motionless (hide or ambush)."
  },
  {
    slug: "vigilance",
    name: "Vigilance",
    ability: "wis",
    exampleUses: "Immediate threat detection: spotting ambushes or fleeting danger."
  },
  {
    slug: "delve",
    name: "Delve",
    ability: "wis",
    exampleUses: "Exploring urban areas, ruins and built structures, finding hidden passages and " +
      "traps, and navigating through them."
  },
  {
    slug: "streetwise",
    name: "Streetwise",
    ability: "cha",
    exampleUses: "Urban survival, black markets, navigating the underworld."
  },
  {
    slug: "leadership",
    name: "Leadership",
    ability: "cha",
    exampleUses: "Command presence, rallying allies, coordinating teams."
  }
];

/* ══ LES OUTILS QUI CHANGENT DE CARACTÉRISTIQUE ════════════════════════
   Trois, et trois seulement — mesurés en confrontant la table §« Tools » du
   canon aux 25 records SRD, un par un. Ce sont des `patch`, la forme la plus
   étroite : le nom, le coût, le poids et l'usage du SRD restent intacts.

   ⚠️ Le canon donne à chaque outil UNE caractéristique par défaut (« tool =
   une seule ability, Carpenter = STR, Painter = WIS »). Les 20 autres outils
   conservés portent déjà la bonne au SRD : ils n'ont donc aucune entrée, et
   c'est le générateur qui le prouve en recomptant. */
export const TOOLS_RECHARACTERISED = [
  { target: "srd:tool:en:mason-s-tools", ability: "int", was: "str" },
  { target: "srd:tool:en:tinker-s-tools", ability: "int", was: "dex" },
  { target: "srd:tool:en:potter-s-tools", ability: "wis", was: "int" }
];

/* ══ LES DEUX OUTILS GÉNÉRIQUES QUI S'EN VONT ══════════════════════════
   Le SRD porte un « Gaming Set » et un « Musical Instrument » uniques, dont
   la variété vit dans un champ de prose (`variants`). Fate's Hand en fait des
   records à part entière, parce qu'on ne peut pas être compétent « en jeux »
   : on l'est aux dés ou aux cartes.

   Ils sont donc RETIRÉS, et leurs sept héritiers déclarés plus bas. Les
   laisser en place doublerait chaque proficiency : un personnage compétent au
   Dice Set le serait aussi au Gaming Set générique. */
export const TOOLS_REMOVED = [
  {
    target: "srd:tool:en:gaming-set",
    reason: "Fate's Hand splits the generic Gaming Set into its four SRD variants, so that " +
      "proficiency names an actual game rather than a category."
  },
  {
    target: "srd:tool:en:musical-instrument",
    reason: "Fate's Hand splits the generic Musical Instrument into three families (wind, strings, " +
      "other), so that proficiency names how the instrument is played."
  }
];

/* ══ LES TREIZE OUTILS QUI ENTRENT ═════════════════════════════════════
   Deux familles, et elles ne se financent pas de la même façon :

   · SEPT ÉCLATENT UN RECORD SRD (`inherits`). Leur `utilize` — et leur coût,
     et leur poids — sont LUS dans le record parent par le générateur, jamais
     recopiés ici. Ils gardent donc l'attribution CC-BY du SRD, parce que le
     texte qu'ils portent est celui du SRD.

     ⚠️ Les quatre jeux ne sont pas inventés : le SRD les nomme lui-même dans
     `variants` du Gaming Set — « Dice, dragonchess, playing cards,
     three-dragon ante ». Ce lot ne fait que leur donner un record chacun.

   · SIX SONT DU FATE'S HAND PUR (`inherits: null`) — les véhicules et les
     montures, éclatés en Terre / Eau / Air. Le SRD ne porte AUCUN outil de
     véhicule ni de monture (mesuré : les 25 records, aucun). Ils n'héritent
     donc de rien, portent l'attribution Fate's Hand, et n'ont pas de
     `utilize` : en inventer un serait écrire une règle que le canon ne donne
     pas.

   📌 Pourquoi Animal Handling ne suffit pas pour les montures : le canon le
   dit à la ligne d'Animal Handling — « Riding a mount is rolled under the
   Mount tool — Animal Handling only adds a synergy. » */
export const TOOLS_ADDED = [
  { slug: "gaming-set-dice", name: "Dice Set", ability: "wis", inherits: "srd:tool:en:gaming-set" },
  { slug: "gaming-set-cards", name: "Card Set", ability: "wis", inherits: "srd:tool:en:gaming-set" },
  { slug: "gaming-set-dragonchess", name: "Dragonchess Set", ability: "wis", inherits: "srd:tool:en:gaming-set" },
  { slug: "gaming-set-three-dragon", name: "Three-Dragon Ante Set", ability: "wis", inherits: "srd:tool:en:gaming-set" },

  { slug: "instrument-wind", name: "Wind Instrument", ability: "cha", inherits: "srd:tool:en:musical-instrument" },
  { slug: "instrument-strings", name: "String Instrument", ability: "cha", inherits: "srd:tool:en:musical-instrument" },
  { slug: "instrument-other", name: "Other Instrument", ability: "cha", inherits: "srd:tool:en:musical-instrument" },

  { slug: "vehicles-land", name: "Vehicles (Land)", ability: "dex", inherits: null },
  { slug: "vehicles-water", name: "Vehicles (Water)", ability: "dex", inherits: null },
  { slug: "vehicles-air", name: "Vehicles (Air)", ability: "int", inherits: null },

  { slug: "mount-land", name: "Mount (Land)", ability: "wis", inherits: null },
  { slug: "mount-water", name: "Mount (Water)", ability: "wis", inherits: null },
  { slug: "mount-air", name: "Mount (Air)", ability: "wis", inherits: null }
];

/* ══ LES POOLS DE POINTS — DU CONTENU, PAS UNE MÉCANIQUE ═══════════════
   Le nombre qu'une classe accorde est du CONTENU, au même titre que la Base
   de Destinée d'une espèce (`data.destiny.base`, lot 15) : c'est une donnée
   du chapitre, elle vit dans la couche, et le moteur la LIT. Loi §0.13 — le
   moteur ne connaît pas le mot « Rogue » ni le nombre 18.

   ⚠️ CE QUE CETTE TABLE NE FAIT PAS. Elle ne dérive rien : elle ne dit pas
   combien de points un personnage DONNÉ reçoit. Cette dérivation-là est
   suspendue (INVENTAIRE-LOT-22.md, question 1 — `build.budgets` n'a aucun
   chemin d'écriture), et poser la matière ne préjuge pas de sa destination.

   ── LES QUATRE POOLS DE NIVEAU 1, ARRIÈRE-PLAN INCLUS ─────────────────
   Rogue 18 · Bard 16 · Druid/Monk/Ranger 14 · toutes les autres 12.

   ⛔ DOUZE LIGNES, PAS TREIZE. Le tableau du chapitre en porte une
   quatorzième — l'Artificier — et elle ne peut pas exister ici : le SRD 5.2.1
   ne porte que 12 classes (mesuré), et l'Artificier appartient à du contenu
   WotC hors SRD. Le dépôt est public (loi §0.8). Il n'y a d'ailleurs rien à
   retirer : une couche ne peut pas désactiver un record qui n'a jamais
   existé, et un `patch` sur record absent est un échec bruyant.

   ── LA PROGRESSION EST ÉNUMÉRÉE, PAS CALCULÉE ─────────────────────────
   `by_level` donne le gain PALIER PAR PALIER, du niveau 2 au niveau 20. On
   n'écrit nulle part « +2 tous les 4 niveaux » : une cadence dans le code
   serait une règle de jeu dans le moteur, et le jour où Eric la change il
   faudrait recompiler au lieu de rééditer une couche.

   Deux sources se cumulent dans ces nombres, et le canon les tient séparées :
   · le +2 universel aux niveaux 4, 8, 12, 16 et 20 ;
   · le +1 par niveau du BARDE à partir du 2, qui remplace *Jack of All
     Trades* (le trait disparaît).

   Le barde reçoit donc 3 au niveau 4 (son +1 et le +2 universel). Vérifié
   contre le tableau du chapitre, qui écrit « +1+2(21) » à cette ligne, et
   dont le cumul au niveau 8 vaut 27 : 16 + 7×(+1) + 2×(+2) = 27.

   📌 RÈGLE D'ERIC, Q15-8 : ces paliers sont ceux que le personnage a
   TRAVERSÉS. Créé au niveau 5, il a ceux des niveaux ≤ 5 — pas celui du 6.
   La table le permet ; c'est la dérivation qui devra le respecter. */

const PALIERS_UNIVERSELS = [4, 8, 12, 16, 20];

/** `{niveau: gain}` pour une classe, du niveau 2 au niveau 20. */
function progression({ bardePlusUnParNiveau = false } = {}) {
  const byLevel = {};
  for (let niveau = 2; niveau <= 20; niveau += 1) {
    let gain = 0;
    if (PALIERS_UNIVERSELS.includes(niveau)) gain += 2;
    if (bardePlusUnParNiveau) gain += 1;
    if (gain > 0) byLevel[String(niveau)] = gain;
  }
  return byLevel;
}

export const CLASS_POOLS = [
  { target: "srd:class:en:barbarian", base: 12 },
  { target: "srd:class:en:bard", base: 16, bard: true },
  { target: "srd:class:en:cleric", base: 12 },
  { target: "srd:class:en:druid", base: 14 },
  { target: "srd:class:en:fighter", base: 12 },
  { target: "srd:class:en:monk", base: 14 },
  { target: "srd:class:en:paladin", base: 12 },
  { target: "srd:class:en:ranger", base: 14 },
  { target: "srd:class:en:rogue", base: 18 },
  { target: "srd:class:en:sorcerer", base: 12 },
  { target: "srd:class:en:warlock", base: 12 },
  { target: "srd:class:en:wizard", base: 12 }
].map((entry) => ({
  target: entry.target,
  base: entry.base,
  byLevel: progression({ bardePlusUnParNiveau: Boolean(entry.bard) })
}));

/* ══ CE QUE COÛTE UN PALIER DE COMPÉTENCE ══════════════════════════════
   Demi-compétence 1 · compétence pleine 2 · expertise 4 (achetable par tous à
   partir du niveau 4). Et la règle d'Eric du 2026-08-08 : un choix IMPOSÉ par
   la classe ou l'arrière-plan pose 1 point — une demi-compétence — et ce point
   se déduit du pool. « On n'est plus sous le joug de D&D Beyond. »

   ⚠️ POSÉS ICI, LUS PAR PERSONNE POUR L'INSTANT, et c'est délibéré. Ces coûts
   appartiennent à la dérivation suspendue. Ils ne sont PAS passés en
   `ruleValues` : le bloc `layers` REFUSE le montage d'une couche qui porte une
   valeur de règle que le moteur n'a pas déclaré savoir lire — et la
   correspondance entre une clef de couche et une clef de règle du moteur
   n'est écrite nulle part (question ouverte n°4 du bloc `layers`, que ce lot
   n'a pas le droit de trancher). Les mettre en `ruleValues` ferait donc jeter
   le montage, mesuré. Ils vivent dans le record de chaque classe, avec le
   pool qu'ils dépensent. */
export const TIER_COSTS = { half: 1, proficient: 2, expertise: 4, imposed: 1 };

/** Le niveau à partir duquel l'expertise s'achète, pour tous. */
export const EXPERTISE_FROM_LEVEL = 4;

/* ══ LES TOTAUX ATTENDUS ═══════════════════════════════════════════════
   Déclarés ici pour que le générateur les CONFRONTE à ce qu'il a réellement
   produit, au lieu de les recompter à partir de ses propres listes — un
   compte tiré de la même source que ce qu'il compte ne prouve rien.

   ⚠️ ET UN COMPTE NE SUFFIT PAS. « 26 compétences » passerait avec 26
   mauvaises : la suite d'acceptation les nomme une par une. Ces nombres
   attrapent l'oubli, pas la substitution. */
export const EXPECTED = {
  skills: 26,
  tools: 36,
  srdSkills: 18,
  srdTools: 25,
  /* ⛔ DOUZE. Si ce nombre devient 13, quelqu'un a fait entrer l'Artificier. */
  classes: 12
};

/* Le drapeau que cette couche lève. Il n'active aucun module dans ce lot —
   voir INVENTAIRE-LOT-22.md, question 1 : la destination du pool de points
   n'a pas de chemin d'écriture au contrat, et ce lot ne l'invente pas. */
export const FH_SKILLS_FLAG = "fh.skills";

export const LAYER = {
  schema: "fh-layer/1",
  id: "fh-skills-en",
  version: "0.1.0",
  name: "Fate's Hand — Skills & Tools (EN)",
  lang: "en",
  description:
    "The twenty-six skills and thirty-six tools of Fate's Hand. Perception is removed and split into " +
    "Vigilance, Delve and Hunting; nine skills are new. The generic Gaming Set and Musical Instrument " +
    "are split into seven named tools, three tools change their default ability, and vehicles and " +
    "mounts are added for land, water and air."
};
