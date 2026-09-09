/* ══ LE CANON DÉCLARÉ — L'INHERITANCE ══════════════════════════════════
   Lot 184-fh-skills-fendu-en-trois. Extrait de `fh-skills-source.mjs`, où
   l'origine de Fate's Hand vivait depuis le lot 43.

   🔴 POURQUOI ELLE EN SORT, ET C'EST L'ABSURDITÉ QU'ERIC A POINTÉE LE 08/09 :
   *« FH skills contient des feats, LOL »*. Une couche appelée « Skills &
   tools » portait le don d'origine gratuit (`feat_choice`), les deux langues
   (`granted_language_choice`) et les 50 GP de départ. `Inheritance` est l'un
   des SIX INTERRUPTEURS de l'écran `Rules` (ARCHITECTURE.md, « La coupe des
   couches ») : il doit pouvoir s'éteindre SEUL — et l'éteindre doit rendre
   au joueur les quatre arrière-plans du SRD, pas lui retirer ses compétences.

   Ce fichier est la SOURCE, pas le générateur. Il ne lit rien, n'écrit rien
   et ne calcule rien : `gen-fh-inheritance-layer.mjs` le confronte à la
   couche SRD commitée.

   ⚖️ LA DÉPENDANCE DICTÉE PAR ERIC LE 2026-09-08 : *l'Inheritance dépend des
   Trainings*. Les langues qu'elle offre SONT des trainings — sans la couche
   `fh-trainings-en`, l'Inheritance n'offre plus de langue. Le générateur
   résout sa liste sur les trainings que `gen-fh-trainings-layer.mjs` produit,
   jamais sur une seconde liste écrite ici. */

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
  languageGrant: { from: "language", count: 2, cost: 0 },
  /* ⭐ L'OR DE DÉPART, RENDU À LA DONNÉE — lot 182 (2026-09-09) ══════════
     🔴 CE CHAMP MANQUAIT, ET SON ABSENCE ÉTAIT TENUE À BOUT DE BRAS PAR L'ÉCRAN.
     Les QUATRE arrière-plans du SRD que l'Inheritance remplace portent chacun
     `data.equipment` — « Choose A or B: (A) … ; or (B) 50 GP » — et les quatre
     nomment le MÊME montant. En les éteignant (§4), l'Inheritance a emporté leur
     option A (le paquet : elle n'en donne aucun) mais aussi leur option B, l'or.
     ⛔ `ui/builder/equipment-step.mjs` la maintenait en vie avec un
     `INHERITED_PURSE_GP = 50` ÉCRIT EN DUR — un nombre de règle vivant dans un
     fichier d'écran, que rien ne pouvait confronter à une couche.

     ⚖️ LA RÈGLE, DICTÉE PAR ERIC LE 2026-09-09 : « le kit ou les 50 gp peut
     marcher pour SRD et FH », « fait idem SRD pour FH », « harmonise ça ».
     ⇒ CHAQUE SOURCE DE DÉPART OFFRE SON PAQUET OU SON OR, dans les deux piles.
     La classe porte le sien dans `data.starting_equipment` (75 · 90 · 110 · 155…,
     un montant PAR CLASSE) ; l'origine porte le sien ici.

     📌 LA FORME : une phrase, comme le SRD, LUE et jamais recalculée. Celle-ci
     ne porte qu'UNE option parce que l'Inheritance n'a pas de paquet à poser —
     ⛔ lui en écrire un serait inventer une règle que personne n'a tranchée. Le
     lecteur d'écran prend la DERNIÈRE option d'une phrase, et une phrase à une
     seule option est sa propre dernière option : un seul lecteur, deux piles.

     ⚠️ LE 50 N'EST PAS UN CHOIX DE FATE'S HAND, c'est celui du SRD, hérité des
     quatre records éteints. S'il doit devenir autre chose, c'est Eric qui le dit
     — et ce sera ICI, dans la source de la couche, jamais dans un écran. */
  equipment: "50 GP"
};

/* ⛔ LES QUATRE ARRIÈRE-PLANS DU SRD 5.2.1 — mesuré (lot 35). Déclaré ici pour
   que le générateur le CONFRONTE : un cinquième apparu dans une régénération
   de `fh-srd` n'aurait pas d'extinction déclarée, et resterait choisissable en
   silence — exactement l'arrière-plan que l'Inheritance devait remplacer. */
export const EXPECTED = {
  backgrounds: 4
};

/* Le drapeau que cette couche lève. Il n'allume aucun module : ce que cette
   couche fait, elle le fait par ses RECORDS — quatre extinctions et une
   addition. Le drapeau garde le module, la couche fait disparaître le
   contenu (ARCHITECTURE.md, « La coupe des couches »). */
export const FH_INHERITANCE_FLAG = "fh.inheritance";

export const LAYER = {
  schema: "fh-layer/1",
  id: "fh-inheritance-en",
  version: "0.1.0",
  name: "Fate's Hand — Inheritance (EN)",
  lang: "en",
  description:
    "The Fate's Hand origin, and the extinction of the four SRD backgrounds it replaces. Inheritance " +
    "grants a free origin feat, 3 ability score points, two languages and 50 GP — no imposed skills, no " +
    "imposed tool. ⚠️ IT DEPENDS ON `fh-trainings-en`: the two languages are records of that catalogue " +
    "(`fh:training:en:language-*`), and this layer's list is resolved on the trainings that layer " +
    "produces. Mounted without it, the Inheritance still stands, its language grant resolves to nothing, " +
    "and the sheet declares `underived.no-language-chosen` rather than failing."
};
