/* Lot 9 — LES REFUS, LES DÉGRADATIONS, ET CE QUE `rebuild` DIT.

   L'acceptation prouve que la dérivation SAIT plier. Cette suite-ci prouve
   qu'elle sait REFUSER : c'est la moitié qui coûte cher à ne pas avoir, parce
   qu'un pli approximatif est vert et se joue à la table.

   Chaque scénario retire une chose à la matière et regarde ce que le bloc
   fait de son absence. La règle attendue est toujours la même : un nombre
   manquant est ABSENT et déclaré, une collection qu'on ne sait pas nourrir est
   VIDE et déclarée, une clef hors catalogue JETTE, et rien n'est jamais
   deviné. */

import test from "node:test";
import assert from "node:assert/strict";
import Ajv2020 from "ajv/dist/2020.js";

import { makeHarness, acceptanceDocument, readJson, manifestOf, uneCouche, ampute, SRD_FR } from "./build-harness.mjs";
import { diffResolved } from "../src/build/diff.mjs";
/* LOT 41 — `underived[].reason` n'existe plus (`{field, key, params}`, voir
   `src/labels.mjs`). Les assertions qui lisaient la phrase la reconstruisent
   via `renderUnderived`, sur la MÊME table que `derive.mjs` utilise pour son
   `toString` non énumérable — la garantie de texte reste testée, la forme a
   changé. */
import { createLabels, renderUnderived, FR_UNDERIVED } from "../src/labels.mjs";

const frUnderived = createLabels(FR_UNDERIVED);

const ajv = new Ajv2020({ strict: true, allErrors: true });
const validateChar = ajv.compile(readJson("schemas/fh-char.schema.json"));

/** Le document d'acceptation privé de certains choix. */
function sans(layers, retirer) {
  const doc = acceptanceDocument(layers);
  doc.build.choices = doc.build.choices.filter((choice) => !retirer.includes(choice.path));
  return doc;
}

/** Le même, sans les overrides du MJ — les scénarios de dégradation mesurent
 *  la DÉRIVATION, et un override sur un champ qu'elle n'a pas produit est une
 *  question à part (voir la suite qui la pose, plus bas). */
function sansOverrides(layers) {
  const doc = acceptanceDocument(layers);
  doc.build.overrides = [];
  return doc;
}

/* ── le document produit VALIDE ─────────────────────────────────────── */

test("le document reconstruit valide le schéma fh-char/1", () => {
  const h = makeHarness();
  const out = h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  assert.equal(validateChar(out.document), true, ajv.errorsText(validateChar.errors));
  /* C'est ce qui justifie la règle « collection vide + déclaration » plutôt
     que « collection absente » : les vingt clefs de `resolved` sont TOUTES
     obligatoires, et un document invalide est un document injouable. */
  assert.deepEqual(
    Object.keys(out.resolved).sort(),
    readJson("schemas/fh-char.schema.json").$defs.resolved.required.slice().sort()
  );
});

/* ── ce qui JETTE : le structurel et le hors-catalogue ──────────────── */

test("sans NIVEAU, la dérivation n'est pas incomplète : elle est impossible, et elle le dit", () => {
  const h = makeHarness();
  assert.throws(() => h.verbs.rebuild({ document: sans(h.layers, ["level"]) }), (error) => {
    assert.match(error.message, /aucun choix `level`/);
    assert.match(error.message, /n'y a pas de valeur par défaut|dérivable de rien/);
    return true;
  });
});

test("sans CLASSE, et sans un seul des six scores, elle jette en nommant ce qui manque", () => {
  const h = makeHarness();
  assert.throws(() => h.verbs.rebuild({ document: sans(h.layers, ["class"]) }), /aucun choix `class`/);
  assert.throws(() => h.verbs.rebuild({ document: sans(h.layers, ["abilities.wis"]) }), (error) => {
    assert.match(error.message, /abilities\.wis/);
    assert.match(error.message, /Un score ne se dérive de rien/);
    return true;
  });
});

test("UNE CLEF DE CARACTÉRISTIQUE HORS DES SIX JETTE — le moteur ne la rattrape pas", () => {
  /* REWRITTEN 2026-08-08 (fusion du lot 8) — LA MAUVAISE CLEF EST MAINTENANT
     FABRIQUÉE, et c'est plus solide qu'avant. Ce test s'appuyait sur un DÉFAUT
     DE LA SOURCE : la couche FR portait `sag` et `for` sur six compétences.
     L'arbitrage a rendu `ability_key` canonique, le lot 8 a corrigé les six, et
     le défaut a disparu — avec la preuve.

     Un garde ne se relâche pas parce que le bug qu'il attrapait a été réparé :
     la faute reste possible (une couche homebrew d'inconnu peut l'écrire), donc
     on la fabrique délibérément. Une table `"sag" → "wis"` dans `src/build/`
     serait la faute que ce lot existe pour éviter : le garde de vocabulaire
     tient un bout, ce test tient l'autre. */
  const h = makeHarness({
    extra: uneCouche("scenario-clef-hors-catalogue",
      ampute("skill", "srd:skill:fr:athletisme", "Athlétisme", { ability_key: "for" }))
  });
  assert.throws(() => h.verbs.rebuild({ document: acceptanceDocument(h.layers) }), (error) => {
    assert.match(error.message, /srd:skill:fr:athletisme/, "la violation nomme le record");
    assert.match(error.message, /"for"/, "et la clef fautive");
    assert.match(error.message, /str, dex, con, int, wis, cha/, "et le catalogue des six");
    return true;
  });
  /* Et le pendant : sur la vraie couche, les dix-huit clefs sont canoniques. */
  const vraie = makeHarness();
  const skills = vraie.dispatch("layers.query", { kind: "skill" });
  assert.equal(skills.length, 18);
  for (const view of skills) {
    assert.ok(["str", "dex", "con", "int", "wis", "cha"].includes(view.record.data.ability_key),
      `« ${view.id} » porte une clef canonique depuis la fusion du lot 8`);
  }
});

test("la pile qui a bougé sous le personnage est une DÉGRADATION, pas une dérivation à tenter", () => {
  const h = makeHarness();
  const doc = acceptanceDocument(h.layers);
  doc.build.layers[0] = Object.assign({}, doc.build.layers[0], { hash: "0".repeat(64) });
  assert.throws(() => h.verbs.rebuild({ document: doc }), (error) => {
    assert.match(error.message, /la pile montée ne correspond pas à `build.layers`/);
    assert.match(error.message, /srd-5\.2\.1-fr@5\.2\.1#0{64}/, "le message montre les deux piles");
    return true;
  });
});

test("un document jamais construit ADOPTE la pile montée — et c'est la seule fois où `build` bouge", () => {
  const h = makeHarness();
  const doc = acceptanceDocument(h.layers);
  doc.build.layers = [];
  const out = h.verbs.rebuild({ document: doc });
  assert.deepEqual(out.document.build.layers, manifestOf(h.layers));
  assert.deepEqual(out.resolved.derivation.stack, out.document.build.layers);
  // Et les choix, eux, n'ont pas bougé d'un iota.
  assert.deepEqual(out.document.build.choices, doc.build.choices);
});

/* ── ce qui DÉGRADE : les champs mécaniques absents ─────────────────── */

/* REWRITTEN 2026-08-08 (fusion du lot 8) — LA PÉNURIE NE PROUVE PLUS RIEN.
   Ces scénarios s'appuyaient sur une couche SRD qui ne portait aucun champ
   mécanique : il suffisait de la monter pour voir le bloc déclarer. `hit_die`,
   `saving_throw_keys`, `speed_m`, `size_key` et `spellcasting_ability_key`
   sont arrivés, et ces preuves-là se sont évaporées avec eux.

   On ne relâche pas une garantie parce que la source s'est enrichie : on la
   reprouve autrement. La couche ci-dessous RECOUVRE les records par un `add`
   qui ne garde que la prose — l'amputation est DÉLIBÉRÉE et lisible, au lieu
   d'être un accident de la source dont la disparition passerait inaperçue. */
const COUCHE_AMPUTEE = uneCouche("scenario-sans-champs-mecaniques", Object.assign(
  ampute("class", "srd:class:fr:magicien", "Magicien", {
    hit_point_die: "d6 par niveau de Magicien",
    saving_throw_proficiencies: ["Intelligence", "Sagesse"],
    primary_ability: "Intelligence"
  }),
  ampute("background", "srd:background:fr:sage", "Sage", {
    skill_proficiencies: ["Arcanes", "Histoire"],
    tool_proficiency: "matériel de calligraphe"
  }),
  ampute("species", "srd:species:fr:elfe", "Elfe", {
    speed: "9 m",
    size: "M (moyenne, entre 1,50 m et 1,80 m)"
  })
));

test("SANS LES CHAMPS MÉCANIQUES DU §3, rien n'est deviné : tout ce qui manque est nommé", () => {
  /* La dérivation ne s'effondre pas et n'invente rien — elle rend ce qu'elle
     peut et nomme le reste. Les records amputés ne portent QUE la prose que la
     source portait avant le lot 8 : « d6 par niveau de Magicien », « 9 m »,
     des noms affichables. Le moteur ne la parse pas. */
  const h = makeHarness({ extra: COUCHE_AMPUTEE });
  const out = h.verbs.rebuild({ document: sansOverrides(h.layers) });
  const champs = out.underived.map((entry) => entry.field);

  for (const champ of ["saves", "speeds", "vitals.hpMax", "identity.size", "spellcasting", "skills (arrière-plan)"]) {
    assert.ok(champs.includes(champ), `« ${champ} » doit être déclaré non dérivé`);
  }
  assert.equal(out.resolved.vitals.hpMax, undefined, "un nombre qu'on ne sait pas calculer est ABSENT, pas nul");
  assert.equal(out.resolved.saves, undefined, "et six sauvegardes non maîtrisées ne sont pas un défaut acceptable");
  assert.equal(out.resolved.speeds, undefined);
  /* REWRITTEN 2026-08-13 (lot 41) — `.reason` est devenu `{key, params}` ;
     la phrase se relit via `renderUnderived` sur la même table que le
     `toString` de `derive.mjs`, la garantie de texte ne bouge pas. */
  assert.match(
    renderUnderived(out.underived.find((entry) => entry.field === "vitals.hpMax"), frUnderived),
    /hit_die/,
    "la raison nomme le champ mécanique attendu, pas un vague « données manquantes »"
  );
  /* Le bonus de maîtrise, lui, vient de `class-progression`, que la couche
     amputée ne touche pas. Il est là — l'amputation est CIBLÉE, sinon le test
     prouverait seulement qu'une pile vide ne dérive rien. */
  assert.equal(out.resolved.proficiency, 2, "class-progression n'est pas amputée : la preuve est ciblée");
  // Et sur la VRAIE matière, ces mêmes champs sont tous dérivés.
  const vraie = makeHarness().verbs.rebuild({ document: acceptanceDocument(makeHarness().layers) });
  for (const champ of ["saves", "speeds", "vitals.hpMax", "identity.size"]) {
    assert.ok(!vraie.underived.some((entry) => entry.field === champ), `« ${champ} » EST dérivé depuis le lot 8`);
  }
});

test("UN RECORD D'ESPÈCE SANS `traits` est déclaré — et la privation est DÉLIBÉRÉE", () => {
  /* REWRITTEN 2026-08-08 (lot 13) — LA PREUVE A CHANGÉ DE SUPPORT. Le refus des
     traits d'espèce se prouvait tout seul depuis la fusion du lot 8 : la couche
     SRD n'en portait aucun, il suffisait de la monter. Le lot 11 a réparé
     l'extraction à deux colonnes dans `fh-srd`, l'architecte a régénéré les
     couches, et cette preuve-là s'est évaporée avec la pénurie qui la portait.

     C'est le piège nommé au §3 du mandat : « une preuve peut cesser de prouver
     sans que personne n'y touche ». La déclaration résiduelle existe toujours
     dans le moteur — une couche tierce peut parfaitement décrire une espèce
     sans `traits` — et c'est ici, sur une AMPUTATION VOULUE, qu'elle se prouve.
     `COUCHE_AMPUTEE` recouvre l'Elfe par un `add` qui ne garde que la prose. */
  const h = makeHarness({ extra: COUCHE_AMPUTEE });
  const out = h.verbs.rebuild({ document: sansOverrides(h.layers) });

  assert.deepEqual(out.resolved.traits, [],
    "aucun trait n'est fabriqué depuis `description` : ce serait la fiche fausse que le contrat interdit");
  const entree = out.underived.find((entry) => entry.field === "traits (espèce)");
  assert.ok(entree, "et la liste vide ne reste pas muette — une liste vide muette ressemble à une réponse");
  /* REWRITTEN 2026-08-13 (lot 41) — `.reason` → `{key, params}` ; la clef
     PRÉCISE remplace le motif de phrase, `renderUnderived` porte le contrôle
     de longueur (le mot doit encore dire quelque chose, pas juste exister). */
  assert.equal(entree.key, "underived.species-missing-traits");
  assert.match(renderUnderived(entree, frUnderived), /\{id, name, text\}/, "la raison nomme la FORME attendue par le contrat §5");
  assert.ok(renderUnderived(entree, frUnderived).length > 40);

  /* ET LE PENDANT, SUR LA VRAIE MATIÈRE : les cinq traits sont là, et rien ne
     les déclare. Sans ce second bout, le test ne prouverait que « une couche
     amputée ne dérive rien », ce qui est vrai de n'importe quel champ. */
  const vraie = makeHarness();
  const bon = vraie.verbs.rebuild({ document: acceptanceDocument(vraie.layers) });
  assert.equal(bon.resolved.traits.length, 5);
  assert.equal(bon.underived.some((entry) => entry.field === "traits (espèce)"), false);
});

test("un outil sans `ability_key` est SAUTÉ et NOMMÉ — jamais émis à moitié", () => {
  /* REWRITTEN 2026-08-08 (fusion du lot 8) — `tool.ability_key` est arrivé,
     25 outils sur 25. L'ancienne version prouvait le refus par l'absence du
     champ dans la vraie couche ; elle prouverait maintenant le contraire.
     L'outil est donc amputé DÉLIBÉRÉMENT — la garantie ne se relâche pas parce
     que la source s'est enrichie. */
  const h = makeHarness({
    extra: uneCouche("scenario-outil-sans-clef",
      ampute("tool", "srd:tool:fr:materiel-de-calligraphe", "Matériel de calligraphe",
        { ability: "Dextérité", cost: "10 po" }))
  });
  const out = h.verbs.rebuild({ document: sansOverrides(h.layers) });
  assert.deepEqual(out.resolved.tools, [],
    "`resolved.tools[].ability` est obligatoire : on ne pose pas une entrée à moitié");
  const entree = out.underived.find((e) => e.field === "tools[materiel-de-calligraphe]");
  /* REWRITTEN 2026-08-13 (lot 41) — `.reason` → `{key, params}`. */
  assert.match(renderUnderived(entree, frUnderived), /ability_key/);

  /* Et le pendant, sur la vraie matière : l'outil EST dérivé, avec son bonus. */
  const vraie = makeHarness();
  const bon = vraie.verbs.rebuild({ document: acceptanceDocument(vraie.layers) });
  assert.deepEqual(bon.resolved.tools, [{
    id: "materiel-de-calligraphe", name: "Matériel de calligraphe",
    ability: "dex", bonus: 4, proficiency: "proficient"
  }]);
});

/* ── la classe d'armure, avec et sans armure ────────────────────────── */

test("la CA avec armure, et son refus platement quand le champ mécanique manque", () => {
  const h = makeHarness();
  const base = acceptanceDocument(h.layers);
  /* La première place libre après le sac du fichier — lue, jamais supposée : un
     indice en dur se décalerait le jour où l'exemple gagne une ligne. */
  const index = base.build.choices
    .map((choice) => /^gear\[([0-9]+)\]$/.exec(choice.path))
    .filter(Boolean)
    .reduce((max, match) => Math.max(max, Number(match[1]) + 1), 0);

  const habiller = (doc) => {
    doc.build.choices.push(
      { path: `gear[${index}]`, ref: { kind: "armor", id: "srd:armor:fr:armure-de-cuir" } },
      { path: `gear[${index}].quantity`, value: 1 },
      { path: `gear[${index}].equipped`, value: true },
      { path: `gear[${index + 1}]`, ref: { kind: "armor", id: "srd:armor:fr:bouclier" } },
      { path: `gear[${index + 1}].quantity`, value: 1 },
      { path: `gear[${index + 1}].equipped`, value: true }
    );
    return doc;
  };

  const out = h.verbs.rebuild({ document: habiller(structuredClone(base)) });
  assert.equal(out.resolved.ac, 15, "cuir 11 + Dex 2 (sans plafond) + bouclier 2 — arbitrage B4 : « +2 » est un modificateur");

  /* REWRITTEN 2026-08-08 (fusion du lot 8) — `ac_base` est arrivé, donc la
     seconde moitié de ce test ne peut plus s'appuyer sur son absence dans la
     vraie couche. Les deux armures sont amputées DÉLIBÉRÉMENT : il ne leur
     reste que « 11 + modificateur de Dex » et « +2 », des PHRASES. Rendre
     10 + Dex avec une armure sur le dos serait une fiche fausse ET jouable,
     le pire des deux. */
  const nu = makeHarness({
    extra: uneCouche("scenario-armures-sans-ca", Object.assign(
      ampute("armor", "srd:armor:fr:armure-de-cuir", "Armure de cuir", { armor_class: "11 + modificateur de Dex" }),
      ampute("armor", "srd:armor:fr:bouclier", "Bouclier", { armor_class: "+2" })
    ))
  });
  const doc = habiller(acceptanceDocument(nu.layers));
  doc.build.overrides = [];
  const degrade = nu.verbs.rebuild({ document: doc });
  assert.equal(degrade.resolved.ac, undefined);
  /* REWRITTEN 2026-08-13 (lot 41) — `.reason` → `{key, params}`. */
  const acEntry = degrade.underived.find((e) => e.field === "ac");
  assert.equal(acEntry.key, "underived.armor-missing-ac-fields");
  assert.match(renderUnderived(acEntry, frUnderived), /ac_base/);
  assert.match(renderUnderived(acEntry, frUnderived), /fiche fausse/);
});

/* ── les overrides ──────────────────────────────────────────────────── */

test("un override dans le vide JETTE — il tweake ce qui existe, il ne crée rien", () => {
  const h = makeHarness();
  const doc = acceptanceDocument(h.layers);
  doc.build.overrides = [{ path: "resolved.vitals.hpTemporaire", value: 3, by: "gm" }];
  assert.throws(() => h.verbs.rebuild({ document: doc }), (error) => {
    assert.match(error.message, /resolved\.vitals\.hpTemporaire/);
    assert.match(error.message, /il ne fabrique pas la case qui manque/);
    return true;
  });

  doc.build.overrides = [{ path: "resolved.skills[voltige].bonus", value: 9, by: "gm" }];
  assert.throws(() => h.verbs.rebuild({ document: doc }), /resolved\.skills\[voltige\]/);
});

test("QUESTION 6 — LA DISSOLUTION ANNONCÉE A EU LIEU, et la règle stricte mord toujours", () => {
  /* REWRITTEN 2026-08-08 (fusion du lot 8) — ce test montrait une TENSION ;
     il montre maintenant sa RÉSOLUTION, et l'ancienne assertion est devenue
     fausse mot pour mot.

     Il disait : le personnage d'exemple porte `resolved.vitals.hpMax = 9` en
     override du MJ, la couche ne portait pas `hit_die`, la dérivation ne
     produisait pas `hpMax`, et l'override — qui ne fabrique aucune case —
     jetait. Deux phrases de l'architecture s'affrontaient.

     L'arbitrage a tenu la règle STRICTE et annoncé que la contradiction se
     dissoudrait d'elle-même dès que le lot 8 livrerait `hit_die`. C'est fait :
     `hpMax` EST dérivé, donc l'override tweake bien quelque chose qui existe.
     La prédiction est vérifiée ici plutôt que crue. */
  const h = makeHarness();
  const out = h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  assert.equal(out.resolved.vitals.hpMax, 9, "l'override du MJ s'applique — plus aucun refus");
  assert.deepEqual(out.overridesApplied.map((entry) => entry.path),
    ["resolved.vitals.hpMax", "resolved.gear[torche].quantity"]);

  /* ET LA RÈGLE STRICTE N'A PAS ÉTÉ RELÂCHÉE POUR AUTANT. Sur une couche
     amputée de `hit_die`, `hpMax` redevient non dérivé — et le même override
     jette de nouveau, en nommant sa cible. C'est la garantie qu'on aurait
     perdue en assouplissant : elle est reprouvée, pas supposée. */
  const nu = makeHarness({ extra: COUCHE_AMPUTEE });
  assert.throws(() => nu.verbs.rebuild({ document: acceptanceDocument(nu.layers) }), (error) => {
    assert.match(error.message, /resolved\.vitals\.hpMax/);
    assert.match(error.message, /que la dérivation n'a pas produit/);
    return true;
  });
  const sans = nu.verbs.rebuild({ document: sansOverrides(nu.layers) });
  assert.equal(sans.resolved.vitals.hpMax, undefined);
  assert.ok(sans.underived.some((entry) => entry.field === "vitals.hpMax"));
});

test("le verbe `override` exige de savoir QUI a écarté la règle", () => {
  const h = makeHarness();
  h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  assert.throws(() => h.verbs.override({ path: "resolved.ac", value: 18 }), /"player" ou "gm"/);
  assert.throws(() => h.verbs.override({ path: "resolved.ac", value: 18, by: "mj" }), /"player" ou "gm"/);
  const out = h.verbs.override({ path: "resolved.ac", value: 18, by: "gm", note: "armure prêtée" });
  assert.deepEqual(out.override, { path: "resolved.ac", replaced: false, kind: "override" });
  assert.equal(h.verbs.rebuild({}).resolved.ac, 18);
});

/* ── `clear`, le sixième verbe : ENLEVER une décision ─────────────────
   Lot 26. Sans lui, une décision posée ou un override levé par erreur ne
   pouvait plus être RETIRÉ, seulement remplacé — un joueur ne pouvait pas
   changer d'avis, et un MJ qui avait forcé une valeur par erreur ne pouvait
   plus la lever. */

test("`clear` retire un CHOIX — son effet disparaît de la fiche reconstruite", () => {
  const h = makeHarness();
  h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  assert.equal(h.verbs.rebuild({}).resolved.skills.find((skill) => skill.id === "religion").proficiency,
    "proficient", "avant : le second choix de compétence de la classe est posé");

  const out = h.verbs.clear({ path: "class.skills[1]", kind: "choice" });
  assert.deepEqual(out.cleared, { path: "class.skills[1]", kind: "choice", removed: true });
  assert.equal(out.document.build.choices.some((choice) => choice.path === "class.skills[1]"), false);

  const rebuilt = h.verbs.rebuild({});
  assert.equal(rebuilt.resolved.skills.find((skill) => skill.id === "religion").proficiency, "none",
    "le choix retiré ne nourrit plus la dérivation — la parole du joueur est réversible");
});

test("`clear` lève un OVERRIDE — la valeur revient à celle des règles", () => {
  const h = makeHarness();
  const avecOverride = h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  assert.equal(avecOverride.resolved.vitals.hpMax, 9, "l'override du MJ tient d'abord");

  const out = h.verbs.clear({ path: "resolved.vitals.hpMax", kind: "override" });
  assert.deepEqual(out.cleared, { path: "resolved.vitals.hpMax", kind: "override", removed: true });
  assert.equal(out.document.build.overrides.some((override) => override.path === "resolved.vitals.hpMax"), false);

  const rebuilt = h.verbs.rebuild({});
  assert.equal(rebuilt.resolved.vitals.hpMax, 8, "« la parole du MJ bat le JSON » — jusqu'à ce qu'elle soit levée");
});

test("`clear` ne touche pas l'AUTRE collection — un override et un choix au même chemin cohabitent", () => {
  const h = makeHarness();
  h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  // Les deux grammaires de chemin acceptent « resolved.ac » — un choix ET un override peuvent porter EXACTEMENT le même chemin.
  h.verbs.set({ path: "resolved.ac", value: 99 });
  h.verbs.override({ path: "resolved.ac", value: 18, by: "gm" });
  const avant = h.verbs.rebuild({}).document;
  assert.equal(avant.build.choices.some((choice) => choice.path === "resolved.ac"), true);
  assert.equal(avant.build.overrides.some((override) => override.path === "resolved.ac"), true);

  const out = h.verbs.clear({ path: "resolved.ac", kind: "override" });
  assert.equal(out.document.build.overrides.some((override) => override.path === "resolved.ac"), false,
    "l'override a disparu");
  assert.equal(out.document.build.choices.some((choice) => choice.path === "resolved.ac"), true,
    "le choix du MÊME chemin, dans l'AUTRE collection, n'a pas bougé — `clear` nomme sa cible, il ne devine pas");
});

test("`clear` sur un chemin ABSENT n'est pas un refus — `removed` le dit, comme `replaced` le dit pour `choose`/`set`/`override`", () => {
  const h = makeHarness();
  h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  // Aucun override ne porte « resolved.ac » dans le document d'acceptation.
  const out = h.verbs.clear({ path: "resolved.ac", kind: "override" });
  assert.deepEqual(out.cleared, { path: "resolved.ac", kind: "override", removed: false });
  assert.deepEqual(out.document.build.overrides, h.verbs.rebuild({}).document.build.overrides,
    "rien n'a bougé : une interface qui nettoie plusieurs chemins d'un coup n'a rien à se faire reprocher");
});

test("`clear` exige un `kind` NOMMÉ — jamais une collection devinée", () => {
  const h = makeHarness();
  h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  assert.throws(() => h.verbs.clear({ path: "species" }), /"choice" ou "override"/);
  assert.throws(() => h.verbs.clear({ path: "species", kind: "record" }), /"choice" ou "override"/);
});

test("`clear` vérifie le chemin À L'ENTRÉE, comme `place()` — un chemin mal formé est refusé au geste, pas à la reconstruction", () => {
  const h = makeHarness();
  h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  assert.throws(() => h.verbs.clear({ path: "Class.skills", kind: "choice" }), /chemin de choix mal formé/);
  assert.throws(() => h.verbs.clear({ path: "class.__proto__", kind: "choice" }), /clef interdite/);
  assert.throws(() => h.verbs.clear({ path: "ac", kind: "override" }), /chemin d'override mal formé/);
  assert.throws(() => h.verbs.clear({ path: "resolved.skills[0].bonus", kind: "override" }), /jamais par un index/);
});

test("`clear` ne fait PAS suivre `rebuild` — symétrique de `choose`/`set`/`override`", () => {
  const h = makeHarness();
  h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  h.dispatched.length = 0;
  h.verbs.clear({ path: "resolved.vitals.hpMax", kind: "override" });
  assert.deepEqual(h.dispatched, [], "`clear` ne lit même pas la pile — aucune route empruntée");
});

/* ── l'état de jeu ──────────────────────────────────────────────────── */

test("UNE RECONSTRUCTION NE SOIGNE PERSONNE — l'état de jeu traverse le pli", () => {
  const h = makeHarness();
  const premier = h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  assert.equal(premier.resolved.vitals.hpCurrent, 9, "un personnage neuf part en pleine forme, APRÈS les overrides");

  // La table joue : cinq points de dégâts, un emplacement dépensé, un état posé.
  const blesse = structuredClone(premier.document);
  blesse.resolved.vitals.hpCurrent = 4;
  blesse.resolved.vitals.tempHp = 2;
  blesse.resolved.vitals.conditions = ["exhaustion-1"];
  blesse.resolved.spellcasting.slots["1"].current = 1;

  const second = h.verbs.rebuild({ document: blesse });
  assert.equal(second.resolved.vitals.hpCurrent, 4, "le MJ corrige la fiche, il ne rend pas les points de vie");
  assert.equal(second.resolved.vitals.tempHp, 2);
  assert.deepEqual(second.resolved.vitals.conditions, ["exhaustion-1"]);
  assert.deepEqual(second.resolved.spellcasting.slots["1"], { max: 2, current: 1 });
  assert.equal(second.resolved.vitals.hpMax, 9, "et le maximum, lui, est bien re-dérivé");
});

/* ── l'événement et son diff ────────────────────────────────────────── */

test("`char-rebuilt` porte un diff en chemins d'OVERRIDE, jamais en index", () => {
  const h = makeHarness();
  h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  const premier = h.bus.last("char-rebuilt");
  assert.ok(premier.diff.length > 0, "la première construction change tout");
  assert.ok(premier.diff.every((change) => change.path.startsWith("resolved.")));

  // Une décision change : un seul chemin bouge, et il est recopiable tel quel.
  h.verbs.set({ path: "class.skills[1]", value: "nature" });
  const out = h.verbs.rebuild({});
  const event = h.bus.last("char-rebuilt");
  assert.deepEqual(event.diff.map((change) => change.path).filter((path) => path.includes("skills")), [
    "resolved.skills[nature].bonus",
    "resolved.skills[nature].proficiency",
    "resolved.skills[religion].bonus",
    "resolved.skills[religion].proficiency"
  ], "l'ancre est l'IDENTITÉ du record, pas sa place dans la liste");
  assert.equal(event.id, out.document.id);
  assert.deepEqual(event.stack, out.document.build.layers);
  assert.deepEqual(event.underived, out.underived);

  // Rejouer le même pli deux fois ne produit AUCUN changement : le pli est déterministe.
  const encore = h.verbs.rebuild({});
  assert.deepEqual(
    diffResolved(out.resolved, encore.resolved).filter((change) => change.path !== "resolved.derivation.at"),
    []
  );
});

test("le `shadowed` de la pile REMONTE dans rebuild — il ne s'avale pas", () => {
  /* Arbitrage n°2 de contracts/layers.md : « `shadowed` remonte dans le
     résultat de `rebuild` ». Le bloc ne va pas le chercher — il s'abonne à
     `layers-changed`, qui est le seul moyen de savoir. */
  const h = makeHarness();
  const out = h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  assert.deepEqual(out.shadowed, [], "aucune couche n'en recouvre une autre dans cette pile");
  assert.deepEqual(out.warnings, [], "et l'événement a bien été reçu");

  /* Et quand il y en a un : une couche de table repose, par `add`, un record
     que le SRD portait déjà. */
  const bytes = Buffer.from(JSON.stringify({
    schema: "fh-layer/1", id: "couche-de-table", version: "1.0.0", name: "Table", lang: "fr",
    flags: [], attribution: { license: "CC0-1.0" },
    records: { skill: { "srd:skill:fr:perception": { op: "add", name: "Perception", slug: "perception", data: { ability_key: "wis" } } } }
  }), "utf8");
  h.layers.verbs.register({ bytes, origin: "test" });
  const doc = acceptanceDocument(h.layers);
  const apres = h.verbs.rebuild({ document: doc });
  assert.deepEqual(apres.shadowed, [{ kind: "skill", id: "srd:skill:fr:perception", by: "couche-de-table", over: "srd-5.2.1-fr" }]);
});

/* ── `validate` ─────────────────────────────────────────────────────── */

test("`validate` compte les compétences à choisir, et refuse un boost illégal", () => {
  const h = makeHarness();
  h.verbs.rebuild({ document: sans(h.layers, ["class.skills[1]"]) });
  let verdict = h.verbs.validate({});
  assert.equal(verdict.ok, false);
  assert.ok(verdict.violations.some((line) => /« class » fait choisir 2 compétence\(s\) et les choix en désignent 1/.test(line)));

  h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  h.verbs.set({ path: "background.boost.str", value: 2 });
  verdict = h.verbs.validate({});
  assert.ok(verdict.violations.some((line) => /background\.boost\.str/.test(line) && /ne nomme pas/.test(line)),
    "l'arrière-plan Sage nomme con, int et wis — pas str");
});

test("`validate` voit un ref mort, un don qui ne correspond pas, et ne change RIEN", () => {
  const h = makeHarness();
  const doc = acceptanceDocument(h.layers);
  const avant = structuredClone(doc);
  h.verbs.choose({ document: doc, path: "class.cantrips[0]", ref: { kind: "spell", id: "srd:spell:fr:sort-fantome" } });
  let verdict = h.verbs.validate({});
  assert.ok(verdict.violations.some((line) => /srd:spell:fr:sort-fantome/.test(line)));

  h.verbs.rebuild({ document: structuredClone(avant) });
  h.verbs.choose({ path: "background.feat", ref: { kind: "feat", id: "exemple:feat:fr:lecteur-de-marges" } });
  verdict = h.verbs.validate({});
  assert.ok(verdict.violations.some((line) => /background\.feat/.test(line) && /initie-a-la-magie/.test(line)));

  // `validate` n'écrit rien : le `resolved` du document n'a pas bougé.
  const apres = h.verbs.validate({});
  assert.deepEqual(apres, verdict);
});

/* ── la loi §0.12 : le SRD seul ─────────────────────────────────────── */

test("UN PERSONNAGE SRD PUR, SANS AUCUNE COUCHE FH, TRAVERSE LA DÉRIVATION DE BOUT EN BOUT", () => {
  /* La question de la loi §0.12, posée au code : « un personnage SRD pur,
     sans aucune couche FH chargée, traverse-t-il ce code de bout en bout ? »
     Ici, même pas de couche d'exemple : la couche SRD, et rien d'autre. Aucune ligne de `src/build/` ne cite la Destinée, le Chaos ni
     l'Overreach — c'est le garde de vocabulaire de `build-block` qui le tient
     structurellement ; celui-ci le tient à l'exécution. */
  const h = makeHarness({ layers: [SRD_FR] });
  const exemple = readJson("examples/personnage-srd-fr-niveau1.fh-char.json");

  /* On retire du personnage d'exemple TOUT ce qui vient de la couche
     homebrew — et les lignes d'équipement qui en dépendent avec, sans quoi un
     `gear[8].quantity` resterait orphelin de son `gear[8]`. */
  const horsSrd = new Set(exemple.build.choices
    .map((choice) => (choice.ref && !choice.ref.id.startsWith("srd:") ? /^(gear\[[0-9]+\])$/.exec(choice.path) : null))
    .filter(Boolean).map((match) => match[1]));
  const choices = exemple.build.choices
    .filter((choice) => !choice.ref || choice.ref.id.startsWith("srd:"))
    .filter((choice) => !choice.path.startsWith("feat."))
    .filter((choice) => ![...horsSrd].some((prefix) => choice.path.startsWith(prefix)));

  const doc = {
    schema: "fh-char/1", id: "srd-pur", name: "SRD pur", lang: "fr",
    units: exemple.units, created: exemple.created, modified: exemple.modified,
    build: { layers: manifestOf(h.layers), choices, budgets: {}, overrides: [] }
  };
  const out = h.verbs.rebuild({ document: doc });
  assert.equal(out.resolved.proficiency, 2);
  assert.equal(out.resolved.vitals.hpMax, 8, "sans l'override du MJ : d6 + Constitution 2");
  assert.equal(out.resolved.skills.length, 18);
  assert.equal(out.resolved.spellcasting.dc, 13);
  assert.equal(out.resolved.spellcasting.spells.length, 7, "les sept sorts SRD, sans le sort mineur du homebrew");
  assert.deepEqual(h.layers.verbs.flags(), [], "aucun drapeau de couche n'est levé");
  assert.equal(validateChar(out.document), true, ajv.errorsText(validateChar.errors));
});

/* ── choose / set, les deux moitiés d'une règle du schéma ───────────── */

test("`choose` pose un record, `set` pose un scalaire — jamais les deux, jamais aucun", () => {
  const h = makeHarness();
  const doc = acceptanceDocument(h.layers);
  assert.throws(() => h.verbs.choose({ document: doc, path: "class", value: "magicien" }), /pour un scalaire, c'est `set`/);
  assert.throws(() => h.verbs.set({ path: "class", ref: { kind: "class", id: "x" } }), /pour un record, c'est `choose`/);
  assert.throws(() => h.verbs.set({ path: "class", value: { kind: "class" } }), /une structure serait une règle déguisée/);
  assert.throws(() => h.verbs.choose({ path: "class", ref: { kind: "class", id: "x" }, value: 1 }), /exactement un/);

  // Une décision REMPLACE la précédente sur le même chemin.
  const out = h.verbs.set({ path: "abilities.str", value: 12 });
  assert.equal(out.choice.replaced, true);
  assert.equal(out.document.build.choices.filter((choice) => choice.path === "abilities.str").length, 1);
  assert.equal(h.verbs.rebuild({}).resolved.abilities.str.score, 12);

  /* Un chemin mal formé est refusé À L'ENTRÉE, là où le geste a lieu — pas
     à la reconstruction, loin de la main qui l'a écrit. */
  assert.throws(() => h.verbs.set({ path: "Class.skills", value: "x" }), /chemin de choix mal formé/);
  assert.throws(() => h.verbs.set({ path: "class.__proto__", value: "x" }), /clef interdite/);
  assert.throws(() => h.verbs.override({ path: "ac", value: 1, by: "gm" }), /chemin d'override mal formé/);
  assert.throws(() => h.verbs.override({ path: "resolved.skills[0].bonus", value: 1, by: "gm" }),
    /jamais par un index/);
});

test("le bloc rend des COPIES : l'appelant ne tient jamais l'objet du bloc", () => {
  const h = makeHarness();
  const entree = acceptanceDocument(h.layers);
  const out = h.verbs.rebuild({ document: entree });
  assert.equal(entree.resolved, undefined, "le document d'entrée n'a pas été mué");

  out.document.resolved.ac = 99;
  out.resolved.proficiency = 99;
  const encore = h.verbs.rebuild({});
  assert.equal(encore.resolved.proficiency, 2, "mutiler ce qu'on a reçu ne corrompt pas la tranche du bloc");
});
