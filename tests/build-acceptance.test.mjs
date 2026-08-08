/* ══ LE TEST D'ACCEPTATION DU LOT 9 ════════════════════════════════════

   « Le magicien elfe niveau 1 de `examples/personnage-srd-fr-niveau1.fh-char.json`
     est reconstruit depuis ses `build.choices` seuls, par verbes seuls, et son
     `resolved` est celui du fichier. »

   PAR VERBES SEULS, AU SENS FORT : la suite part d'un document dont
   `build.choices` et `build.overrides` sont VIDES, rejoue chaque décision par
   `dispatch("build.choose" | "build.set" | "build.override")`, puis
   `dispatch("build.rebuild")`. Aucune fonction interne n'est appelée, aucun
   état n'est lu ailleurs que dans ce que les verbes rendent.

   SUR LA VRAIE MATIÈRE : les deux vraies couches du dépôt (SRD FR, 1 309
   records, et la couche d'exemple du lot 2), plus UNE couche d'échafaudage —
   la fixture mécanique, qui tient la place du lot `8-srd-mecanique` en cours
   d'écriture dans l'autre dépôt (contrat §7). Le geste de l'architecte à la
   fusion : régénérer les couches, retirer la fixture, rejouer cette suite.

   ── ÉTAGE ATTEINT, DIT PLATEMENT ────────────────────────────────────────
   ÉTAGE 1 (dû) : `derivation`, `identity`, `abilities` (avec les boosts
   d'arrière-plan), `proficiency`, `saves`, `skills` (les 18, avec bonus et
   maîtrise), `tools`, `spellcasting` (DD, bonus d'attaque, emplacements,
   sorts), `vitals.hpMax`, `speeds`, `ac` sans armure, `gear`/`currency` depuis
   les choix, `craft` — **atteints, et identiques au fichier**.
   `resources` : **NON atteint**, et le test dit pourquoi (test 4).
   ÉTAGE 2 : `traits` d'espèce **atteint** ; `senses` **NON atteint**, parce
   que la forme du contrat §5 ne porte pas le `name` que le schéma exige
   (test 4). */

import test from "node:test";
import assert from "node:assert/strict";

import { dispatch, assertBlocks } from "../src/kernel/registry.mjs";
import { registerLayers } from "../src/layers/index.mjs";
import { registerBuild } from "../src/build/index.mjs";
import { fileBytes, bytesOf, readJson, SRD_FR, HOMEBREW, EXAMPLE_CHAR } from "./build-harness.mjs";
import { fixtureLayer } from "./build-fixture-mecanique.mjs";
import { diffResolved } from "../src/build/diff.mjs";

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

for (const file of [SRD_FR, HOMEBREW]) {
  dispatch("layers.register", { bytes: fileBytes(file), origin: file });
}
dispatch("layers.register", { bytes: bytesOf(fixtureLayer()), origin: "tests/build-fixture-mecanique.mjs" });

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
    build: { layers: structuredClone(PILE), choices: [], overrides: [] }
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

  const maitrisees = got.skills.filter((skill) => skill.proficiency === "proficient").map((skill) => skill.id);
  assert.deepEqual(maitrisees.sort(), ["arcanes", "histoire", "investigation", "perception", "religion"],
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
    "spells[bouclier].castingTime",
    "spells[bouclier].concentration",
    "spells[bouclier].text",
    "spells[chuchotement-des-pages].concentration",
    "spells[chuchotement-des-pages].ritual",
    "spells[chuchotement-des-pages].text",
    "spells[detection-de-la-magie].concentration",
    "spells[detection-de-la-magie].duration",
    "spells[detection-de-la-magie].range",
    "spells[detection-de-la-magie].text",
    "spells[lumiere].concentration",
    "spells[lumiere].text",
    "spells[prestidigitation].concentration",
    "spells[prestidigitation].duration",
    "spells[prestidigitation].text",
    "spells[projectile-magique].concentration",
    "spells[projectile-magique].damage",
    "spells[projectile-magique].text",
    "spells[rayon-de-givre].concentration",
    "spells[rayon-de-givre].damage",
    "spells[rayon-de-givre].text",
    "spells[sommeil].concentration",
    "spells[sommeil].duration",
    "spells[sommeil].saveAbility",
    "spells[sommeil].saveEffect",
    "spells[sommeil].text"
  ]);

  /* Vingt-six écarts, et QUATRE FAMILLES SEULEMENT — la liste est exacte, mais
     une liste exacte qu'on ne sait pas expliquer n'est qu'un cliché. On les
     compte par famille : si un écart d'une cinquième nature apparaît, ce
     compte-ci tombe avant que quiconque le découvre à la table.

     1. `concentration` (8) — le fichier la porte, la couche pas encore. Champ
        COMMANDÉ AU LOT 8 le 2026-08-08 ; d'ici là déclaré non dérivé, et la
        dérivation ne le déduit PAS de `duration`, qui est une phrase.
     2. `text` (8) — porté depuis `description`, donc PRÉSENT, mais ce n'est
        pas le même texte : le fichier porte des résumés éditoriaux courts, la
        couche porte la règle entière. Le moteur recopie le record, il ne
        résume pas.
     3. `damage`, `saveAbility`, `saveEffect`, `ritual` (5) — non structurés
        dans la source. `damage` est déclaré à chaque pli.
     4. `castingTime`, `duration`, `range` (5) — les phrases du fichier ont été
        saisies à la main ; la couche transporte la source au caractère près,
        apostrophe typographique comprise. C'est le record qui fait foi. */
  const famille = (suffixe) => ecarts.filter((path) => path.endsWith("." + suffixe)).length;
  assert.deepEqual(
    { concentration: famille("concentration"), text: famille("text"),
      nonStructure: famille("damage") + famille("saveAbility") + famille("saveEffect") + famille("ritual"),
      phrases: famille("castingTime") + famille("duration") + famille("range") },
    { concentration: 8, text: 8, nonStructure: 5, phrases: 5 }
  );
  assert.equal(8 + 8 + 5 + 5, ecarts.length, "quatre familles, et RIEN d'autre");

  /* Et le pendant positif : le texte est bien LÀ, et c'est celui du record. */
  for (const spell of got.spells) {
    assert.ok(typeof spell.text === "string" && spell.text.length > 0,
      `« ${spell.id} » doit porter son texte — il vient de \`description\`, sans raison de le laisser tomber`);
  }
});

test("ACCEPTATION — les traits d'espèce (étage 2), et le sac depuis les choix", () => {
  const got = reconstruire().resolved;

  const espece = FICHIER.resolved.traits.filter((trait) => trait.source === "Elfe");
  assert.deepEqual(got.traits, espece, "les quatre traits de l'Elfe, tels que le contrat §5 les porte");

  /* ⚠️ LE SAC, OBJET PAR OBJET. La chaîne « id×quantité » masquait le poids et
     les notes d'objet : `weight` est facultatif au schéma, donc l'omettre est
     LÉGITIME — mais ça ne rend pas `gear` « identique au fichier », et c'est
     ici qu'on le dit. La liste est exacte. */
  assert.deepEqual(divergences(FICHIER.resolved.gear, got.gear, "gear"), [
    "gear[baton-de-combat].weight",
    "gear[dague].weight",
    "gear[lanterne-pliante].note",
    "gear[lanterne-pliante].weight",
    "gear[livre].weight",
    "gear[materiel-de-calligraphe].weight",
    "gear[rations].weight",
    "gear[sac-a-dos].weight",
    "gear[sacoche-a-composantes].weight",
    "gear[torche].weight"
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
  assert.equal(sansOverride.gear.find((item) => item.id === "torche").quantity, 2, "le choix seul : deux torches");

  const avec = reconstruire();
  assert.equal(avec.resolved.vitals.hpMax, 9, "l'override du MJ, appliqué APRÈS la dérivation");
  assert.equal(avec.resolved.gear.find((item) => item.id === "torche").quantity, 4);
  assert.deepEqual(avec.overridesApplied.map((entry) => entry.path),
    ["resolved.vitals.hpMax", "resolved.gear[torche].quantity"]);

  // Et une SECONDE reconstruction ne les efface pas : `build` n'a pas bougé.
  const encore = dispatch("build.rebuild", {});
  assert.equal(encore.resolved.vitals.hpMax, 9);
  assert.equal(encore.resolved.gear.find((item) => item.id === "torche").quantity, 4);
  assert.deepEqual(encore.document.build.overrides, FICHIER.build.overrides,
    "une reconstruction relit `build`, elle ne le réécrit jamais");
});

test("CE QUE LA PILE NE SAIT PAS NOURRIR N'EST PAS DEVINÉ — et `rebuild` le DIT", () => {
  const out = reconstruire();
  const champs = out.underived.map((entry) => entry.field);

  /* La liste EXACTE. Pas un « contient » : si la dérivation se met un jour à
     nourrir `senses`, ce test doit rougir pour qu'on retire la ligne. */
  assert.deepEqual(champs, [
    "actions",
    "craft",
    "gear[].weight",
    "identity.species (lignage)",
    "languages",
    "notes",
    "resources",
    "senses",
    "spellcasting.spells[].concentration",
    "spellcasting.spells[].damage",
    "traits (classe, don, arrière-plan)"
  ]);
  /* REWRITTEN 2026-08-08 (revue d'architecte, défaut A) — l'entrée groupée
     « damage / .text / .concentration » était FAUSSE sur un tiers : `text`
     était disponible dans la couche et laissé tomber sans raison de données.
     Il est porté, donc il sort de la liste ; `damage` et `concentration` sont
     séparés parce qu'ils n'ont pas la même raison ni le même avenir. */
  assert.match(
    out.underived.find((entry) => entry.field === "spellcasting.spells[].concentration").reason,
    /lot 8/,
    "la concentration a une DATE et un destinataire, ce n'est pas un refus définitif"
  );
  assert.match(
    out.underived.find((entry) => entry.field === "spellcasting.spells[].damage").reason,
    /ne sont structurés nulle part/,
    "les dégâts, eux, sont réellement hors d'atteinte"
  );
  for (const entry of out.underived) {
    assert.ok(entry.reason.length > 40, `« ${entry.field} » doit dire POURQUOI, pas seulement QUOI`);
  }

  /* L'INVARIANT DU LOT : aucune collection vide n'est rendue sans une
     déclaration qui la nomme. Une liste vide muette ressemble à une réponse. */
  const declares = new Set(champs.map((field) => field.split(/[.[ ]/)[0]));
  for (const [nom, valeur] of Object.entries(out.resolved)) {
    if (!Array.isArray(valeur) || valeur.length > 0) continue;
    assert.ok(declares.has(nom), `resolved.${nom} est vide et rien ne le déclare`);
  }
  assert.deepEqual(
    Object.entries(out.resolved).filter(([, v]) => Array.isArray(v) && v.length === 0).map(([k]) => k).sort(),
    ["actions", "craft", "languages", "notes", "resources", "senses"]
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
  assert.ok(got.gear.some((item) => item.id === "livre"));

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
