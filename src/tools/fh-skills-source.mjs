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
     OUTILS       25 SRD − 2 retirés (générique) + 14 éclatés/neufs = 37

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
    category: "physical",
    exampleUses: "Raw power—lifting gates, pushing boulders, tearing down obstacles."
  },
  {
    slug: "appraise",
    name: "Appraise",
    ability: "int",
    category: "knowledge",
    exampleUses: "Determining the value, authenticity, or quality of items (treasure, art, goods)."
  },
  {
    slug: "academics",
    name: "Academics",
    ability: "int",
    category: "knowledge",
    exampleUses: "Formal learning: reading, research, and theoretical knowledge, accounting, " +
      "mathematics, commerce."
  },
  {
    slug: "tactics",
    name: "Tactics",
    ability: "int",
    category: "knowledge",
    exampleUses: "Battlefield strategy, military history, assessing enemy strength, planning maneuvers."
  },
  {
    slug: "hunting",
    name: "Hunting",
    ability: "wis",
    category: "exploration",
    exampleUses: "Tracking, skinning and butchering, and camouflage while motionless (hide or ambush)."
  },
  {
    slug: "vigilance",
    name: "Vigilance",
    ability: "wis",
    category: "exploration",
    exampleUses: "Immediate threat detection: spotting ambushes or fleeting danger."
  },
  {
    slug: "delve",
    name: "Delve",
    ability: "wis",
    category: "exploration",
    exampleUses: "Exploring urban areas, ruins and built structures, finding hidden passages and " +
      "traps, and navigating through them."
  },
  {
    slug: "streetwise",
    name: "Streetwise",
    ability: "cha",
    category: "social",
    exampleUses: "Urban survival, black markets, navigating the underworld."
  },
  {
    slug: "leadership",
    name: "Leadership",
    ability: "cha",
    category: "social",
    exampleUses: "Command presence, rallying allies, coordinating teams."
  }
];

/* ══ LE RANGEMENT DES COMPÉTENCES — QUATRE CATÉGORIES (lot 35) ═════════
   Addendums, « Le rangement des compétences — 5 catégories » (Eric,
   2026-08-12), précisé par la commande du lot 35 : la cinquième colonne de
   l'écran, *Tools & Trainings*, range un GENRE (`tool`, et plus tard
   `training`), pas une compétence — `category` sur un record de compétence
   n'en porte donc que QUATRE. Rangement seulement (loi §0.13, ce sont des
   identifiants, jamais des mots affichables) — aucun effet de règle : aucune
   catégorie ne change un coût, un palier ou un bonus.

   Classement proposé par l'architecte, VALIDÉ par Eric le 2026-08-12 : déduit
   du schéma de fiche d'Eric, où *Investigation* range sous *Exploration* et
   pas sous *Knowledge*. */
export const SKILL_CATEGORIES = ["knowledge", "social", "exploration", "physical"];

/** Les DIX-SEPT compétences CONSERVÉES du SRD — absentes de `skill{}` avant ce
 *  lot (une couche ne porte que ses deltas), elles reçoivent maintenant un
 *  `patch` ÉTROIT qui ne pose QUE `data.category`. Rien d'autre du record SRD
 *  n'est touché. */
export const SKILLS_KEPT_CATEGORIES = [
  { target: "srd:skill:en:arcana", category: "knowledge" },
  { target: "srd:skill:en:history", category: "knowledge" },
  { target: "srd:skill:en:medicine", category: "knowledge" },
  { target: "srd:skill:en:nature", category: "knowledge" },
  { target: "srd:skill:en:religion", category: "knowledge" },
  { target: "srd:skill:en:deception", category: "social" },
  { target: "srd:skill:en:insight", category: "social" },
  { target: "srd:skill:en:intimidation", category: "social" },
  { target: "srd:skill:en:performance", category: "social" },
  { target: "srd:skill:en:persuasion", category: "social" },
  { target: "srd:skill:en:animal-handling", category: "exploration" },
  { target: "srd:skill:en:investigation", category: "exploration" },
  { target: "srd:skill:en:survival", category: "exploration" },
  { target: "srd:skill:en:acrobatics", category: "physical" },
  { target: "srd:skill:en:athletics", category: "physical" },
  { target: "srd:skill:en:sleight-of-hand", category: "physical" },
  { target: "srd:skill:en:stealth", category: "physical" }
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
/* 🔴 LES NOMS SONT CEUX DU LIVRE, PAS CEUX QUE CE FICHIER TROUVAIT JOLIS —
   2026-08-20. Quatre outils portaient DEUX noms : la couche disait « String
   Instrument », le chapitre `Skills & Tools` d'Eric dit « Instrument (Strings) ».
   Un joueur qui choisissait l'un dans le builder et cherchait l'autre dans le
   livre s'en sortait par déduction — et c'est exactement ce qui rend une dérive
   DURABLE : assez proche pour que personne ne la signale.

   ⚠️ ET C'EST LE LIVRE QUI GAGNE, TOUJOURS, parce que le vault est le MANUSCRIT
   et cette couche un dérivé. Mesuré à la source : `Skills & Tools — Player
   Guide` (table des outils) et `Equipment` (§ des écarts) nomment les mêmes
   quatre, et les deux s'accordent — dont « Three-Dragon Ante » SANS « Set »,
   là où ses trois voisins le gardent. Ce « Set » de trop venait d'ici : le
   générateur l'avait ajouté aux quatre par régularité, et la régularité n'est
   pas une source. */
export const TOOLS_ADDED = [
  { slug: "gaming-set-dice", name: "Dice Set", ability: "wis", inherits: "srd:tool:en:gaming-set" },
  { slug: "gaming-set-cards", name: "Card Set", ability: "wis", inherits: "srd:tool:en:gaming-set" },
  { slug: "gaming-set-dragonchess", name: "Dragonchess Set", ability: "wis", inherits: "srd:tool:en:gaming-set" },
  { slug: "gaming-set-three-dragon", name: "Three-Dragon Ante", ability: "wis", inherits: "srd:tool:en:gaming-set" },

  { slug: "instrument-wind", name: "Instrument (Wind)", ability: "cha", inherits: "srd:tool:en:musical-instrument" },
  { slug: "instrument-strings", name: "Instrument (Strings)", ability: "cha", inherits: "srd:tool:en:musical-instrument" },
  { slug: "instrument-other", name: "Instrument (Other)", ability: "cha", inherits: "srd:tool:en:musical-instrument" },

  /* 🔴 SOULFORGING — MANQUANT DEPUIS TOUJOURS, trouvé le 2026-08-20 en lisant
     la table publiée par-dessus l'épaule d'Eric. Son livre le porte (`Skills &
     Tools`, table des outils, CHA, marqué ✦ « ajout Fate's Hand ») ; la couche
     ne l'avait jamais eu, et RIEN nulle part ne disait pourquoi.

     ⭐ C'EST LE CROISEMENT DANS L'AUTRE SENS QUI L'A SORTI. Le fil FH WEB avait
     vérifié que chaque outil de la couche est bien dans le livre — 13 sur 13,
     tout vert. Personne n'avait fait le trajet inverse. **Un inventaire ne
     prouve rien s'il ne se lit que dans le sens où il a été écrit.**
     ⚠️ Et c'est l'omission la plus lourde possible : `Soulforge Crafting` est
     l'un des plus gros chapitres du livre, 3 636 mots, 100 % d'Eric. */
  { slug: "soulforging", name: "Soulforging", ability: "cha", inherits: null },

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

   ── ⭐ LOT 82 — TROIS TOTAUX, ET LE `base` UNIQUE EST MORT ────────────
   Canon `5.RPG/Fate's Hand/0. D&D 5+ Rules/4. Skills/Skill & Tool Points —
   Canon (SRD to FH).md`, ratifié point par point par Eric le 2026-08-18.

   Le `base` unique disait UN nombre là où le canon en publie TROIS, et il
   forçait le moteur à en déduire les imposés par soustraction. Cette
   soustraction est ce qui a laissé six pools faux vivre des mois : personne
   ne pouvait lire, sur le record, ce que le joueur allait réellement dépenser.

     bound skill points · bound tool points · free point pool   (§B.0)

   ⛔ LE BOUND N'EST JAMAIS DANS LE POOL. Ce ne sont pas des réserves où le
   joueur pourrait puiser : ce sont des points DÉJÀ dépensés quand la feuille
   lui arrive. Le joueur ne manipule que le troisième.

   | classe                                    | bound sk | bound tool | free |
   |-------------------------------------------|----------|------------|------|
   | barb·cleric·fighter·paladin·sorc·warl·wiz  |    2     |     0      |  10  |
   | bard                                       |    3     |     2      |  12  |
   | druid                                      |    2     |     1      |  12  |
   | monk                                       |    2     |     0      |  10  |
   | ranger                                     |    3     |     0      |  12  |
   | rogue                                      |    6     |     1      |  14  |

   ── D'OÙ CHAQUE LIGNE SORT (canon §A.5, la recette est CONVERTIBLE) ───
   V = 2 × maîtrises + 2 × expertises · moitié bound, moitié free · puis
   +6 (arrière-plan) +2 (bonus FH), puis l'ajustement qu'Eric a posé À LA MAIN
   et qui est NOMMÉ — un nombre sans explication est celui qui pourrit :

     groupe 1 : 2 compétences → V=4 → 2/2 · free 2+6+2 = 10, aucun ajustement
     barde    : 3 comp. + 2 instruments (−1, « trois instruments abusé »)
                → V=10 → 5/5 · free 5+6+2 = 13, NERF BARDE −1 = 12
     druide   : 2 comp. + 1 outil → V=6 → 3/3 · free 3+6+2 = 11, BOOST +1 = 12
     moine    : même kit que le druide, mais son outil est « artisan OU
                instrument » — un choix qui couvre 80 % du catalogue ne LIE
                rien, donc son point part au pool : bound 2 et non 3. Le NERF
                MOINE −1 le reprend aussitôt : free 11 − 1 = 10
     rôdeur   : 3 comp. → V=6 → 3/3 · free 3+6+2 = 11, BOOST +1 = 12
     rogue    : 4 comp. + outil + 2 expertises. Une expertise n'est jamais
                autonome : elle s'empile sur un adepte. Deux de ses quatre
                novices bound se couplent donc aux expertises →
                2 novices (2) + 1 expert (4) = 6 bound sk, + 1 bound tool.
                free 7 + 6 + 2 − 1 (NERF ROGUE) = 14

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

   ⭐ LOT 82 — DEUX SOURCES, DEUX TABLES. Elles étaient additionnées dans un
   seul `by_level` ; le canon §B.1septies les tient séparées parce qu'elles ne
   se comptent pas sur le même niveau :
   · `by_level` — le +2 universel aux niveaux 4/8/12/16/20, sur le niveau DU
     PERSONNAGE ;
   · `by_class_level` — le +1 par niveau du BARDE depuis le 2 (il remplace
     *Jack of All Trades*, qui disparaît), sur ses niveaux DE BARDE.

   Le barde gagne donc toujours 3 au niveau 4 — mais en DEUX lignes, une par
   règle. Son cumul au niveau 8 : 12 + 7×(+1) + 2×(+2) = 23 free points.

   📌 RÈGLE D'ERIC, Q15-8 : ces paliers sont ceux que le personnage a
   TRAVERSÉS. Créé au niveau 5, il a ceux des niveaux ≤ 5 — pas celui du 6.
   La table le permet ; c'est la dérivation qui devra le respecter. */

const PALIERS_UNIVERSELS = [4, 8, 12, 16, 20];

/* ══ ⭐ LOT 82 — DEUX ÉCHELLES, ET ELLES NE SE FUSIONNENT PLUS ═════════
   Canon §B.1septies, tranché par Eric : *« +1 du barde juste pour les niveaux
   de barde »*.

   | gain | compté sur |
   |---|---|
   | **+2** aux niveaux 4·8·12·16·20 | le niveau **du PERSONNAGE** — une échelle pour tout le personnage |
   | **+1** depuis le niveau 2 (barde) | les niveaux **DE BARDE** seulement |

   🔴 LA COUCHE LES FUSIONNAIT, ET C'ÉTAIT FAUX DE QUATRE POINTS. Elle écrivait
   `bard: {"4": 3}` — silencieusement 1 (barde) + 2 (tout le monde) :

       bard    : {"2":1, "3":1, "4":3, "5":1, "6":1, "7":1, "8":3, …}
       fighter : {              "4":2,                    "8":2, …}

   > **Barde 4 / Guerrier 4**, personnage niveau 8 → vérité **+7**
   > (4 universels + 3 de barde). La table fusionnée lue au niveau 8 donne
   > **+11**. Quatre points de trop.

   ⏳ LE PLI NE DÉRIVE QU'UNE CLASSE AUJOURD'HUI (`takeRef("class")`), donc
   l'erreur est LATENTE : niveau de personnage et niveau de classe sont le même
   nombre, et la séparation est **à somme nulle pour tout personnage
   mono-classe**. C'est précisément pourquoi elle se fait MAINTENANT : séparer
   deux compteurs pendant qu'ils sont égaux ne coûte rien et ne peut rien
   casser ; le faire après avoir livré le multiclassage demanderait de
   démêler des personnages déjà enregistrés. */

/** `{niveau: gain}` compté sur le niveau du PERSONNAGE — identique aux douze. */
function echelleDePersonnage() {
  const byLevel = {};
  for (const niveau of PALIERS_UNIVERSELS) byLevel[String(niveau)] = 2;
  return byLevel;
}

/** `{niveau: gain}` compté sur les niveaux DANS CETTE CLASSE. Le barde seul en
 *  porte une : son +1 par niveau depuis le 2, qui remplace *Jack of All
 *  Trades* (le trait disparaît). Les onze autres rendent `{}` — une échelle
 *  vide est un FAIT, pas un trou. */
function echelleDeClasse({ bardePlusUnParNiveau = false } = {}) {
  const byLevel = {};
  if (!bardePlusUnParNiveau) return byLevel;
  for (let niveau = 2; niveau <= 20; niveau += 1) byLevel[String(niveau)] = 1;
  return byLevel;
}

/** Le niveau à partir duquel l'expertise s'achète, par défaut (canon §B.2).
 *
 *  ⚠️ CE N'EST PAS UNE CONSTANTE UNIQUE. `CLASS_POOLS` porte
 *  `expertiseFromLevel` PAR CLASSE ; celle-ci n'est que le DÉFAUT des neuf qui
 *  ne dérogent pas.
 *
 *  ⭐ LOT 82 — TROIS CLASSES DÉROGENT, PLUS UNE SEULE. Canon §B.1ter : un
 *  trait de classe qui accorde l'Expertise tend DEUX choses, et la seconde est
 *  cette permission d'acheter avant le niveau 4.
 *
 *    Rogue  · Expertise, niveau 1     → 1
 *    Bard   · Expertise, niveau 2     → 2
 *    Ranger · Deft Explorer, niveau 2 → 2
 *
 *  ⚠️ LE ROGUE N'EST PAS UNE ERREUR À CORRIGER. Son `1` a été signalé comme
 *  faux par deux contrôleurs sur cinq le 2026-08-18 ; c'est le canon qui se
 *  contredisait, et Eric a tranché pour le code. Son trait de niveau 1 EST sa
 *  permission. Ce qu'il n'a PAS, ce sont des free points en plus : ses deux
 *  expertises sont déjà payées dans son kit de niveau 1 (§A.5).
 *
 *  REWRITTEN 2026-09-06 (lot 169) — la phrase d'origine, « aucun plafond de
 *  compte n'existe pour personne : seul le niveau de déverrouillage change »,
 *  est devenue FAUSSE le jour où Eric a tranché Late Bloomer : *« deux
 *  expertises max au niveau 1 »*, et il l'a dit *« pour lui comme pour tout le
 *  monde »*. Le plafond existe désormais, il vaut 2, et il vit dans
 *  `EXPERTISE_CAP` ci-dessous. Ce qui reste vrai : au-delà du niveau qu'il
 *  borne, le pool est la seule économie qui arbitre. */
export const DEFAULT_EXPERTISE_FROM_LEVEL = 4;

/* ══ 🌱 LE PLAFOND D'EXPERTISES DU NIVEAU 1 — RÈGLE NEUVE DU 2026-09-06 ═══
   Eric, en tranchant Late Bloomer : *« deux expertises max au niveau 1 »*, et
   *« pour lui comme pour n'importe qui »*. Ce n'est donc PAS une clause de
   Late Bloomer : c'est un plafond absolu qui mord sur quiconque peut acheter
   l'expertise à ce niveau-là — le Rogue le premier, qui pouvait en acheter
   trois jusqu'à aujourd'hui si son pool suivait.

   ⛔ LES DEUX NOMBRES SONT DE LA DONNÉE, PAS DU MOTEUR. `through_level` est le
   niveau JUSQU'AUQUEL le plafond s'applique (1 : le niveau où les deux seules
   dérogations existent), `max` est le nombre d'expertises tolérées. Les écrire
   dans `skill-pool.mjs` referait la faute que `expertise_from_level` répare
   déjà — *« une valeur LUE, jamais figée »*.

   ⚠️ ET IL EST PORTÉ PAR CHAQUE RECORD DE CLASSE, comme `tier_costs` que les
   douze portent à l'identique : c'est là que vit la grammaire du pool, et le
   module ne lit de grammaire nulle part ailleurs. Une sous-classe ou une couche
   homebrew qui voudrait déroger n'a donc qu'un record à patcher. */
export const EXPERTISE_CAP = { through_level: 1, max: 2 };

/* ══ 🌱 LES GRANTS D'UN TRAIT — LE CANAL DE LATE BLOOMER ══════════════
   Canon §B.1ter appliqué à un trait plutôt qu'à une aptitude de classe. Un
   grant de trait a EXACTEMENT la forme d'un grant de classe (`{level, feature,
   points, boundSkill, boundSkillFrom, unlocksExpertise}`) plus une clef de
   plus, `trait`, qui NOMME le trait que le personnage doit porter pour que le
   grant s'ouvre.

   🔴 POURQUOI UNE LISTE À PART ET PAS UNE ENTRÉE DE `grants` : `grants` se dit
   « une entrée par APTITUDE DE CLASSE », et chacune est confrontée au SRD par
   le générateur (l'aptitude doit exister, au bon niveau). Late Bloomer n'est
   l'aptitude d'aucune classe — l'y glisser ferait rougir ce garde-là pour la
   mauvaise raison, ou l'obligerait à s'ouvrir une exception. Deux natures,
   deux listes.

   ⭐ LATE BLOOMER TEND LES DEUX CHOSES QUE LE CANON DÉCRIT : des points (2) ET
   la permission d'acheter l'expertise tôt (`unlocksExpertise`, au niveau 1).
   ⛔ ET LA PERMISSION N'EST PAS UN CADEAU : le joueur paie l'expertise au pool,
   au prix normal (Eric, 06/09 : *« le droit de l'acheter »*). Il peut dépenser
   ses deux points ailleurs et ne jamais en prendre. */
export const TRAIT_GRANTS = [
  /* 🔒 `maxExpertise: 1` — Eric, 2026-09-07 : *« les autres auront droit à UNE
     Expertise grâce à Late Bloomer »*. Le trait ouvre le verrou de classe avant
     l'heure, mais il ne l'ouvre que pour UNE ; le jour où la classe ouvre
     elle-même (`expertiseFromLevel`), c'est elle qui compte. Le Rogue, dont la
     classe ouvre au niveau 1, ne passe jamais par ce nombre. */
  { trait: "late-bloomer", feature: "Late Bloomer", level: 1, points: 2, unlocksExpertise: true, maxExpertise: 1 }
];

/* ══ LES TRAININGS — LE CATALOGUE, ENFIN REMPLI (lot 82) ══════════════
   Le genre `training` existe depuis le 2026-08-12 (genre 16 du schéma), sa
   mécanique est écrite et testée, et son catalogue est resté VIDE par
   arbitrage d'Eric (*« on ne s'y attelle pas pour le moment »*). Le canon des
   points §B.3 le remplit.

   ⛔ UN TRAINING N'A NI PALIER NI CARACTÉRISTIQUE. On le sait ou on ne le sait
   pas — c'est ce qui le distingue d'un outil, et c'est pourquoi il a son
   propre genre plutôt qu'un `tool` amputé. Son coût vit sur LE RECORD, jamais
   dans une table du moteur.

   ── LES DOUZE LANGUES ─────────────────────────────────────────────────
   Eric, 2026-08-18 : *« l'inventaire des langues c'est celui du SRD, jusqu'à
   ce qu'on décide autrement »*, puis, décidant autrement : *« Choix de 2
   langues. Araag, plus les langues du même nom que les species. Ce seront des
   langues Fate's Hand. »*

   ⚠️ ET C'EST BIEN UNE LISTE À ÉCRIRE, PAS UN INVENTAIRE À RECOPIER. Mesuré le
   2026-08-18 : **la couche SRD de ce dépôt ne porte AUCUN catalogue de
   langues** — ni entrée de glossaire, ni records ; `species[].data.languages`
   vaut `null` sur les douze, et le mot « langue » n'apparaît que dans le texte
   libre des blocs de monstres (« Deep Speech; telepathy 120 ft. »). Il n'y
   avait donc rien à reprendre du SRD, même en le voulant.

   ⭐ UNE LANGUE PORTE LE NOM DE SON PEUPLE, ET RIEN D'AUTRE. Pas d'*Elvish*,
   pas de *Dwarvish*, pas de *Draconic* — Fate's Hand laisse tomber les formes
   adjectivales du SRD. Un peuple, une langue, un nom. Les douze suivent donc
   EXACTEMENT les douze espèces jouables, et le générateur le VÉRIFIE contre la
   pile plutôt que de le croire : une espèce ajoutée sans sa langue ferait
   jeter.

   📌 Araag est la langue impériale. Elle n'est PAS automatique : le chapitre
   Inheritance donne deux langues **au choix**, sans plancher — l'ancienne
   règle donnait « Common plus une au choix », la neuve laisse choisir les
   deux. Rien ici ne l'impose, et c'est délibéré.

   ── CE QUI N'EST PAS ICI, ET POURQUOI ────────────────────────────────
   ⛔ **Les rituels sombres.** Le canon les annonçait trainings ; mesuré dans le
   chapitre qui les définit (`6. Spells & Magic/Dark Rituals.md`, dix rites
   tous chiffrés), un rite est gaté par le NIVEAU CUMULÉ de ses lanceurs et
   par leur classe de lanceur de sorts, et payé en points de Destinée et en
   dégâts nécrotiques. Nulle part il n'est dit qu'on APPREND un rituel. Un rite
   se pratique, il ne se connaît pas. Le canon est corrigé ; le catalogue ne
   les porte pas.
   ⏳ **Les armes exotiques** — annoncées trainings, pas encore à l'inventaire. */

/** Les douze espèces jouables, dans l'ordre alphabétique de leur langue. Le
 *  générateur CONFRONTE cette liste aux espèces réellement montées : c'est ce
 *  qui empêche une treizième espèce d'arriver muette. */
export const LANGUAGE_SPECIES = [
  "araag", "dragonborn", "dwarf", "elestu", "elf", "goliath",
  "halfling", "hoddon", "human", "loroka", "orc", "tiefling"
];

export const TRAININGS_ADDED = [
  ...LANGUAGE_SPECIES.map((slug) => ({
    slug: `language-${slug}`,
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    category: "language",
    cost: 1,
    description: `The tongue of the ${slug.charAt(0).toUpperCase() + slug.slice(1)} people. Two languages ` +
      "are granted by your Inheritance, at creation and at no cost; a further one is bought like any " +
      "other training."
  })),
  {
    slug: "garrot",
    name: "Garrot",
    category: "weapon",
    cost: 1,
    description: "A finesse cord used to strangle a surprised target. It deals no damage — only " +
      "exhaustion — and it is a training, not a tool: no tier, no ability behind it."
  }
];

/* ══ LES APTITUDES DE CLASSE QUI TENDENT DES POINTS (lot 82) ═══════════
   Canon §B.1ter, « Class features that grant Expertise → free points + a
   permission », ratifié par Eric le 2026-08-18 en deux passes — la seconde
   est le canon : *« il faut que ça soit des free points avec une autorisation
   à l'expertise »*.

   🔴 UNE APTITUDE QUI ACCORDE L'EXPERTISE TEND **DEUX** CHOSES, et aucune des
   deux n'est un placement :
     ① des **free points** — 1 expertise = 2 points (canon : *« une expertise
        = 2 free points oui, 2 expertises = 4 »*). Le SRD n'accorde jamais la
        maîtrise, seulement son DOUBLEMENT : en paliers FH, c'est adepte (2) →
        expert (4), donc le grant vaut exactement 2 ;
     ② le **droit de l'acheter avant le niveau 4**.

   ⛔ CE QUI INTERDIT DE LES FONDRE DANS `by_level`. Le barde gagne DEUX choses
   à son niveau 2 : le +1 de l'échelle, et cette aptitude. Les replier en un
   seul « +5 au niveau 2 » **perdrait la permission**, et la permission est la
   moitié de ce que l'aptitude est. Deux règles, deux entrées.

   ⭐ CE QUE LE JOUEUR Y GAGNE : un choix qu'il n'avait pas. Sous un placement
   accordé, l'aptitude décidait QUELLE compétence doublait. Sous points +
   permission, le barde peut acheter l'expertise que l'aptitude vise — ou
   dépenser ailleurs et rester adepte partout. L'aptitude cesse d'être une
   bifurcation et devient du carburant.

   ── LE ROGUE : LA PERMISSION SANS LES POINTS ──────────────────────────
   `points: 0` n'est pas un oubli, c'est le canon. Ses deux expertises sont
   DÉJÀ payées dans son kit de niveau 1 (§A.5, ses 6 points de bound skill =
   2 novices + 1 expert). Ce qu'il reçoit, c'est la permission — et elle
   arrive au niveau 1, ce qui ne se produit nulle part ailleurs.

   ── LE BARBARE : LA SEULE CROISSANCE DU BOUND APRÈS LE NIVEAU 1 ───────
   Canon §B.1quater, tranché par Eric : *« primal knowledge liste imposée =
   bound »*. Le trait NOMME une liste, donc il contraint, donc il est bound — et
   le niveau auquel il tombe n'y change rien.
   🔴 RÉVISION DU 2026-08-20 : la liste n'est plus « celle de la classe » mais
   **Survival · Hunting · Vigilance**, et les points passent de 1 à 2. Voir le
   commentaire de l'entrée elle-même, plus bas. C'est le contre-exemple qui a tué la phrase
   « le bound est distribué une fois, à la création », écrite deux fois dans
   le canon avant que le balayage ne la falsifie.

   ⚠️ ET UNE ABSENCE MESURÉE, QUI CONTREDIT LE CANON. Le canon range **Bard —
   Bonus Proficiencies (niveau 3, +6 points libres)** parmi les « class
   features ». Mesuré dans `layers/srd-5.2.1-en.layer.json` : ce n'est PAS une
   aptitude de classe, c'est une aptitude de **sous-classe** (College of Lore,
   `data.subclass.features`). La poser ici la donnerait à tout barde quelle que
   soit sa voie. Le SRD 5.2.1 ne livrant qu'UNE sous-classe par classe, le
   nombre serait juste aujourd'hui et faux à la première sous-classe ajoutée.
   ⛔ Elle n'est donc pas ici, et ce lot n'invente pas de mécanique de
   sous-classe : la question remonte à Eric. */
export const CLASS_GRANTS = [
  { target: "srd:class:en:rogue", feature: "Expertise", level: 1, points: 0, unlocksExpertise: true },
  { target: "srd:class:en:bard", feature: "Expertise", level: 2, points: 4, unlocksExpertise: true },
  { target: "srd:class:en:ranger", feature: "Deft Explorer", level: 2, points: 2, unlocksExpertise: true },
  { target: "srd:class:en:ranger", feature: "Expertise", level: 9, points: 4, unlocksExpertise: true },
  /* 🔴 PRIMAL KNOWLEDGE — RÈGLE RÉVISÉE PAR ERIC LE 2026-08-20, et il dit
     lui-même pourquoi : *« on avait statué il y a quelques jours : free points.
     Mais aujourd'hui, comme la mécanique de distribution de bound skill est
     rodée, c'est plutôt idem Keen Senses : répartition de 2 bound points dans
     Survival, Hunting, Vigilance (j'enlève la composante urbaine de Delve). »*

     ⭐ CE QUI A CHANGÉ N'EST PAS LA RÈGLE, C'EST CE QUE LA MACHINE SAIT DIRE.
     La bourse captive n'existait pas quand la première version a été tranchée ;
     elle existe maintenant (`budgetCaptifPlan`, généralisé à n'importe quelle
     racine le 2026-08-20), et la règle rejoint la forme qui l'exprime le mieux.

     ⚠️ ET LA LISTE N'EST PAS CELLE DE KEEN SENSES. L'Elfe a Survival · **Delve**
     · Vigilance ; le Barbare a Survival · **Hunting** · Vigilance. Eric écarte
     Delve pour sa composante urbaine — un savoir de fouille des villes n'est pas
     un savoir primal. Deux bourses de même FORME, de listes différentes : les
     recopier l'une sur l'autre serait la faute que ce commentaire prévient. */
  { target: "srd:class:en:barbarian", feature: "Primal Knowledge", level: 3, points: 0,
    boundSkill: 2, boundSkillFrom: ["survival", "hunting", "vigilance"] }
];

/** Le niveau où une classe ouvre l'achat d'expertise — DÉDUIT de ses grants,
 *  jamais écrit deux fois. La permission EST une propriété de l'aptitude qui
 *  la porte (canon §B.1ter) : la redéclarer à côté laisserait les deux
 *  diverger, et c'est précisément la faute que ce lot répare ailleurs. */
export function expertiseFromLevelOf(target) {
  const niveaux = CLASS_GRANTS
    .filter((grant) => grant.target === target && grant.unlocksExpertise)
    .map((grant) => grant.level);
  return niveaux.length > 0 ? Math.min(...niveaux) : DEFAULT_EXPERTISE_FROM_LEVEL;
}

export const CLASS_POOLS = [
  { target: "srd:class:en:barbarian", boundSkill: 2, boundTool: 0, free: 10 },
  { target: "srd:class:en:bard", boundSkill: 3, boundTool: 2, free: 12, bard: true },
  { target: "srd:class:en:cleric", boundSkill: 2, boundTool: 0, free: 10 },
  { target: "srd:class:en:druid", boundSkill: 2, boundTool: 1, free: 12 },
  { target: "srd:class:en:fighter", boundSkill: 2, boundTool: 0, free: 10 },
  { target: "srd:class:en:monk", boundSkill: 2, boundTool: 0, free: 10 },
  { target: "srd:class:en:paladin", boundSkill: 2, boundTool: 0, free: 10 },
  { target: "srd:class:en:ranger", boundSkill: 3, boundTool: 0, free: 12 },
  { target: "srd:class:en:rogue", boundSkill: 6, boundTool: 1, free: 14 },
  { target: "srd:class:en:sorcerer", boundSkill: 2, boundTool: 0, free: 10 },
  { target: "srd:class:en:warlock", boundSkill: 2, boundTool: 0, free: 10 },
  { target: "srd:class:en:wizard", boundSkill: 2, boundTool: 0, free: 10 }
].map((entry) => ({
  target: entry.target,
  boundSkill: entry.boundSkill,
  boundTool: entry.boundTool,
  free: entry.free,
  byLevel: echelleDePersonnage(),
  byClassLevel: echelleDeClasse({ bardePlusUnParNiveau: Boolean(entry.bard) }),
  grants: CLASS_GRANTS.filter((grant) => grant.target === entry.target)
    .map((grant) => ({
      level: grant.level,
      feature: grant.feature,
      points: grant.points,
      boundSkill: grant.boundSkill || 0,
      /* ⭐ LA LISTE VOYAGE AVEC LES POINTS — 2026-08-20. Le message qui publiait
         ce grant AFFIRMAIT déjà que « l'aptitude NOMME une liste » sans jamais
         la porter : une phrase juste, invérifiable, et que rien n'obligeait à
         rester vraie. Elle est désormais une donnée. */
      boundSkillFrom: Array.isArray(grant.boundSkillFrom) ? grant.boundSkillFrom.slice().sort() : [],
      unlocksExpertise: Boolean(grant.unlocksExpertise)
    }))
    .sort((a, b) => a.level - b.level),
  /* 🌱 LES GRANTS DE TRAIT — les mêmes pour les douze, comme `tier_costs`. Un
     trait n'appartient à aucune classe : c'est le personnage qui le porte, et
     c'est le DOCUMENT qui dit s'il le porte. */
  traitGrants: TRAIT_GRANTS.map((grant) => ({
    trait: grant.trait,
    level: grant.level,
    feature: grant.feature,
    points: grant.points,
    boundSkill: grant.boundSkill || 0,
    boundSkillFrom: Array.isArray(grant.boundSkillFrom) ? grant.boundSkillFrom.slice().sort() : [],
    unlocksExpertise: Boolean(grant.unlocksExpertise),
    maxExpertise: grant.maxExpertise
  })).sort((a, b) => (a.trait < b.trait ? -1 : a.trait > b.trait ? 1 : 0)),
  expertiseCap: { ...EXPERTISE_CAP },
  /* ⛔ PLUS ÉCRIT À LA MAIN — DÉDUIT du grant qui porte la permission. */
  expertiseFromLevel: expertiseFromLevelOf(entry.target)
}));

/* ══ CE QUE COÛTE UN PALIER DE COMPÉTENCE ══════════════════════════════
   Canon §A.1 et §B.2 — trois paliers, et pas un quatrième :

     novice 1 · adept 2 · expert 4

   (Les clefs portent encore les noms de moteur `half`/`proficient`/
   `expertise`. Le canon a rebaptisé les PALIERS ; le renommage traverse le
   schéma `fh-char/1` et les documents déjà enregistrés, il se fait donc dans
   sa propre passe, pas au milieu des nombres.)

   ⛔ `imposed` EST MORT (lot 82). Il chiffrait ce qu'un choix imposé
   DÉDUISAIT du pool — une soustraction que le canon supprime : les points
   imposés sont désormais publiés à part, en `bound_skill_points` et
   `bound_tool_points`, et ils n'ont jamais transité par le pool. Le garder
   laisserait dans chaque record un nombre que plus personne ne lit, et c'est
   exactement le genre de fantôme qui se fait relire trois mois plus tard.

   ⚠️ ILS NE SONT PAS PASSÉS EN `ruleValues` : le bloc `layers` REFUSE le
   montage d'une couche qui porte une valeur de règle que le moteur n'a pas
   déclaré savoir lire — et la correspondance entre une clef de couche et une
   clef de règle du moteur n'est écrite nulle part (question ouverte n°4 du
   bloc `layers`). Les mettre en `ruleValues` ferait jeter le montage, mesuré.
   Ils vivent dans le record de chaque classe, avec le pool qu'ils dépensent. */
export const TIER_COSTS = { novice: 1, adept: 2, expert: 4 };

/* ══ L'ARRIÈRE-PLAN — ÉTEINT EN FATE'S HAND (lot 35) ═══════════════════════
   Addendums §4, « L'arrière-plan n'existe plus en Fate's Hand » (Eric,
   2026-08-12). L'étape ne pose plus qu'un don d'origine et des bonus de
   caractéristiques — elle peut s'appeler Inheritance. Tout le reste du choix
   d'arrière-plan SRD s'éteint : plus de compétences imposées, plus d'outil
   imposé. `ability_keys` et `feat_id`/`feat_option` SURVIVENT intacts — c'est
   l'Inheritance, elle ne bouge pas.

   ⚠️ MESURÉ, PAS SUPPOSÉ (2026-08-12) : les QUATRE arrière-plans du SRD
   portent `data.skill_ids`. TROIS SEULEMENT portent `data.tool_id` — le
   Soldier CHOISIT le sien (`data.tool_choice`), il ne le REÇOIT pas.

   ⭐ CORRECTION DE L'ARCHITECTE, 2026-08-12 (après la fusion du lot 35). La
   commande du lot nommait `skill_ids` et `tool_id`, jamais `tool_choice` : le
   lot a donc laissé le `tool_choice` du Soldier intact, ET l'a signalé plutôt
   que d'élargir seul son périmètre — c'est le comportement attendu, la faute
   était dans la commande. Or la décision d'Eric est « éteindre TOUTE la partie
   choix d'arrière-plan », et un `tool_choice` EST un choix d'arrière-plan.
   Sans ce retrait, le Soldier resterait le SEUL arrière-plan à encore imposer
   quelque chose au joueur, ce qui contredit la règle. Éteint le 2026-08-12,
   sur confirmation d'Eric.

   Chaque champ est déclaré par entrée et VÉRIFIÉ DANS LES DEUX SENS : retirer
   un champ absent est un échec bruyant, et déclarer absent un champ que le SRD
   porte l'est aussi — sinon la déclaration cesse d'être mesurée sur la réalité
   de la couche SRD commitée. Même doctrine qu'`assertTargetField` pour les
   espèces (`gen-fh-species-layer.mjs`).

   ⭐ RÉVISÉ PAR LE LOT 43 (2026-08-13) — « éteint » n'était encore qu'un
   `patch` qui retirait deux ou trois champs (`skill_ids`, `tool_id` /
   `tool_choice`) : le record SURVIVAIT, choisissable, avec son `ability_keys`
   et son `feat_id` intacts. Addendums §4 (réécrit le 2026-08-13) : « IL N'Y A
   PLUS DE RECORD D'ARRIÈRE-PLAN DU TOUT ». Les quatre records SRD sont donc
   RETIRÉS de la pile (`op: "disable"`, le patron déjà en place pour Perception
   et le Gaming Set générique, `SKILLS_REMOVED` plus haut) — plus de `patch`
   étroit, plus de champ à énumérer par entrée : `hasToolId`/`hasToolChoice`
   disparaissent avec lui, ils n'avaient de sens que pour un retrait partiel. */
export const BACKGROUNDS_EXTINGUISHED = [
  {
    target: "srd:background:en:acolyte",
    reason: "Fate's Hand replaces Background entirely with a single step, Inheritance " +
      "(`fh:background:en:inheritance`): a free origin feat and 3 ability score points on any " +
      "abilities, addendums §4 (Eric, 2026-08-13). No background record is chosen anymore."
  },
  {
    target: "srd:background:en:criminal",
    reason: "Fate's Hand replaces Background entirely with a single step, Inheritance " +
      "(`fh:background:en:inheritance`): a free origin feat and 3 ability score points on any " +
      "abilities, addendums §4 (Eric, 2026-08-13). No background record is chosen anymore."
  },
  {
    target: "srd:background:en:sage",
    reason: "Fate's Hand replaces Background entirely with a single step, Inheritance " +
      "(`fh:background:en:inheritance`): a free origin feat and 3 ability score points on any " +
      "abilities, addendums §4 (Eric, 2026-08-13). No background record is chosen anymore."
  },
  {
    target: "srd:background:en:soldier",
    reason: "Fate's Hand replaces Background entirely with a single step, Inheritance " +
      "(`fh:background:en:inheritance`): a free origin feat and 3 ability score points on any " +
      "abilities, addendums §4 (Eric, 2026-08-13). No background record is chosen anymore."
  }
];

/* ══ L'INHERITANCE — LE RECORD NEUF QUI REMPLACE LES QUATRE ═══════════
   Lot 43. Un seul record de genre `background` (le genre reste du vocabulaire
   de moteur — l'écran, lui, dira « Inheritance »), livré par la couche, JAMAIS
   choisi parmi des alternatives : c'est le seul de son genre une fois les
   quatre du SRD éteints.

   ⛔ PAS D'`ability_keys` — l'absence est LA règle (contrat §1c, générique) :
   un record qui ne nomme pas ses clefs ne les restreint pas, donc les SIX
   caractéristiques sont proposées. ⛔ PAS de `feat_id` — à la place,
   `feat_choice: {from: "origin"}`, sur le patron maison de `skill_choice` /
   `granted_skill_choice` / `tool_choice` : le don d'origine est un choix
   libre parmi les records de genre `feat` dont `data.category` vaut
   `"origin"` (les quatre du SRD + `Auspicious (fh)`, patché §3b). */
export const BACKGROUND_INHERITANCE = {
  id: "fh:background:en:inheritance",
  name: "Inheritance",
  slug: "inheritance",
  description: "What you carry into adventure: a free origin feat of your choice, 3 ability " +
    "score points to distribute as +2/+1 or +1/+1/+1 on any abilities, and two languages of your " +
    "choice. Fate's Hand replaces the four SRD backgrounds with this single step " +
    "(addendums §4, Eric 2026-08-13).",
  /* ⭐ LES DEUX LANGUES, DÉCLARÉES — 2026-08-20 ═══════════════════════════
     🔴 ELLES EXISTAIENT DÉJÀ, MAIS EN PROSE SEULEMENT : chaque record de
     langue dit « Two languages are granted by your Inheritance, at creation
     and at no cost ». Un moteur ne lit pas une description — il ne pouvait ni
     les offrir, ni les compter, ni refuser la troisième. La règle était juste
     et INAPPLICABLE.

     ⚠️ ET C'EST L'HÉRITAGE QUI LES DONNE, PAS L'ESPÈCE. Le déménagement date
     du 18/08 et il est porté partout dans le livre (`Inheritance.md` §Languages,
     le bandeau de `Species.md`, le tableau de `Skills & Tools`). La
     formulation « chosen within your species » est celle d'AVANT — elle a
     resurgi deux fois depuis, et elle est fausse à chaque fois.

     ⛔ AUCUNE LISTE ICI : `from: "language"` désigne la CATÉGORIE, et le
     générateur la résout sur les trainings réellement produits. Recopier douze
     slugs en ferait une seconde liste, qui divergerait le jour où une
     treizième langue arrive — exactement ce que `LANGUAGE_SPECIES` empêche
     déjà pour les espèces. */
  languageGrant: { from: "language", count: 2, cost: 0 }
};

/* ══ LES TOTAUX ATTENDUS ═══════════════════════════════════════════════
   Déclarés ici pour que le générateur les CONFRONTE à ce qu'il a réellement
   produit, au lieu de les recompter à partir de ses propres listes — un
   compte tiré de la même source que ce qu'il compte ne prouve rien.

   ⚠️ ET UN COMPTE NE SUFFIT PAS. « 26 compétences » passerait avec 26
   mauvaises : la suite d'acceptation les nomme une par une. Ces nombres
   attrapent l'oubli, pas la substitution. */
export const EXPECTED = {
  skills: 26,
  /* 37 depuis le 2026-08-20 : `Soulforging` manquait, et ce compte-ci est ce
     qui a rendu son arrivée bruyante — le générateur a REFUSÉ de produire une
     couche à 37 outils tant que la source en annonçait 36. Un compte déclaré
     est un garde, pas une décoration. */
  tools: 37,
  /* ⛔ TREIZE : douze langues (une par espèce jouable) et le Garrot. Si ce
     nombre bouge sans qu'une règle bouge, quelqu'un a ajouté un training sans
     chapitre — et un training sans chapitre est un achat que le joueur ne peut
     lire nulle part. */
  trainings: 13,
  srdSkills: 18,
  srdTools: 25,
  /* ⛔ DOUZE. Si ce nombre devient 13, quelqu'un a fait entrer l'Artificier. */
  classes: 12,
  /* Les quatre arrière-plans du SRD 5.2.1 — mesuré (lot 35). */
  backgrounds: 4
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
