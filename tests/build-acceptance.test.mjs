/* ══ LE TEST D'ACCEPTATION DU LOT 9 ════════════════════════════════════

   « Le magicien elfe niveau 1 de `examples/personnage-srd-fr-niveau1.fh-char.json`
     est reconstruit depuis ses `build.choices` seuls, par verbes seuls, et son
     `resolved` est celui du fichier. »

   PAR VERBES SEULS, AU SENS FORT : la suite part d'un document dont
   `build.choices` et `build.overrides` sont VIDES, rejoue chaque décision par
   `dispatch("build.choose" | "build.set" | "build.override")`, puis
   `dispatch("build.rebuild")`. Aucune fonction interne n'est appelée, aucun
   état n'est lu ailleurs que dans ce que les verbes rendent.

   SUR LA VRAIE MATIÈRE, ET RIEN QUE SUR ELLE : la couche SRD FR régénérée
   après la fusion du lot `8-srd-mecanique`, et la couche d'exemple du lot 2.
   La confrontation annoncée par le contrat §7 a eu lieu le 2026-08-08 :
   l'échafaudage qui tenait la place du lot 8 est démonté, et cette suite passe
   sans lui.

   ── ÉTAGE ATTEINT, DIT PLATEMENT — RÉVISÉ APRÈS LA FUSION DU LOT 8 ──────
   ÉTAGE 1 (dû) : `derivation`, `identity`, `abilities` (avec les boosts
   d'arrière-plan), `proficiency`, `saves`, `skills` (les 18, avec bonus et
   maîtrise), `tools`, `spellcasting` (DD, bonus d'attaque, emplacements,
   sorts), `vitals.hpMax`, `speeds`, `ac` sans armure, `gear`/`currency` depuis
   les choix, `craft` — **atteints, et identiques au fichier**.
   `resources` : **NON atteint**, et le test dit pourquoi (test 4).

   ÉTAGE 2 — LES DEUX MOITIÉS SONT ATTEINTES, et c'est la mesure qui a bougé,
   pas le code :
   · `senses` est passé de NON atteint à **ATTEINT**. La première passe rendait
     une liste vide à raison — la forme du contrat §5 n'avait pas de `name`.
     La sous-question a été retenue, `senses[].name` est entré au contrat, et
     le lot 8 le livre. Le moteur recopie ce nom, il ne le fabrique pas.
   · REWRITTEN 2026-08-08 (lot 13) — `traits` a fait L'ALLER ET LE RETOUR. Il
     était atteint ; le lot 8 l'a refusé avec sa mesure (mise en page à deux
     colonnes aplatie, une espèce qui déborde sur la suivante) EN NOMMANT SON
     PRÉALABLE ; le lot 11 a réparé l'extraction dans `fh-srd`, l'architecte a
     régénéré les couches, et les traits sont **de nouveau ATTEINTS**. Ce
     va-et-vient est exactement ce que la liste exacte de `underived` sert à
     rendre visible : elle a rougi dans les deux sens, à chaque fois. */

import test from "node:test";
import assert from "node:assert/strict";

import { dispatch, assertBlocks } from "../src/kernel/registry.mjs";
import { registerLayers } from "../src/layers/index.mjs";
import { registerBuild } from "../src/build/index.mjs";
import { fileBytes, readJson, SRD_FR, HOMEBREW, EXAMPLE_CHAR } from "./build-harness.mjs";
import { diffResolved } from "../src/build/diff.mjs";
/* LOT 41 — `underived[].reason` → `{key, params}`. */
import { createLabels, renderUnderived, FR_UNDERIVED } from "../src/labels.mjs";

const frUnderived = createLabels(FR_UNDERIVED);

/** ⚠️ LA LEÇON DE LA REVUE DU 2026-08-08, OUTILLÉE.
 *
 *  La première passe de ce lot comparait des PROJECTIONS : `identity` contre
 *  un littéral, `gear` contre une chaîne `id×quantité`, un sort contre cinq
 *  de ses douze champs. Résultat : quatre champs divergeaient du fichier sans
 *  que rien ne rougisse ni ne le déclare — la parente exacte du « garde qui
 *  compte », qu'un autre lot avait déjà payée.
 *
 *  Ici on compare l'OBJET ENTIER au fichier, et on assert la liste EXACTE de
 *  ce qui diffère. Une divergence non prévue fait rougir ; une divergence
 *  prévue est écrite, avec sa raison, à l'endroit où on la voit. */
function divergences(attendu, obtenu, racine) {
  return diffResolved({ [racine]: attendu }, { [racine]: obtenu })
    .map((change) => change.path.replace(/^resolved\./, ""));
}

const FICHIER = readJson(EXAMPLE_CHAR);

/* Le noyau est un singleton : un seul enregistrement, en tête de fichier.
   `node --test` donne un processus par fichier, donc la suite voisine ne voit
   pas cette pile. */
registerLayers();
let tick = 0;
registerBuild({ now: () => `2026-08-08T13:00:${String(tick++).padStart(2, "0")}Z` });

/* REWRITTEN 2026-08-08 (fusion du lot 8) — LA FIXTURE EST PARTIE.
   `tests/build-fixture-mecanique.mjs` est SUPPRIMÉ : c'était un échafaudage
   qui tenait la place du lot 8 pendant qu'il s'écrivait dans l'autre dépôt, et
   un échafaudage qu'on laisse debout est du code mort (loi §0.6). Cette suite
   tourne désormais sur les DEUX VRAIES COUCHES et la couche d'exemple, point.
   C'est la confrontation à la vraie matière, et elle passe. */
for (const file of [SRD_FR, HOMEBREW]) {
  dispatch("layers.register", { bytes: fileBytes(file), origin: file });
}

const PILE = dispatch("layers.stack").map((layer) => ({
  id: layer.id, version: layer.version, hash: layer.hash, name: layer.name
}));

/** Un document NEUF : la pile montée, et rien d'autre. Pas de `resolved`
 *  recopié — il aurait pu se confondre avec un résultat. */
function documentVierge() {
  return {
    schema: "fh-char/1",
    id: FICHIER.id,
    name: FICHIER.name,
    lang: FICHIER.lang,
    units: FICHIER.units,
    created: FICHIER.created,
    modified: FICHIER.modified,
    build: { layers: structuredClone(PILE), choices: [], budgets: {}, overrides: [] }
  };
}

/** Rejoue toutes les décisions PAR LES VERBES, puis reconstruit. */
function reconstruire({ overrides = FICHIER.build.overrides } = {}) {
  let payload = { document: documentVierge() };
  for (const choice of FICHIER.build.choices) {
    const verb = choice.ref !== undefined ? "build.choose" : "build.set";
    dispatch(verb, Object.assign({}, payload, choice));
    payload = {};
  }
  for (const override of overrides) dispatch("build.override", override);
  return dispatch("build.rebuild", {});
}

test("le bloc s'enregistre sur le noyau, et ses cinq verbes sont le seul point d'entrée", () => {
  assertBlocks(["layers", "build"]);
  /* Chacun des cinq EXISTE : appelé sans personnage ouvert, il refuse par une
     erreur du BLOC qui nomme la chose (loi §0.5) — pas par un « verbe
     inconnu », qui serait la preuve du contraire. */
  for (const verb of ["choose", "set", "override", "rebuild", "validate"]) {
    assert.throws(() => dispatch(`build.${verb}`, {}), (error) => {
      assert.equal(error.name, "BuildError", `build.${verb} doit refuser par une erreur du bloc`);
      assert.match(error.message, new RegExp(`^fhpc/build: ${verb} : aucun personnage ouvert`));
      return true;
    });
  }
  assert.throws(() => dispatch("build.derive"), /unknown verb "derive" on block "build"/);
});

test("ACCEPTATION — le magicien elfe niveau 1 est reconstruit depuis ses choix seuls, par verbes seuls", () => {
  const out = reconstruire();
  const got = out.resolved;
  const attendu = FICHIER.resolved;

  /* L'invariant qui rend « resolved est périmé » discernable de « resolved est
     à jour ». Il a mordu tout seul sur l'architecte ; il est vérifié ici sur
     un document que le bloc vient d'écrire. */
  assert.deepEqual(got.derivation.stack, out.document.build.layers,
    "resolved.derivation.stack EST build.layers");

  /* `identity` comparée AU FICHIER, pas à un littéral — c'est le littéral qui
     avait masqué la divergence. Deux écarts, et deux seulement ; ils sont
     expliqués dans la suite « LES DIVERGENCES … » plus bas. */
  assert.deepEqual(divergences(attendu.identity, got.identity, "identity"),
    ["identity.size", "identity.species"]);
  assert.equal(got.identity.level, attendu.identity.level);
  assert.deepEqual(got.identity.classes, attendu.identity.classes);
  assert.equal(got.identity.background, attendu.identity.background);

  // Les boosts d'arrière-plan : 13 + 1 = 14 en Constitution, 15 + 2 = 17 en Intelligence.
  assert.deepEqual(got.abilities, attendu.abilities);
  assert.equal(got.abilities.con.score, 14, "le boost +1 d'arrière-plan est appliqué");
  assert.equal(got.abilities.int.score, 17, "le boost +2 d'arrière-plan est appliqué");

  assert.equal(got.proficiency, attendu.proficiency);
  assert.equal(got.ac, attendu.ac, "10 + Dex, sans armure");
  assert.equal(got.vitals.hpMax, attendu.vitals.hpMax);
  assert.deepEqual(got.speeds, attendu.speeds);
  assert.deepEqual(got.saves, attendu.saves);
  assert.deepEqual(got.tools, attendu.tools.map(({ note, ...reste }) => reste),
    "la note « Maîtrise accordée par l'arrière-plan Sage » est une phrase d'interface, pas une dérivation");
  assert.deepEqual(got.currency, attendu.currency);
  assert.deepEqual(got.craft, attendu.craft);
});

test("ACCEPTATION — les DIX-HUIT compétences, nommément, avec leur bonus et leur maîtrise", () => {
  /* NOMMÉMENT et pas un compte : « un compte reste vert si la pile rend
     dix-huit mauvaises » (leçon du lot 7). On compare la liste entière du
     fichier, entrée par entrée. */
  const got = reconstruire().resolved;
  assert.deepEqual(got.skills, FICHIER.resolved.skills);

  const maitrisees = got.skills.filter((skill) => skill.proficiency === "adept").map((skill) => skill.id);
  assert.deepEqual(maitrisees.sort(), ["arcana", "history", "investigation", "perception", "religion"],
    "deux de l'arrière-plan, deux de la classe, une de l'espèce");
  assert.equal(got.skills.find((skill) => skill.id === "perception").bonus, 3,
    "Sagesse +1 et maîtrise +2 : la compétence accordée par l'Elfe passe par `granted_skill_choice`");
  assert.equal(got.skills.find((skill) => skill.id === "nature").bonus, 3,
    "Intelligence +3 sans maîtrise — un bonus élevé n'est pas une maîtrise");
});

test("ACCEPTATION — l'incantation : DD, bonus d'attaque, emplacements et les huit sorts", () => {
  const got = reconstruire().resolved.spellcasting;
  const attendu = FICHIER.resolved.spellcasting;

  assert.equal(got.id, attendu.id);
  assert.equal(got.name, attendu.name);
  assert.equal(got.ability, "int");
  assert.equal(got.dc, 13, "8 + maîtrise 2 + Intelligence 3");
  assert.equal(got.attackBonus, 5, "maîtrise 2 + Intelligence 3");
  assert.deepEqual(got.slots, attendu.slots, "un emplacement de niveau 1, ×2, depuis class-progression");

  assert.deepEqual(got.spells.map((spell) => spell.id), attendu.spells.map((spell) => spell.id),
    "les huit sorts, dans l'ordre du fichier : les mineurs d'abord, le sort du don compris");
  assert.equal(got.spells.find((spell) => spell.id === "chuchotement-des-pages").level, 0,
    "le sort mineur du don vient de la couche homebrew : la pile le sert comme les autres");

  /* ⚠️ LES SORTS, OBJET PAR OBJET — c'est ici que la projection à cinq champs
     avait caché quatre divergences. La liste ci-dessous est EXACTE : un champ
     de plus ou de moins fait rougir. Chaque famille est expliquée. */
  const ecarts = divergences(attendu.spells, got.spells, "spells");
  assert.deepEqual(ecarts, [
    "spells[chuchotement-des-pages].castType",
    "spells[chuchotement-des-pages].concentration",
    "spells[chuchotement-des-pages].ritual",
    "spells[chuchotement-des-pages].text",
    "spells[detect-magic].castType",
    "spells[detect-magic].duration",
    "spells[detect-magic].range",
    "spells[detect-magic].text",
    "spells[light].castType",
    "spells[light].text",
    "spells[magic-missile].castType",
    "spells[magic-missile].damage",
    "spells[magic-missile].text",
    "spells[prestidigitation].castType",
    "spells[prestidigitation].duration",
    "spells[prestidigitation].text",
    "spells[ray-of-frost].castType",
    "spells[ray-of-frost].damage",
    "spells[ray-of-frost].text",
    "spells[shield].castType",
    "spells[shield].castingTime",
    "spells[shield].text",
    "spells[sleep].castType",
    "spells[sleep].duration",
    "spells[sleep].saveAbility",
    "spells[sleep].saveEffect",
    "spells[sleep].text"
  ]);

  /* REWRITTEN 2026-08-08 (fusion du lot 8) — LA CONCENTRATION A QUITTÉ CETTE
     LISTE, et `castType` y est entré. Deux mouvements en sens contraire, tous
     deux mesurés :
     · `concentration` est DÉRIVÉE (339 sorts sur 339 chez le lot 8). Ses huit
       écarts ont disparu ; il n'en reste UN, celui du sort de la couche
       d'exemple, qui n'a pas été régénéré et ne porte pas le champ.
     · `castType` a été REFUSÉ par le lot 8, mesure à l'appui, et l'architecte
       lui a donné raison CONTRE SON PROPRE SCHÉMA : le champ n'est plus
       obligatoire. Les huit sorts sont donc émis SANS lui, et le mode de
       résolution se déclare inconnu — une fiche de magicien sans aucun sort
       serait plus fausse qu'une fiche dont le mode est dit inconnu.

     Vingt-sept écarts, QUATRE FAMILLES, et le compte par famille est la vraie
     garantie : une liste exacte qu'on ne sait pas expliquer n'est qu'un
     cliché. Si un écart d'une cinquième nature apparaît, ce compte-ci tombe.
     1. `castType` (8) — refusé par le lot 8, déclaré à chaque pli.
     2. `text` (8) — porté depuis `description`, donc PRÉSENT, mais ce n'est pas
        le même texte : le fichier porte des résumés éditoriaux courts, la
        couche porte la règle entière. Le moteur recopie, il ne résume pas.
     3. `damage`, `saveAbility`, `saveEffect`, `ritual`, `concentration` (6) —
        non structurés, ou absents de la seule couche non régénérée.
     4. `castingTime`, `duration`, `range` (5) — les phrases du fichier ont été
        saisies à la main ; la couche transporte la source au caractère près. */
  const famille = (suffixe) => ecarts.filter((path) => path.endsWith("." + suffixe)).length;
  assert.deepEqual(
    { castType: famille("castType"), text: famille("text"),
      nonStructure: famille("damage") + famille("saveAbility") + famille("saveEffect")
        + famille("ritual") + famille("concentration"),
      phrases: famille("castingTime") + famille("duration") + famille("range") },
    { castType: 8, text: 8, nonStructure: 6, phrases: 5 }
  );
  assert.equal(8 + 8 + 6 + 5, ecarts.length, "quatre familles, et RIEN d'autre");

  /* Le pendant positif de la concentration : elle est LÀ, et elle est juste. */
  assert.equal(got.spells.find((spell) => spell.id === "sleep").concentration, true);
  assert.equal(got.spells.find((spell) => spell.id === "shield").concentration, false);

  /* Et le pendant positif : le texte est bien LÀ, et c'est celui du record. */
  for (const spell of got.spells) {
    assert.ok(typeof spell.text === "string" && spell.text.length > 0,
      `« ${spell.id} » doit porter son texte — il vient de \`description\`, sans raison de le laisser tomber`);
  }
});

test("ACCEPTATION — les SENS et les TRAITS d'espèce (étage 2), et le sac depuis les choix", () => {
  const out = reconstruire();
  const got = out.resolved;

  assert.deepEqual(got.senses, [
    { id: "darkvision", name: "Vision dans le noir", value: 18, unit: "m" }
  ], "les sens SONT dérivés : le lot 8 livre `{id, name, range_m}`, et le nom vient du RECORD");

  /* REWRITTEN 2026-08-08 (lot 13) — L'ANCIENNE ASSERTION DISAIT `traits: []`,
     « refusés par le lot 8 ». Elle est devenue fausse le jour où l'architecte a
     régénéré les couches sur un `fh-srd` dont le lot 11 avait réparé
     l'extraction à deux colonnes. Le refus du lot 8 avait nommé ce préalable ;
     il est levé, et la déclaration part avec lui (elle aurait menti).

     ⚠️ CINQ TRAITS, PAS QUATRE — et « Vision dans le noir » y est DEUX FOIS
     dans la fiche : une fois en trait (la règle), une fois en sens (le nombre).
     Les deux sont vrais dans le livre, et rien dans le contrat ne lie un trait
     au sens qu'il accorde. Retirer le trait obligerait le moteur à rapprocher
     `vision-dans-le-noir` de `darkvision` — deux identifiants différents — donc
     à les rapprocher par leur NOM AFFICHABLE, ce que la loi §0.13 interdit. La
     dérivation recopie la liste du record ; elle ne la trie pas. */
  assert.deepEqual(got.traits.map((trait) => trait.id),
    ["ascendance-feerique", "lignage-elfique", "sens-aiguises", "transe", "vision-dans-le-noir"],
    "les CINQ traits de l'Elfe, dans l'ordre du record");
  assert.equal(got.traits.length, 5);
  for (const trait of got.traits) {
    assert.equal(trait.source, "Elfe", "`source` est le NOM DU RECORD d'espèce, recopié, jamais composé");
    assert.ok(typeof trait.text === "string" && trait.text.length > 0,
      `« ${trait.id} » doit porter son texte — il vient du record, sans raison de le laisser tomber`);
  }
  assert.equal(
    out.underived.some((entry) => entry.field === "traits (espèce)"), false,
    "et plus rien ne les déclare non dérivés : une déclaration qui survit à son refus est un mensonge"
  );

  /* REWRITTEN 2026-08-08 (lot 13) — le fichier en portait HUIT et il lui
     manquait la Vision dans le noir : il affirmait que l'Elfe a quatre traits,
     ce que ni le livre ni la couche ne disent. Complété — même famille que le
     « Livre de sorts » corrigé le même jour : un exemple faux fait repayer la
     découverte à chaque lot suivant. Son `hash` de pile, lui, n'a pas bougé. */
  assert.equal(FICHIER.resolved.traits.length, 9,
    "le fichier en porte neuf : cinq d'espèce, deux de classe, un de don, un de la couche homebrew");

  /* LA LISTE EXACTE DES DIVERGENCES avec le fichier, comme partout ailleurs
     dans cette suite. Les quatre traits présents SEULEMENT dans le fichier sont
     ceux que `traits (classe, don, arrière-plan)` déclare ; sur les cinq
     traits d'espèce, tout est identique SAUF les textes — éditoriaux dans le
     fichier, de la prose du record dans la dérivation — et le `name` du
     lignage, que le fichier complète par le lignage choisi (« Lignage elfique
     — haut-elfe »), exactement comme il complète `identity.species`. */
  assert.deepEqual(divergences(FICHIER.resolved.traits, got.traits, "traits"), [
    "traits[ascendance-feerique].text",
    "traits[initie-a-la-magie]",
    "traits[lecteur-de-marges]",
    "traits[lignage-elfique].name",
    "traits[lignage-elfique].text",
    "traits[restauration-magique]",
    "traits[savoir-rituel]",
    "traits[sens-aiguises].text",
    "traits[transe].text",
    "traits[vision-dans-le-noir].text"
  ], "AUCUNE différence d'id ni de `source` sur les cinq traits d'espèce");

  /* L'unique divergence de sens avec le fichier : l'IDENTIFIANT. Le fichier
     dit `vision-dans-le-noir` (un slug français), le record dit `darkvision`
     (un identifiant, le même dans les deux langues). C'est le record qui fait
     foi — un id est une ancre d'override, pas un mot. */
  assert.deepEqual(divergences(FICHIER.resolved.senses, got.senses, "senses"),
    ["senses[darkvision]", "senses[perception-passive]", "senses[vision-dans-le-noir]"]);
  assert.equal(got.senses.length, 1, "et la perception passive n'y est pas : son NOM ne vit dans aucun record");

  /* ⚠️ LE SAC, OBJET PAR OBJET. La chaîne « id×quantité » masquait le poids et
     les notes d'objet : `weight` est facultatif au schéma, donc l'omettre est
     LÉGITIME — mais ça ne rend pas `gear` « identique au fichier », et c'est
     ici qu'on le dit. La liste est exacte. */
  assert.deepEqual(divergences(FICHIER.resolved.gear, got.gear, "gear"), [
    "gear[backpack].weight",
    "gear[book].weight",
    "gear[calligrapher-s-supplies].weight",
    "gear[component-pouch].weight",
    "gear[dagger].weight",
    "gear[lanterne-pliante].note",
    "gear[lanterne-pliante].weight",
    "gear[quarterstaff].weight",
    "gear[rations].weight",
    "gear[torch].weight"
  ], "AUCUNE différence d'id, de quantité ni de port — seulement le poids (facultatif) et une note d'objet");

  // Les identités, les quantités et le port, eux, sont ceux du fichier.
  const nu = (item) => ({ id: item.id, name: item.name, quantity: item.quantity, equipped: item.equipped });
  assert.deepEqual(got.gear, FICHIER.resolved.gear.map(nu));
});

test("LES OVERRIDES PASSENT EN DERNIER, ET SURVIVENT À LA RECONSTRUCTION", () => {
  /* « La parole du MJ bat le JSON. » La preuve tient en deux nombres que la
     dérivation seule ne produit pas : le dé de vie d'un magicien (d6) et une
     Constitution de 14 donnent 8 points de vie ; le fichier en porte 9, et
     c'est l'override du MJ. Deux torches achetées, quatre au sac. */
  const sansOverride = reconstruire({ overrides: [] }).resolved;
  assert.equal(sansOverride.vitals.hpMax, 8, "la dérivation seule : d6 + Constitution 2");
  assert.equal(sansOverride.gear.find((item) => item.id === "torch").quantity, 2, "le choix seul : deux torches");

  const avec = reconstruire();
  assert.equal(avec.resolved.vitals.hpMax, 9, "l'override du MJ, appliqué APRÈS la dérivation");
  assert.equal(avec.resolved.gear.find((item) => item.id === "torch").quantity, 4);
  assert.deepEqual(avec.overridesApplied.map((entry) => entry.path),
    ["resolved.vitals.hpMax", "resolved.gear[torch].quantity"]);

  // Et une SECONDE reconstruction ne les efface pas : `build` n'a pas bougé.
  const encore = dispatch("build.rebuild", {});
  assert.equal(encore.resolved.vitals.hpMax, 9);
  assert.equal(encore.resolved.gear.find((item) => item.id === "torch").quantity, 4);
  assert.deepEqual(encore.document.build.overrides, FICHIER.build.overrides,
    "une reconstruction relit `build`, elle ne le réécrit jamais");
});

test("CE QUE LA PILE NE SAIT PAS NOURRIR N'EST PAS DEVINÉ — et `rebuild` le DIT", () => {
  const out = reconstruire();
  const champs = out.underived.map((entry) => entry.field);

  /* La liste EXACTE. Pas un « contient » : si la dérivation se met un jour à
     nourrir `senses`, ce test doit rougir pour qu'on retire la ligne. */
  /* REWRITTEN 2026-08-08 (lot 13) — CETTE LISTE A FAIT SON TRAVAIL, et c'est
     pour ça qu'on l'asserte à l'identique plutôt qu'avec un « contient ».
     `traits (espèce)` y était ENTRÉ à la fusion du lot 8 (refus mesuré) ; il en
     SORT ici, l'architecte ayant régénéré les couches sur un `fh-srd` dont le
     lot 11 a réparé l'extraction à deux colonnes — le préalable que le refus
     avait lui-même nommé. Un aller, un retour, deux rougissements : c'est
     exactement l'usage de cette liste.
     Les autres n'ont pas bougé depuis la fusion du lot 8 :
     · `senses` est SORTI (dérivé) et laisse derrière lui la seule perception
       passive, dont le nom n'est dans aucun record ;
     · `spellcasting.spells[].castType` est ENTRÉ (refus du lot 8, et le schéma
       a cédé : le champ n'est plus obligatoire) ;
     · `spellcasting.spells[].concentration` reste, mais pour un seul sort —
       celui de la couche d'exemple, qui n'a pas été régénérée. */
  /* REWRITTEN 2026-08-08 — révision du schéma (GAP-DERIVED, architecte).
     `resolved.stats` rejoint la liste : une statistique dérivée de couche vient
     d'un module moteur activé par un drapeau, et aucun module n'en publie au M2.
     L'assertion n'est pas relâchée — elle reste une LISTE EXACTE, et c'est elle
     qui a rougi la première quand le champ est apparu. */
  assert.deepEqual(champs, [
    "actions",
    "craft",
    "gear[].weight",
    "identity.species (lignage)",
    "languages",
    "notes",
    "resources",
    "senses[perception-passive]",
    "spellcasting.spells[].castType",
    "spellcasting.spells[].concentration",
    "spellcasting.spells[].damage",
    "stats",
    "traits (classe, don, arrière-plan)"
  ]);
  /* REWRITTEN 2026-08-13 (lot 41) — `.reason` → `{key, params}` ; la phrase
     se relit via `renderUnderived`, la garantie de contenu ne bouge pas. */
  assert.match(
    renderUnderived(out.underived.find((entry) => entry.field === "spellcasting.spells[].castType"), frUnderived),
    /refusé par le lot 8/,
    "un refus argumenté et daté, pas un trou anonyme"
  );
  assert.match(
    renderUnderived(out.underived.find((entry) => entry.field === "spellcasting.spells[].damage"), frUnderived),
    /ne sont structurés nulle part/,
    "les dégâts, eux, sont réellement hors d'atteinte"
  );
  assert.match(
    renderUnderived(out.underived.find((entry) => entry.field === "spellcasting.spells[].concentration"), frUnderived),
    /chuchotement-des-pages/,
    "et la concentration ne manque plus QUE sur la couche non régénérée — la raison NOMME les sorts"
  );
  for (const entry of out.underived) {
    assert.ok(renderUnderived(entry, frUnderived).length > 40, `« ${entry.field} » doit dire POURQUOI, pas seulement QUOI`);
  }

  /* L'INVARIANT DU LOT : aucune collection vide n'est rendue sans une
     déclaration qui la nomme. Une liste vide muette ressemble à une réponse. */
  const declares = new Set(champs.map((field) => field.split(/[.[ ]/)[0]));
  for (const [nom, valeur] of Object.entries(out.resolved)) {
    if (!Array.isArray(valeur) || valeur.length > 0) continue;
    assert.ok(declares.has(nom), `resolved.${nom} est vide et rien ne le déclare`);
  }
  /* REWRITTEN 2026-08-08 (lot 13) — `traits` n'est PLUS vide : il l'était
     devenu à la fusion du lot 8, il ne l'est plus depuis la régénération des
     couches. `senses` ne l'est pas non plus. Les deux moitiés de l'étage 2
     sont pleines. */
  assert.deepEqual(
    Object.entries(out.resolved).filter(([, v]) => Array.isArray(v) && v.length === 0).map(([k]) => k).sort(),
    /* REWRITTEN 2026-08-08 — `stats` est une collection vide de plus (GAP-DERIVED). */
    ["actions", "craft", "languages", "notes", "resources", "stats"]
  );
});

test("LES DIVERGENCES AVEC LE FICHIER D'EXEMPLE SONT NOMMÉES, PAS MAQUILLÉES", () => {
  const got = reconstruire().resolved;

  /* 1. Le LIGNAGE. Le fichier dit « Elfe (haut-elfe) » ; le record dit
     « Elfe » et le lignage est un CHOIX. Recoller les deux fabriquerait une
     chaîne affichable dans le moteur (loi §0.13). */
  assert.equal(FICHIER.resolved.identity.species, "Elfe (haut-elfe)");
  assert.equal(got.identity.species, "Elfe");

  /* 2. `identity.size`. Le champ a été AJOUTÉ au schéma le 2026-08-08 par le
     conseiller VTT, après l'écriture de l'exemple. Le contrat §3 dit que
     `size_key` « c'est `identity.size` de fh-char/1 » : on le dérive. */
  assert.equal(FICHIER.resolved.identity.size, undefined);
  assert.equal(got.identity.size, "medium");

  /* 3. Le LIVRE DE SORTS. Le fichier portait « Livre de sorts », que le SRD
     exporté ne connaît pas — le genre `gear` porte « Livre ». Corrigé DANS le
     fichier sur arbitrage du 2026-08-08 : un exemple qui nomme un objet
     inexistant fait repayer la découverte à chaque lot suivant. */
  assert.ok(!FICHIER.resolved.gear.some((item) => item.id === "livre-de-sorts"));
  assert.ok(got.gear.some((item) => item.id === "book"));

  /* 4. Le POIDS et les NOTES d'objet ne sont pas dérivés : « 0,5 kg » est une
     phrase, et le contrat ne nomme aucun champ de masse. Les deux sont
     FACULTATIFS au schéma — leur absence est légitime, et déclarée. */
  for (const item of got.gear) {
    assert.equal(item.weight, undefined);
    assert.equal(item.note, undefined);
  }
  const schema = readJson("schemas/fh-char.schema.json").$defs.resolved.properties.gear.items;
  assert.ok(!schema.required.includes("weight"), "`weight` est bien facultatif — sinon l'omettre serait une faute");
});

test("`validate` ne trouve rien à redire au personnage d'acceptation", () => {
  reconstruire();
  const verdict = dispatch("build.validate", {});
  assert.deepEqual(verdict.violations, []);
  assert.equal(verdict.ok, true);
  /* Il AVERTIT, en revanche, sur les choix que la dérivation ne consomme pas —
     c'est le seul endroit qui dise à un joueur « ce que tu as coché ne change
     rien à ta fiche ». */
  const inertes = verdict.warnings.filter((line) => line.includes("n'a été consommé"));
  assert.deepEqual(inertes.length, 5, "lignage, don d'arrière-plan, mode de caractéristiques, don homebrew, langue");
});
