/* ══ LA FIXTURE MÉCANIQUE — ce que le lot 8 écrit pendant que le lot 9 lit ══

   ⚠️ CE FICHIER EST UN ÉCHAFAUDAGE, ET IL EST FAIT POUR ÊTRE JETÉ.

   Les couches SRD réelles sont complètes pour trois genres — `skill`
   (`ability_key`), `class-progression` (des nombres) et `spell`. Pour tout le
   reste, les champs MÉCANIQUES que la dérivation lit sont écrits en ce moment
   même par le lot `8-srd-mecanique`, dans l'AUTRE dépôt. Le contrat
   `contracts/DERIVATION-FIELDS.md` existe pour que les deux lots travaillent
   en même temps sans que l'un devine ce que l'autre écrit (contrat §7).

   Cette fixture est donc une VRAIE COUCHE `fh-layer/1`, montée par-dessus le
   SRD et la couche d'exemple, qui PATCHE les quelques records dont
   l'acceptation a besoin en y ajoutant les champs du contrat §3 — **écrits
   exactement comme le contrat les nomme**. Elle n'invente aucune valeur : tout
   ce qu'elle porte est ce que la source dit déjà en prose, transcrit dans la
   forme mécanique que le contrat prescrit.

   ── LES QUATRE CHAMPS QUI NE SONT PAS DANS LE CONTRAT ───────────────────
   Ils sont marqués `⚠️ HORS CONTRAT` ligne à ligne, listés dans
   QUESTIONS-ARCHITECTE.md (question 3), et le code de `src/build/` les lit
   DÉFENSIVEMENT : absents, le champ visé de `resolved` est déclaré non dérivé
   avec sa raison, jamais deviné. Si l'architecte les renomme, c'est une ligne
   de fixture qui change et un message de `underived` qui apparaît — pas une
   fiche silencieusement fausse.

   ── LE GESTE DE L'ARCHITECTE À LA FUSION ────────────────────────────────
   Il régénère les couches depuis `fh-srd`, SUPPRIME cette couche du harnais,
   et rejoue l'acceptation. Si un nom diverge, il diverge là, en une fois. */

export const FIXTURE_ID = "fixture-mecanique-lot9-fr";

/* Les sept compétences parmi lesquelles le Magicien choisit, telles que
   `data.skill_proficiencies` les énumère en toutes lettres. */
const MAGE_SKILL_POOL = [
  "srd:skill:fr:arcanes",
  "srd:skill:fr:histoire",
  "srd:skill:fr:intuition",
  "srd:skill:fr:investigation",
  "srd:skill:fr:medecine",
  "srd:skill:fr:nature",
  "srd:skill:fr:religion"
];

/* Les traits d'espèce du contrat §5 (GROUPE B, que le lot 8 a le DROIT de
   refuser). Les textes sont ceux du personnage d'exemple : cette fixture ne
   les rédige pas, elle les transporte. */
const ELF_TRAITS = [
  {
    id: "ascendance-feerique",
    name: "Ascendance féerique",
    text: "Avantage aux jets de sauvegarde visant à éviter l'état Charmé ou à y mettre un terme."
  },
  {
    id: "sens-aiguises",
    name: "Sens aiguisés",
    text: "Maîtrise de la compétence Perception (choix fait à la création)."
  },
  {
    id: "transe",
    name: "Transe",
    text: "Repos long en 4 heures de méditation éveillée ; aucune magie ne peut vous endormir."
  },
  {
    id: "lignage-elfique",
    name: "Lignage elfique — haut-elfe",
    text: "Sort mineur Prestidigitation, échangeable à chaque Repos long. Caractéristique d'incantation du lignage : Intelligence."
  }
];

/* `cast_type` par sort. ⚠️ HORS CONTRAT (question 3) : `castType` est
   OBLIGATOIRE sur une entrée de `resolved.spellcasting.spells`, et aucun champ
   du contrat ne le porte. Les valeurs sont celles du personnage d'exemple. */
const CAST_TYPES = {
  "srd:spell:fr:rayon-de-givre": "attack",
  "srd:spell:fr:lumiere": "none",
  "srd:spell:fr:prestidigitation": "none",
  "srd:spell:fr:projectile-magique": "none",
  "srd:spell:fr:bouclier": "none",
  "srd:spell:fr:detection-de-la-magie": "none",
  "srd:spell:fr:sommeil": "save",
  "exemple:spell:fr:chuchotement-des-pages": "none"
};

/* ══ LE DÉFAUT MESURÉ DANS LA COUCHE FR — ARBITRÉ LE 2026-08-08 ════════

   Mesuré par ce lot, puis par l'architecte le même jour : `skill.ability_key`
   est LANGUE-NATIVE dans la couche `srd-5.2.1-fr`. Six compétences sur
   dix-huit portent l'abréviation française du mot qu'elles abrègent :

     athletisme → "for"   dressage → "sag"   intuition  → "sag"
     medecine   → "sag"   perception → "sag" survie     → "sag"

   La couche EN, elle, porte `str` et `wis` ; et les autres champs mécaniques
   FR sont déjà canoniques (`saving_throw_keys: ["int","wis"]`,
   `background.ability_keys: ["con","int","wis"]`).

   CE QUI TRANCHE, ET C'EST LE SCHÉMA : `resolved.abilities` est
   `additionalProperties: false` sur `str dex con int wis cha`, **dans les deux
   langues**. Une compétence FR qui dit `sag` ne peut donc pas adresser les
   caractéristiques de son PROPRE document. Ce n'est pas une nuance de
   traduction, c'est une clef injoignable à l'intérieur d'une seule langue.

   ✅ **ARBITRAGE DE L'ARCHITECTE (2026-08-08)** : `ability_key` devient
   CANONIQUE dans les deux langues. Le lot 8 corrige les six records FR ; la
   régénération des couches côté `fhpc` et la réécriture de l'assertion qui
   épingle `"sag"` (`tests/layers-acceptance.test.mjs:99`) sont le geste de
   l'architecte à la fusion. Le mot affichable reste dans `data.ability`.

   ⚠️ LE MOTEUR NE RATTRAPE RIEN. Aucune table `"sag" → "wis"` dans
   `src/build/` — ce serait la faute même que ce lot existe pour éviter (loi
   §0.13, contrat §1). La fixture applique la décision ICI, à un seul endroit,
   en attendant que le lot 8 la porte à la source ; et une suite dédiée vérifie
   qu'en RETIRANT cette correction, le bloc JETTE en nommant le record. */
export const CLEFS_FR_A_CORRIGER = {
  "srd:skill:fr:athletisme": "str",
  "srd:skill:fr:dressage": "wis",
  "srd:skill:fr:intuition": "wis",
  "srd:skill:fr:medecine": "wis",
  "srd:skill:fr:perception": "wis",
  "srd:skill:fr:survie": "wis"
};

function patch(changes, note) {
  return { op: "patch", note, changes };
}

/** L'enveloppe de la couche, sans ses records. */
function baseLayer() {
  return {
    schema: "fh-layer/1",
    id: FIXTURE_ID,
    version: "0.0.1",
    name: "Fixture mécanique du lot 9 (FR)",
    lang: "fr",
    description: "Échafaudage de test : transcrit en champs mécaniques (contrat DERIVATION-FIELDS.md §3 et §5) ce que la couche SRD dit aujourd'hui en prose. À jeter quand le lot 8-srd-mecanique est fusionné.",
    flags: [],
    attribution: {
      license: "CC0-1.0",
      text: "Échafaudage de test original, versé au domaine public. Les valeurs transcrites proviennent des records SRD patchés, qui gardent leur propre attribution."
    },
    records: {}
  };
}

/** La couche de fixture, prête à être sérialisée en octets et montée
 *  PAR-DESSUS `srd-5.2.1-fr` et `exemple-homebrew-fr` (elle patche des records
 *  des deux : un patch dans le vide est un échec bruyant, §L7.2).
 *
 *  @param {object} [options]
 *  @param {boolean} [options.corrigerClefsFr=true] appliquer la décision du
 *    2026-08-08 sur les six `ability_key` francisés. `false` sert à la suite
 *    qui prouve que le bloc JETTE en nommant le record, au lieu de rattraper.
 *  @param {boolean} [options.seulesClefs=false] ne porter QUE cette
 *    correction, et aucun champ du §3. C'est le monde tel qu'il est
 *    aujourd'hui — avant la fusion du lot 8 — et c'est là qu'on mesure ce que
 *    la dérivation DÉCLARE au lieu de deviner.
 *  @param {boolean} [options.sansHomebrew=false] ne pas patcher les records
 *    de la couche d'exemple (un patch dans le vide est un échec bruyant : la
 *    fixture ne peut pas viser une couche qui n'est pas montée).
 */
export function fixtureLayer(options = {}) {
  const spellPatches = {};
  const skillPatches = {};
  if (options.corrigerClefsFr !== false) {
    for (const [id, key] of Object.entries(CLEFS_FR_A_CORRIGER)) {
      skillPatches[id] = patch(
        { "data[ability_key]": key },
        "Arbitrage du 2026-08-08 : `ability_key` est canonique dans les deux langues. La couche FR y porte encore l'abréviation française ; le lot 8 corrige à la source."
      );
    }
  }
  if (options.seulesClefs) {
    return Object.assign(baseLayer(), { records: { skill: skillPatches } });
  }
  for (const [id, castType] of Object.entries(CAST_TYPES)) {
    /* Un patch dans le vide est un échec bruyant (§L7.2) : la fixture ne peut
       pas viser un record de la couche d'exemple si celle-ci n'est pas montée. */
    if (options.sansHomebrew && !id.startsWith("srd:")) continue;
    spellPatches[id] = patch(
      { "data[cast_type]": castType },
      "⚠️ HORS CONTRAT (question 3) : `castType` est obligatoire sur une entrée de sort et aucun champ du contrat ne le porte."
    );
  }

  return Object.assign(baseLayer(), {
    records: {
      class: {
        "srd:class:fr:magicien": patch({
          /* Contrat §3, genre `class` — les trois champs dus. */
          "data[hit_die]": 6,
          "data[saving_throw_keys]": ["int", "wis"],
          "data[skill_choice]": { count: 2, from: MAGE_SKILL_POOL },
          /* ⚠️ HORS CONTRAT (question 3). `primary_ability` est un mot
             affichable (« Intelligence »), et la caractéristique PRIMAIRE
             d'une classe n'est de toute façon pas toujours sa caractéristique
             d'INCANTATION (un paladin est primaire en Force). */
          "data[spellcasting_ability_key]": "int"
        }, "Champs mécaniques du contrat §3, plus une clef d'incantation hors contrat.")
      },
      background: {
        "srd:background:fr:sage": patch({
          /* Contrat §3, genre `background` — les quatre champs dus. */
          "data[skill_ids]": ["srd:skill:fr:arcanes", "srd:skill:fr:histoire"],
          "data[ability_keys]": ["con", "int", "wis"],
          "data[feat_id]": "srd:feat:fr:initie-a-la-magie",
          "data[tool_id]": "srd:tool:fr:materiel-de-calligraphe"
        }, "Champs mécaniques du contrat §3.")
      },
      species: {
        "srd:species:fr:elfe": patch({
          /* Contrat §3, genre `species`. */
          "data[speed_m]": 9,
          "data[size_key]": "medium",
          /* Contrat §5, GROUPE B — refusable par le lot 8. */
          "data[granted_skill_choice]": {
            count: 1,
            from: ["srd:skill:fr:intuition", "srd:skill:fr:perception", "srd:skill:fr:survie"]
          },
          "data[traits]": ELF_TRAITS,
          /* Contrat §5, forme EXACTE — et c'est elle qui montre le trou :
             `resolved.senses[]` exige un `name` que cette forme ne porte pas.
             Le bloc le déclare non dérivé plutôt que d'inventer le mot. */
          "data[senses]": [{ id: "darkvision", range_m: 18 }]
        }, "Champs mécaniques du contrat §3, plus le GROUPE B du §5.")
      },
      tool: {
        "srd:tool:fr:materiel-de-calligraphe": patch({
          /* ⚠️ HORS CONTRAT (question 3) — mais c'est le nom que le genre
             `skill` porte DÉJÀ dans la vraie couche pour la même notion. */
          "data[ability_key]": "dex"
        }, "Clef de caractéristique d'outil, hors contrat.")
      },
      armor: {
        /* Contrat §3, genre `armor`, et l'arbitrage B4 : le bouclier dit
           « +2 », c'est un MODIFICATEUR, pas une CA de base. Ces deux records
           ne servent pas au magicien — ils servent au test qui prouve que la
           CA avec armure existe, et qu'elle refuse platement quand le champ
           mécanique manque. */
        "srd:armor:fr:armure-de-cuir": patch({
          "data[ac_base]": 11,
          "data[ac_dex_cap]": null
        }, "Contrat §3, genre `armor`."),
        "srd:armor:fr:bouclier": patch({
          "data[ac_base]": null,
          "data[ac_bonus]": 2
        }, "Contrat §3, arbitrage B4 : « +2 » est un modificateur.")
      },
      spell: spellPatches,
      skill: skillPatches
    }
  });
}
