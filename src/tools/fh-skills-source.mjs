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

   ── CE QUI EST PARTI D'ICI AU LOT 184, ET POURQUOI ────────────────────
   🔴 Eric, 2026-09-08, en regardant cette couche : *« FH skills contient des
   feats, LOL »*. Elle portait TROIS interrupteurs de l'écran `Rules` en un
   seul : le pool de compétences, le catalogue des trainings, et l'origine
   Fate's Hand — don gratuit, langues et 50 GP compris. Deux sont sortis :

     `fh-trainings-source.mjs`    → les 13 trainings   (couche `fh-trainings-en`)
     `fh-inheritance-source.mjs`  → l'origine et les 4 extinctions
                                                       (couche `fh-inheritance-en`)

   Ce fichier-ci ne déclare plus que ce que son nom dit : les compétences, les
   outils, et le pool de points des douze classes.

   ── LA COUCHE NE RETRANCHE PLUS RIEN : ELLE RÉÉCRIT ───────────────────
   🔴 ERIC, 2026-09-09 : *« Eh bien au lieu de soustraire, réécrit. »*

   Cette couche ÉTEIGNAIT trois records du SRD pour poser à côté des records
   plus fins. Elle les RÉÉCRIT désormais en leur héritier — même id, nom neuf
   — et n'ajoute que les autres :

     COMPÉTENCES  18 SRD (dont 1 réécrite en Vigilance)  + 8 neuves  = 26
     OUTILS       25 SRD (dont 2 réécrits, Dés et Cordes) + 11 neufs = 36

   ⭐ CE QUE LA RÉÉCRITURE FAIT DISPARAÎTRE, ET C'EST LE LOT ENTIER. Un record
   éteint emporte avec lui toute référence qui le nomme, et la référence ne
   proteste pas : elle se tait. Mesuré le 2026-09-09 sur la pile montée —
   `srfh:shelving:en:gaming-set` et `srfh:shelving:en:musical-instrument`
   rangeaient deux outils que cette couche éteignait, donc deux rangements
   pointaient vers des records inexistants. Ce n'est pas un défaut d'affichage
   (ils étaient DÉJÀ invisibles, et comptés dans `introuvables`) : c'est une
   incohérence de DONNÉE. Un record qui SURVIT ne peut pas la produire.

   Les 17 compétences et 23 outils CONSERVÉS SANS CHANGEMENT n'apparaissent
   PAS ici. Une couche ne porte que ses deltas : recopier un record SRD pour
   le laisser identique, ce serait le figer contre une correction future de
   `fh-srd`.

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

/* ══ LA COMPÉTENCE QUI EST RÉÉCRITE ════════════════════════════════════
   Le chapitre scinde Perception en Vigilance, Delve et Hunting (Survival
   existait déjà). Jusqu'au 2026-09-09 les TROIS étaient des records neufs et
   Perception s'éteignait ; désormais l'un des trois HÉRITE du record du SRD.

   ⭐ ET L'HÉRITIER EST TRANCHÉ PAR ERIC, PAS DÉDUIT. Question posée le
   2026-09-09 — *« Qui hérite du record SRD réécrit, dans les trois cas ? »* —
   réponse : *« Vigilance · Dés · Cordes »*. Ce n'est pas arbitrable par le
   code : les trois héritières sont également plausibles, et c'est justement
   pour ça que la réponse est gravée à côté de sa question.

   ⚠️ L'ID NE BOUGE PAS, ET C'EST TOUT L'INTÉRÊT. `srd:skill:en:perception`
   garde son identifiant et porte le nom « Vigilance ». Toute référence à cet
   id — les cinq listes de classe du SRD, le `granted_skill_choice` de l'Elfe —
   continue donc de se résoudre au lieu de tomber dans le vide.

   ⚠️ LE `slug` SUIT LE NOM, ET CE N'EST PAS COSMÉTIQUE. Le slug est la clef
   que le DOCUMENT d'un personnage écrit (`class.skills[0] = "investigation"`,
   `resolved.skills[].id`, voir `src/build/skills.mjs`). Laisser « perception »
   sur un record nommé Vigilance ferait imprimer `perception` sur la fiche d'un
   personnage Fate's Hand, et casserait tous les documents déjà enregistrés qui
   portent « vigilance ». C'est le seul champ, avec le nom, où l'héritage doit
   se voir.
   📏 ET LE PRÉCÉDENT EXISTAIT DÉJÀ, mesuré sur la pile complète le 2026-09-09 :
   `srd:species:en:gnome` y porte le slug `hoddon` depuis le lot 15 — la même
   réécriture, sur une espèce. Avant ce lot il était SEUL de son espèce (1 sur
   1 542 records portant un slug) ; après, ils sont quatre, sans une seule
   collision de slug dans aucun genre.

   ⚠️ CONSÉQUENCE CONNUE, ET ELLE N'EST PAS À MOI. Le SRD porte la Perception
   passive dans son glossaire, et `resolved.senses` la transporte
   (`senses[perception-passive]`, déjà déclarée « non dérivée » au contrat
   `build`). Renommer le record de compétence ne renomme pas cette ligne de
   sens. Le logbook la signale comme « conséquence technique à traiter par
   l'architecte » ; ce lot ne la traite pas et ne fait pas semblant. */
export const SKILLS_REWRITTEN = [
  {
    target: "srd:skill:en:perception",
    name: "Vigilance",
    slug: "vigilance",
    /* VÉRIFIÉE, JAMAIS PATCHÉE. L'héritière porte la caractéristique du record
       qu'elle réécrit ; le générateur le CONFRONTE au SRD et jette si les deux
       divergent — un héritier d'une autre caractéristique serait une décision
       qu'Eric n'a pas prise, pas un champ à corriger en passant. */
    ability: "wis",
    category: "exploration",
    exampleUses: "Immediate threat detection: spotting ambushes or fleeting danger.",
    reason: "Fate's Hand rewrites Perception as Vigilance (immediate threat detection) and adds two " +
      "more specialised skills next to it — Delve (built structures and ruins) and Hunting (tracking " +
      "and motionless camouflage). Survival already covered the wilderness."
  }
];

/* ══ LES HUIT COMPÉTENCES NEUVES ═══════════════════════════════════════
   ⛔ VIGILANCE N'EST PLUS ICI — 2026-09-09, et c'est le piège central du lot.
   Elle EST désormais `srd:skill:en:perception`, réécrit (voir juste au-dessus).
   La laisser aussi dans cette liste donnerait DEUX records pour la même
   compétence : le SRD réécrit ET l'ajout Fate's Hand. Un héritier n'existe
   qu'une fois — c'est le sens même du mot « réécrire ». Le générateur refuse
   la collision au lieu de la subir.

   Réparties 1 For · 3 Int · 2 Sag · 2 Cha. Avec les 18 conservées du SRD
   (Vigilance comprise, sous son id d'origine), le total tient : 26.

   ⚠️ LES RÉFÉRENCES QUE D'AUTRES COUCHES ONT PRISES NE PEUVENT PAS BOUGER.
   `layers/fh-species-en.layer.json` désigne le trio de Keen Senses dans le
   `granted_skill_budget` de l'Elfe et de l'Elestu. Le générateur lit cette
   liste LÀ OÙ ELLE VIT (`KEEN_SENSES_SKILLS`) et vérifie que cette couche-ci
   produit chacun de ses membres, au lieu d'en garder une recopie qui pourrait
   diverger en silence. */
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

/* ══ LES DEUX OUTILS GÉNÉRIQUES QUI SONT RÉÉCRITS ══════════════════════
   Le SRD porte un « Gaming Set » et un « Musical Instrument » uniques, dont
   la variété vit dans un champ de prose (`variants`). Fate's Hand en fait des
   records à part entière, parce qu'on ne peut pas être compétent « en jeux »
   : on l'est aux dés ou aux cartes.

   ⭐ CHACUN DES DEUX GÉNÉRIQUES DEVIENT L'UN DE SES HÉRITIERS — Eric,
   2026-09-09 : le jeu de DÉS et les CORDES. Les autres jeux et les autres
   familles d'instruments sont ajoutés à côté. Le générique ne subsiste donc
   PAS à côté de ses héritiers (ce qui doublerait chaque maîtrise) : il EST
   l'un d'eux.

   ⭐ ET C'EST CE QUI RÉPARE LES DEUX RANGEMENTS. `srfh-shelving-en` range ces
   deux ids ; tant qu'ils s'éteignaient, ses deux records pointaient vers des
   objets inexistants. Un rangement suit son objet — encore faut-il que
   l'objet soit là.

   ⛔ `variants` PART, ET C'EST UN RETRAIT, PAS UN OUBLI. La prose du SRD y
   énumère les quatre jeux et les dix instruments : sur un record qui s'appelle
   désormais « Dice Set », elle affirmerait qu'un jeu de dés se décline en
   cartes et en dragonchess. Le retrait vise un chemin qui doit EXISTER — le
   bloc `layers` refuse un retrait dans le vide (§L7.2) —, donc il tient aussi
   lieu de garde sur la forme du record SRD. */
export const TOOLS_REWRITTEN = [
  {
    target: "srd:tool:en:gaming-set",
    name: "Dice Set",
    slug: "gaming-set-dice",
    ability: "wis",
    reason: "Fate's Hand splits the generic Gaming Set into its four SRD variants, so that " +
      "proficiency names an actual game rather than a category. The SRD record itself becomes the " +
      "Dice Set; the other three are added alongside it."
  },
  {
    target: "srd:tool:en:musical-instrument",
    name: "Instrument (Strings)",
    slug: "instrument-strings",
    ability: "cha",
    reason: "Fate's Hand splits the generic Musical Instrument into three families (wind, strings, " +
      "other), so that proficiency names how the instrument is played. The SRD record itself becomes " +
      "the strings; the other two are added alongside it."
  }
];

/* ══ LES ONZE OUTILS QUI ENTRENT ═══════════════════════════════════════
   ⛔ LE JEU DE DÉS ET LES CORDES NE SONT PLUS ICI — 2026-09-09, même piège
   que Vigilance juste au-dessus : ils SONT les deux records SRD réécrits. Les
   déclarer aussi en ajout donnerait deux records pour le même outil, et le
   joueur choisirait deux fois les mêmes dés.

   Deux familles, et elles ne se financent pas de la même façon :

   · CINQ ÉCLATENT UN RECORD SRD (`inherits`). Leur `utilize` — et leur coût,
     et leur poids — sont LUS dans le record parent par le générateur, jamais
     recopiés ici. Ils gardent donc l'attribution CC-BY du SRD, parce que le
     texte qu'ils portent est celui du SRD.

     ⚠️ Les quatre jeux ne sont pas inventés : le SRD les nomme lui-même dans
     `variants` du Gaming Set — « Dice, dragonchess, playing cards,
     three-dragon ante ». Ce lot ne fait que leur donner un record chacun —
     trois par un `add`, le quatrième (les dés) en réécrivant le générique.

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
  /* ⛔ `gaming-set-dice` MANQUE ICI DÉLIBÉRÉMENT : c'est `srd:tool:en:gaming-set`
     réécrit (`TOOLS_REWRITTEN`). Le rajouter recréerait le doublon. */
  { slug: "gaming-set-cards", name: "Card Set", ability: "wis", inherits: "srd:tool:en:gaming-set" },
  { slug: "gaming-set-dragonchess", name: "Dragonchess Set", ability: "wis", inherits: "srd:tool:en:gaming-set" },
  { slug: "gaming-set-three-dragon", name: "Three-Dragon Ante", ability: "wis", inherits: "srd:tool:en:gaming-set" },

  /* ⛔ Et `instrument-strings` non plus : c'est `srd:tool:en:musical-instrument`
     réécrit. */
  { slug: "instrument-wind", name: "Instrument (Wind)", ability: "cha", inherits: "srd:tool:en:musical-instrument" },
  { slug: "instrument-other", name: "Instrument (Other)", ability: "cha", inherits: "srd:tool:en:musical-instrument" },

  /* 🔴 SOULFORGING N'EST PLUS ICI — lot 179, 2026-09-08. Il a été ajouté le
     2026-08-20 (il manquait depuis toujours : le livre d'Eric le porte dans
     `Skills & Tools`, table des outils, CHA, marqué ✦ « ajout Fate's Hand »,
     et le croisement livre → couche l'a sorti alors que le croisement
     couche → livre était vert 13 sur 13 — *un inventaire ne prouve rien s'il
     ne se lit que dans le sens où il a été écrit*).

     ⭐ IL VIT DÉSORMAIS DANS `layers/fh-soulforging-en.layer.json`, et ce
     déménagement est le lot entier : `Soulforge Crafting` est un chapitre
     d'Eric (3 636 mots, 100 % maison) qu'on doit pouvoir ÉTEINDRE. Tant que
     son outil était ici, éteindre le Soulforging éteignait AUSSI le pool de
     points de compétence des douze espèces. Un chapitre qu'on ne peut pas
     éteindre sans en éteindre un autre n'est pas un interrupteur.
     ⚠️ L'outil n'a pas quitté la PILE, seulement cette couche-ci : il est
     toujours interrogeable en `fh:tool:en:soulforging`. */

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

/* ══ LES TOTAUX ATTENDUS ═══════════════════════════════════════════════
   Déclarés ici pour que le générateur les CONFRONTE à ce qu'il a réellement
   produit, au lieu de les recompter à partir de ses propres listes — un
   compte tiré de la même source que ce qu'il compte ne prouve rien.

   ⚠️ ET UN COMPTE NE SUFFIT PAS. « 26 compétences » passerait avec 26
   mauvaises : la suite d'acceptation les nomme une par une. Ces nombres
   attrapent l'oubli, pas la substitution. */
export const EXPECTED = {
  skills: 26,
  /* 36 depuis le 2026-09-08 (lot 179) : `Soulforging` a quitté CETTE couche
     pour `fh-soulforging-en`, qui l'éteint d'un seul geste. Il était passé à
     37 le 2026-08-20 en arrivant, et ce compte-ci est ce qui avait rendu son
     arrivée bruyante — le générateur a REFUSÉ de produire une couche à 37
     outils tant que la source en annonçait 36. Un compte déclaré est un
     garde, pas une décoration : c'est le même garde qui, dans l'autre sens,
     refuse aujourd'hui une couche à 37 quand le Soulforging est parti.
     ⚠️ Ce 36 compte les outils de CETTE COUCHE, pas ceux de la pile — la
     pile en porte toujours 37, le trente-septième étant dans l'autre couche. */
  tools: 36,
  /* ⛔ NI `trainings` NI `backgrounds` DEPUIS LE LOT 184 : les treize trainings
     sont partis dans `fh-trainings-source.mjs`, les quatre extinctions et
     l'Inheritance dans `fh-inheritance-source.mjs`. Chaque compte vit avec la
     couche qu'il garde — un total déclaré ici pour une couche produite
     ailleurs serait un garde que rien ne rattache à ce qu'il compte. */
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
    "The twenty-six skills and thirty-six tools of Fate's Hand. Perception is rewritten as Vigilance " +
    "and joined by Delve and Hunting; eight skills are new. The generic Gaming Set is rewritten as " +
    "the Dice Set and the Musical Instrument as Instrument (Strings), each joined by its remaining " +
    "variants; three tools change their default ability, and vehicles and mounts are added for land, " +
    "water and air."
};
