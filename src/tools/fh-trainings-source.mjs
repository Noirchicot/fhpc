/* ══ LE CANON DÉCLARÉ — LES TRAININGS ══════════════════════════════════
   Lot 184-fh-skills-fendu-en-trois. Extrait de `fh-skills-source.mjs`, où ce
   catalogue vivait depuis le lot 82.

   🔴 POURQUOI IL EN SORT, ET C'EST ERIC QUI L'A VU : une couche appelée
   « Skills & tools » distribuait AUSSI les langues. `Trainings` est l'un des
   SIX INTERRUPTEURS de l'écran `Rules` (ARCHITECTURE.md, « La coupe des
   couches », 2026-09-08) : il doit pouvoir s'éteindre SEUL, sans emporter le
   pool de points des douze classes.

   Ce fichier est la SOURCE, pas le générateur. Il ne lit rien, n'écrit rien
   et ne calcule rien : `gen-fh-trainings-layer.mjs` le confronte à la pile.

   ⚠️ ET IL EST LU PAR L'INHERITANCE. Les deux langues de l'Héritage sont des
   records de CE catalogue : `gen-fh-inheritance-layer.mjs` résout sa liste sur
   les trainings que ce générateur-ci produit, jamais sur une seconde liste.
   C'est la dépendance qu'Eric a dictée le 2026-09-08 — *sans la couche
   Trainings, l'Inheritance n'offre plus de langue*. */

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

/* ⛔ TREIZE : douze langues (une par espèce jouable) et le Garrot. Si ce
   nombre bouge sans qu'une règle bouge, quelqu'un a ajouté un training sans
   chapitre — et un training sans chapitre est un achat que le joueur ne peut
   lire nulle part.
   ⚠️ Déclaré ici pour que le générateur le CONFRONTE à ce qu'il a réellement
   produit, au lieu de le recompter à partir de ses propres listes — un compte
   tiré de la même source que ce qu'il compte ne prouve rien. */
export const EXPECTED = {
  trainings: 13,
  /* Les douze espèces jouables de la pile. Le générateur croise les deux
     listes DANS LES DEUX SENS : une espèce sans sa langue est un peuple muet,
     une langue sans son peuple est un achat qui ne mène nulle part. */
  languages: 12
};

/* Le drapeau que cette couche lève. Il n'allume aucun module : la DÉPENSE
   d'un point sur un training est le fait du pool de compétences, allumé par
   `fh.skills` (`src/modules/fh/skill-pool.mjs`). Ce drapeau-ci garde le
   CATALOGUE — et c'est la couche, pas le drapeau, qui fait disparaître du
   contenu (ARCHITECTURE.md, « un drapeau garde un MODULE ; seule une couche
   fait disparaître du CONTENU »). */
export const FH_TRAININGS_FLAG = "fh.trainings";

export const LAYER = {
  schema: "fh-layer/1",
  id: "fh-trainings-en",
  version: "0.1.0",
  name: "Fate's Hand — Trainings (EN)",
  lang: "en",
  description:
    "The thirteen trainings of Fate's Hand: twelve languages, one per playable people, and the Garrot. " +
    "A training has neither tier nor ability — you know it or you do not — and its cost lives on its own " +
    "record. Two of the languages are granted at creation by the Inheritance (`fh-inheritance-en`), " +
    "which resolves its list on THIS catalogue: without this layer, the Inheritance offers no language."
};
