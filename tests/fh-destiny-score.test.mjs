/* ══ LES TESTS D'ACCEPTATION DU LOT 19 — LE SCORE DE DESTINÉE ═════════
   `resolved.stats[]` avait sa place au schéma depuis le 2026-08-08, et
   personne ne la remplissait. Cette suite dit si le lot a réussi.

   TROIS TESTS, et le deuxième est celui qui compte :

   1. Un personnage AVEC LA COUCHE FH montée porte `fh:destiny`, dont le
      `value` égale la somme de son détail, maîtrise et Base d'espèce nommées
      ligne à ligne.
   2. Le même personnage, deux choix `fh.destiny.glory[…]` posés, RECONSTRUIT
      DEUX FOIS DE SUITE : la Gloire et sa motivation sont toujours là, texte
      intact. C'est la preuve que les termes de séance survivent au `rebuild`,
      et c'est la raison d'être du lot — `resolved` n'est écrit que par la
      dérivation (invariant n°1), donc un terme posé ailleurs que dans `build`
      serait effacé au premier pli et le Score reviendrait faux sans dire de
      combien.
   3. Un personnage SRD PUR rend `stats: []` — pas d'entrée fantôme, et le
      chemin commun ne cite jamais la Destinée (loi §0.12).

   Plus LE GARDE DE LA SOMME, ATTAQUÉ : un invariant écrit et jamais violé
   pour de bon ne vaut pas ce qu'il coûte.

   ⚠️ AUCUNE ÉCRITURE HORS MÉMOIRE. `layers/` est un artefact commité et
   `tests/tree-immuable.test.mjs` rejoue toute la suite entre deux relevés de
   l'arbre : les couches amputées de cette suite sont FABRIQUÉES en mémoire et
   montées par-dessus, jamais posées sur le disque. */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";

import { ROOT, SRD_EN, FH_SPECIES_EN, makeHarness, manifestOf, uneCouche } from "./build-harness.mjs";
import { createFhDestinyStat, FH_DESTINY_FLAG, FH_DESTINY_ID } from "../src/modules/fh/destiny-stat.mjs";
import { statSumViolations } from "../src/build/validate.mjs";

const ajv = new Ajv2020({ strict: true, allErrors: true });
const validateChar = ajv.compile(JSON.parse(readFileSync(join(ROOT, "schemas/fh-char.schema.json"), "utf8")));

/* ── LE PERSONNAGE FH ────────────────────────────────────────────────
   Une elfe magicienne de niveau 1. L'ELFE N'EST PAS UN GOÛT : c'est la seule
   des douze espèces qui porte un `base_bonus`, donc la seule qui prouve les
   DEUX LIGNES de Base.

   NIVEAU 1, et c'est mesuré : au-delà, la progression des points de vie n'est
   portée par aucun champ mécanique du contrat, `vitals.hpMax` est donc ABSENT
   (à raison), et le document ne passerait plus `fh-char/1` — or c'est cette
   validation qui prouve que l'ancre `fh:destiny` est adressable et pas
   seulement plausible. Le prix : la maîtrise vaut 2 comme la Base. Les
   assertions portent donc sur le détail LIGNE À LIGNE, jamais sur le seul
   total, et un test dédié plus bas monte au niveau 5 pour voir la ligne de
   maîtrise suivre `resolved.proficiency` au lieu d'être une constante. */
const CHOIX_DE_BASE = [
  { path: "level", value: 1, label: "Level 1" },
  { path: "class", ref: { kind: "class", id: "srd:class:en:wizard" }, label: "Wizard" },
  { path: "species", ref: { kind: "species", id: "srd:species:en:elf" }, label: "Elf" },
  /* Les maîtrises que les sources font CHOISIR. Elles ne servent pas le Score,
     elles servent `validate` : une source qui déclare `{count}` et n'en reçoit
     pas autant est une violation préexistante, et elle masquerait la nôtre. */
  { path: "species.keenSenses", value: "survival", label: "Keen Senses: Survival" },
  { path: "class.skills[0]", value: "arcana", label: "Arcana" },
  { path: "class.skills[1]", value: "investigation", label: "Investigation" },
  { path: "abilities.str", value: 8 },
  { path: "abilities.dex", value: 14 },
  { path: "abilities.con", value: 12 },
  { path: "abilities.int", value: 16 },
  { path: "abilities.wis", value: 12 },
  { path: "abilities.cha", value: 10 },
  { path: "currency.cp", value: 0 },
  { path: "currency.sp", value: 0 },
  { path: "currency.gp", value: 25 },
  { path: "currency.pp", value: 0 }
];

function pileFH(options = {}) {
  return makeHarness(Object.assign({
    layers: [SRD_EN, FH_SPECIES_EN],
    modules: [createFhDestinyStat()]
  }, options));
}

function documentFH(h, choices = []) {
  return {
    schema: "fh-char/1",
    id: "lot19-ilyra",
    name: "Ilyra",
    lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/fh-destiny-score", version: "1.0.0" },
    created: "2026-08-08T09:00:00Z",
    modified: "2026-08-08T09:00:00Z",
    build: {
      layers: manifestOf(h.layers),
      choices: structuredClone(CHOIX_DE_BASE).concat(structuredClone(choices)),
      budgets: {},
      overrides: []
    }
  };
}

const scoreDe = (resolved) => resolved.stats.find((stat) => stat.id === FH_DESTINY_ID);
const somme = (stat) => stat.breakdown.reduce((total, line) => total + line.value, 0);

/* ══ ACCEPTATION 1 ════════════════════════════════════════════════════ */

test("ACCEPTATION 1 — la couche FH montée, le Score est publié et son total se démontre", () => {
  const h = pileFH();
  const out = h.verbs.rebuild({ document: documentFH(h) });
  const stat = scoreDe(out.resolved);

  assert.ok(stat, "`resolved.stats[]` porte l'entrée du Score de Destinée");
  assert.equal(stat.flag, FH_DESTINY_FLAG, "elle NOMME le drapeau qui l'a activée");
  assert.equal(stat.name, "Destiny Score", "et son nom vient du paquet de mots de la couche, pas du moteur");

  /* LES DEUX TERMES DÉRIVABLES, LIGNE À LIGNE. La Base et son bonus sont DEUX
     lignes et pas une addition : le bonus a une source nommée, et l'écraser
     dans la base perdrait pourquoi il est là. */
  assert.deepEqual(stat.breakdown, [
    { label: "Proficiency Bonus", value: 2 },
    { label: "Destiny Base · Elf", value: 2, source: { kind: "species", id: "srd:species:en:elf" } },
    { label: "Splinter of Anon", value: 2, source: { kind: "species", id: "srd:species:en:elf" } }
  ]);
  /* Le libellé du bonus EST le nom du trait, recopié du record — aucun mot
     fabriqué par le moteur (loi §0.13). */
  const trait = h.layers.verbs.query({ kind: "species", id: "srd:species:en:elf" }).record.data.fh_traits
    .find((item) => item.id === "splinter-of-anon");
  assert.equal(stat.breakdown[2].label, trait.name, "le mot vient du record, il n'est pas composé ici");

  assert.equal(stat.value, 6, "2 de maîtrise + 2 de Base + 2 du Splinter of Anon");
  assert.equal(stat.value, somme(stat), "et `value` EST la somme de son détail");
  assert.equal(out.resolved.proficiency, 2, "la maîtrise du terme est bien celle que le pli a dérivée");
  assert.equal(stat.breakdown[0].source, undefined,
    "la maîtrise n'a PAS de `source` : aucun record ne la porte, et lui en inventer une mentirait sur son origine");

  /* Le document reconstruit VALIDE contre `fh-char/1` — c'est ce qui prouve
     que l'id choisi est adressable, pas seulement plausible. */
  assert.equal(validateChar(out.document), true, ajv.errorsText(validateChar.errors));
  assert.equal(h.verbs.validate({ document: out.document }).ok, true, "et `validate` n'y trouve rien à redire");
});

test("LA LIGNE DE MAÎTRISE SUIT `resolved.proficiency` — ce n'est pas une constante", () => {
  /* Au niveau 5 le bonus de maîtrise passe à 3. Si la ligne restait à 2, elle
     serait un nombre écrit dans le module, pas un terme dérivé — et rien dans
     le total du niveau 1 ne l'aurait montré, les trois termes y valant 2.
     ⚠️ Ce document n'est PAS validé contre `fh-char/1` : au-delà du niveau 1,
     `vitals.hpMax` n'est dérivable d'aucun champ mécanique du contrat. */
  const h = pileFH();
  const document = documentFH(h);
  document.build.choices.find((choice) => choice.path === "level").value = 5;
  const out = h.verbs.rebuild({ document });
  assert.equal(out.resolved.proficiency, 3);
  const stat = scoreDe(out.resolved);
  assert.deepEqual(stat.breakdown[0], { label: "Proficiency Bonus", value: 3 });
  assert.equal(stat.value, 7, "3 + 2 + 2");
  assert.equal(stat.value, somme(stat));
});

test("CE QUI N'EST DÉRIVABLE DE RIEN EST DÉCLARÉ — jamais fabriqué", () => {
  const h = pileFH();
  const out = h.verbs.rebuild({ document: documentFH(h) });
  const champs = out.underived.map((entry) => entry.field);

  /* LES TROIS TERMES SANS SOURCE DE RÈGLE. Chacun est nommé, chacun dit
     pourquoi. La mesure derrière eux : la couche FH ne porte QUE le genre
     `species` — aucun don FH, aucun Arcane — et le genre `arcana` n'existe pas
     dans l'énumération des 14 genres (trou GAP-KIND, toujours ouvert). */
  for (const champ of [`stats[${FH_DESTINY_ID}].arcana`, `stats[${FH_DESTINY_ID}].feat`, `stats[${FH_DESTINY_ID}].other`]) {
    assert.ok(champs.includes(champ), `« ${champ} » doit être DÉCLARÉ, pas inventé`);
    assert.ok(out.underived.find((entry) => entry.field === champ).reason.length > 40,
      `« ${champ} » doit dire POURQUOI, pas seulement QUOI`);
  }
  assert.match(out.underived.find((entry) => entry.field === `stats[${FH_DESTINY_ID}].arcana`).reason,
    /GAP-KIND/, "l'Arcane majeur renvoie au trou nommé, pas à une excuse");

  /* LA MESURE, VÉRIFIÉE PLUTÔT QUE CRUE : la pile ne porte réellement aucun
     genre `arcana`, et la couche FH n'ajoute aucun `feat`. Le jour où l'un des
     deux entre, ce test rougit et la déclaration doit être levée. */
  assert.throws(() => h.layers.verbs.query({ kind: "arcana" }),
    "le genre `arcana` n'existe pas dans les 14 genres — c'est le trou GAP-KIND");
  const couche = JSON.parse(readFileSync(join(ROOT, FH_SPECIES_EN), "utf8"));
  assert.deepEqual(Object.keys(couche.records), ["species"],
    "la couche FH ne porte QUE le genre `species` — pas un don, pas un Arcane");

  // Et `stats` n'est PAS déclaré non dérivé : un module l'a nourri.
  assert.equal(champs.includes("stats"), false, "la collection n'est plus vide, donc elle n'est plus déclarée");
});

/* ══ ACCEPTATION 2 — CELUI QUI COMPTE ═════════════════════════════════ */

test("ACCEPTATION 2 — la Gloire et sa motivation SURVIVENT à deux reconstructions de suite", () => {
  const h = pileFH();
  /* Deux termes de séance, dont un NÉGATIF : la Gloire est UN terme signé,
     jamais deux quantités — le négatif est la Damnation. */
  const gloire = [
    { path: "fh.destiny.glory[0]", value: 1, label: "+1 Glory, saved the region from destruction" },
    { path: "fh.destiny.glory[1]", value: -1, label: "-1 Damnation, let the caravan burn to reach the gate" }
  ];

  const un = h.verbs.rebuild({ document: documentFH(h, gloire) });
  const deux = h.verbs.rebuild({ document: un.document });
  const trois = h.verbs.rebuild({ document: deux.document });

  for (const [rang, out] of [["premier", un], ["deuxième", deux], ["troisième", trois]]) {
    const stat = scoreDe(out.resolved);
    const termes = stat.breakdown.filter((line) => line.by === "gm");
    assert.equal(termes.length, 2, `${rang} pli : les deux termes de séance sont là`);
    /* LE TEXTE INTACT, mot pour mot. C'est lui qui se lit à la table, et c'est
       lui qui rend le terme contestable — un `+1` sans sa motivation ne peut
       être ni discuté ni corrigé (règle d'Eric, 2026-08-08). */
    assert.equal(termes[0].label, "+1 Glory, saved the region from destruction");
    assert.equal(termes[1].label, "-1 Damnation, let the caravan burn to reach the gate");
    assert.equal(termes[0].value, 1);
    assert.equal(termes[1].value, -1);
    assert.equal(termes[0].by, "gm", "la Gloire est une décision de MJ, et on sait toujours de qui vient un terme discrétionnaire");
    assert.equal(stat.value, 6, `${rang} pli : 2 + 2 + 2 + 1 − 1`);
    assert.equal(stat.value, somme(stat), `${rang} pli : le total se démontre encore`);
  }

  /* CE QUI REND LA SURVIE POSSIBLE, et c'est le cœur du lot : les termes
     vivent dans `build.choices`, que la reconstruction RELIT et ne réécrit
     jamais (invariant n°2). Ils n'ont jamais été posés dans `resolved`. */
  assert.deepEqual(trois.document.build.choices.filter((choice) => choice.path.startsWith("fh.destiny.")), gloire,
    "les choix sont intacts, à l'octet près, après trois plis");
  assert.equal(validateChar(trois.document), true, ajv.errorsText(validateChar.errors));

  /* Et ils ne traînent pas en `unconsumed` : le module les a RÉCLAMÉS. Un
     choix qu'aucune règle ne consomme est signalé par `validate` comme ne
     changeant rien à la fiche — ce serait ici un faux témoignage. */
  assert.deepEqual(trois.unconsumed.filter((path) => path.startsWith("fh.")), []);
  assert.deepEqual(h.verbs.validate({ document: trois.document }).warnings
    .filter((line) => line.includes("fh.destiny.glory")), []);
});

test("L'ÉVEIL ARCANIQUE MAJEUR COMPTE, ET IL NE PORTE PAS DE `by` — les dés ne sont personne", () => {
  const h = pileFH();
  const out = h.verbs.rebuild({
    document: documentFH(h, [
      { path: "fh.destiny.awakening[0]", value: 1, label: "+1 The Empress, drawn at 0 Destiny Points on a natural 20" },
      { path: "fh.destiny.glory[0]", value: 2, label: "+2 Glory, broke the siege of Varithond" }
    ])
  });
  const stat = scoreDe(out.resolved);
  const eveil = stat.breakdown.find((line) => line.label.startsWith("+1 The Empress"));
  assert.equal(eveil.value, 1);
  assert.equal(eveil.by, undefined,
    "l'Éveil est décidé par les DÉS : lui coller un `by` désignerait un responsable là où il n'y en a pas");
  assert.equal(stat.breakdown.find((line) => line.by === "gm").value, 2, "la Gloire, elle, sait de qui elle vient");
  assert.equal(stat.value, 9, "2 + 2 + 2 + 1 + 2");
  assert.equal(stat.value, somme(stat));

  /* ⚠️ QUESTION 2 À L'ARCHITECTE, rendue visible par un test plutôt que
     décidée en silence : `settleAwakening` (src/modules/fh/index.mjs, §C) émet
     déjà un choix à enregistrer, et il ne porte NI ce chemin NI cette forme —
     `fh.awakenings[n]` avec l'id de la carte pour valeur. Les deux conventions
     ne se rejoignent pas, et le lot n'a pas le droit d'en changer une. Ce qui
     est garanti ici, c'est que l'écart ne se PERD pas : le choix du moteur de
     jeu tombe hors du namespace du module, donc il ressort `unconsumed` et
     `validate` dit qu'il ne change rien à la fiche. */
  const avecAncienneForme = h.verbs.rebuild({
    document: documentFH(h, [{ path: "fh.awakenings[0]", value: "the-empress", label: "The Empress" }])
  });
  assert.ok(avecAncienneForme.unconsumed.includes("fh.awakenings[0]"),
    "la forme émise par `settleAwakening` n'est pas lue par ce module — et elle est SIGNALÉE, pas avalée");
  assert.equal(scoreDe(avecAncienneForme.resolved).value, 6, "elle ne compte donc pas dans le Score, et c'est dit");
});

test("UN TERME DE SÉANCE MAL FORMÉ EST UN REFUS QUI LE NOMME — jamais une ligne ignorée", () => {
  const cas = [
    [{ path: "fh.destiny.glory[0]", value: 1 }, /carries no `label`/,
      "un +1 sans motivation ne peut être ni contesté ni corrigé"],
    [{ path: "fh.destiny.glory[0]", value: 1, label: "   " }, /carries no `label`/,
      "un libellé de blancs n'est pas une motivation"],
    [{ path: "fh.destiny.glory[0]", value: "one", label: "Glory" }, /whole\s+signed number/,
      "un terme est un NOMBRE signé, pas un mot"],
    [{ path: "fh.destiny.glory[0]", value: 1.5, label: "Glory" }, /whole\s+signed number/,
      "ni un demi-point"],
    [{ path: "fh.destiny.other[0]", value: 1, label: "Ring of Fate" }, /names the term "other"/,
      "la ligne « Other » n'a pas plus de source de règle que l'Arcane — elle se déclare, elle ne s'invente pas"],
    [{ path: "fh.destiny.glory", value: 1, label: "Glory" }, /is not a Destiny Score term/,
      "la forme est `<term>[n]`, et un chemin illisible est un refus"],
    [{ path: "fh.destiny[0]", value: 1, label: "Glory" }, /is not a Destiny Score term/,
      "le drapeau nu suivi d'un indice est dans le namespace, mais il ne nomme aucun terme"],
    [{ path: "fh.destiny.glory[0]", ref: { kind: "species", id: "srd:species:en:elf" } }, /carries a `ref`/,
      "aucun record de la pile ne porte un terme de séance"]
  ];
  for (const [choix, motif, pourquoi] of cas) {
    const h = pileFH();
    assert.throws(() => h.verbs.rebuild({ document: documentFH(h, [choix]) }), motif, pourquoi);
  }
});

test("DRAPEAU ÉTEINT, MODULE MUET — et les choix de séance le disent au lieu de disparaître", () => {
  /* La couche FH n'est PAS montée : le module est injecté, son drapeau n'est
     pas levé, il ne tourne pas (loi §0.6 — pas de code qui s'exécute derrière
     un interrupteur éteint). Les choix `fh.destiny.*` restent alors NON
     CONSOMMÉS, et `validate` dit qu'ils ne changent rien à la fiche. */
  const h = makeHarness({ layers: [SRD_EN], modules: [createFhDestinyStat()] });
  const out = h.verbs.rebuild({
    document: documentFH(h, [{ path: "fh.destiny.glory[0]", value: 1, label: "+1 Glory" }])
  });
  assert.deepEqual(out.resolved.stats, [], "aucune entrée fantôme");
  assert.ok(out.unconsumed.includes("fh.destiny.glory[0]"), "le choix est signalé, pas avalé");
  const declaration = out.underived.find((entry) => entry.field === "stats");
  assert.match(declaration.reason, /Drapeaux levés par la pile : aucun/);
  assert.match(declaration.reason, /Drapeaux servis par les modules injectés : fh\.destiny/,
    "les deux listes, pour qu'un module oublié se distingue d'une pile sans couche");
});

/* ══ ACCEPTATION 3 ════════════════════════════════════════════════════ */

test("ACCEPTATION 3 — un personnage SRD PUR rend `stats: []`, et rien ne cite la Destinée", () => {
  /* Aucune couche FH montée, AUCUN module injecté : c'est le pli SRD nu. */
  const h = makeHarness({ layers: [SRD_EN] });
  const out = h.verbs.rebuild({ document: documentFH(h) });

  assert.deepEqual(out.resolved.stats, [], "pas d'entrée fantôme");
  const declaration = out.underived.find((entry) => entry.field === "stats");
  assert.ok(declaration, "une collection vide se DÉCLARE (règle de refus n°2)");
  assert.match(declaration.reason, /Drapeaux servis par les modules injectés : aucun/);
  assert.equal(validateChar(out.document), true, ajv.errorsText(validateChar.errors));

  /* Le pendant du garde structurel : le bloc `build` ne peut pas importer
     `src/modules/` (interdit nommément dans tests/build-block.test.mjs), donc
     le Score n'atteint le pli que par injection. Ici, personne n'a injecté —
     et la fiche est complète sans lui. */
  assert.equal(out.resolved.identity.classes[0].name, "Wizard", "le personnage SRD est bel et bien construit");
  assert.equal(out.resolved.proficiency, 2);
});

/* ══ LE GARDE DE LA SOMME, ET SON ATTAQUE ════════════════════════════
   `$defs/resolved.stats[].value` écrit l'invariant et reconnaît que JSON
   Schema ne sait pas additionner. Écrit sans être exécuté, il ne serait
   qu'une INTENTION. Il est donc exécuté — et attaqué. */

test("ATTAQUE DU GARDE DE LA SOMME — une somme fausse est vue, nommée, et la restauration la rend verte", () => {
  /* 1. SUR LA FONCTION PURE, terme par terme. */
  const juste = { id: "x", flag: "a.b", name: "X", value: 5, breakdown: [{ label: "un", value: 2 }, { label: "deux", value: 3 }] };
  assert.deepEqual(statSumViolations({ stats: [juste] }), [], "un total démontré ne dit rien");

  const faux = structuredClone(juste);
  faux.value = 6;
  const vu = statSumViolations({ stats: [faux] });
  assert.equal(vu.length, 1, "une somme fausse est VUE");
  assert.match(vu[0], /resolved\.stats\[x\]/, "et la violation nomme l'entrée");
  assert.match(vu[0], /vaut 6.*somme à 5/, "elle donne les deux nombres, pas un verdict nu");
  assert.match(vu[0], /"un" = 2 ; "deux" = 3/, "et le détail qui la démontre");

  faux.value = 5;
  assert.deepEqual(statSumViolations({ stats: [faux] }), [], "restauré, l'arbre est vert : le garde ne crie pas au loup");

  // Les formes tordues sont NOMMÉES elles aussi, jamais avalées.
  assert.equal(statSumViolations({ stats: [{ id: "y", value: 0, breakdown: [] }] }).length, 1, "un détail vide");
  assert.equal(statSumViolations({ stats: [{ id: "y", value: 1, breakdown: [{ label: "l", value: "1" }] }] }).length, 1,
    "un terme qui ne s'additionne pas");
  assert.equal(statSumViolations({ stats: [null] }).length, 1, "une entrée qui n'est pas une statistique");
  assert.deepEqual(statSumViolations({}), [], "et l'absence de statistiques n'est pas une faute");

  /* 2. SUR LE VRAI CHEMIN. Un module qui publie un total que son propre détail
     contredit fait ÉCHOUER `rebuild` : le Score faux n'atteint jamais le
     document. C'est la fabrication délibérée que le kickoff exige. */
  const menteur = {
    flag: FH_DESTINY_FLAG,
    id: "faux:score",
    contribute: () => ({
      stat: { id: "faux:score", flag: FH_DESTINY_FLAG, name: "Menteur", value: 99, breakdown: [{ label: "un seul terme", value: 1 }] },
      underived: []
    })
  };
  const h = makeHarness({ layers: [SRD_EN, FH_SPECIES_EN], modules: [menteur] });
  assert.throws(() => h.verbs.rebuild({ document: documentFH(h) }),
    /ne vaut pas la somme de son détail/,
    "un Score faux qui a l'air juste n'entre pas dans le document");

  /* 3. APRÈS LES OVERRIDES, LE MJ N'EST PAS JETÉ — IL EST NOMMÉ. La parole du
     MJ bat le JSON (invariant n°2) ; elle ne doit pas pour autant produire un
     total que son détail contredit sans que personne le dise. */
  const vrai = pileFH();
  const bon = vrai.verbs.rebuild({ document: documentFH(vrai) });
  const tordu = structuredClone(bon.document);
  tordu.build.overrides.push({ path: `resolved.stats[${FH_DESTINY_ID}].value`, value: 20, by: "gm", note: "haut fait" });
  const apres = vrai.verbs.rebuild({ document: tordu });
  assert.equal(scoreDe(apres.resolved).value, 20, "l'override passe — il est appliqué en dernier");
  const verdict = vrai.verbs.validate({ document: apres.document });
  assert.equal(verdict.ok, false, "et `validate` le NOMME plutôt que de l'avaler");
  assert.ok(verdict.violations.some((line) => /vaut 20.*somme à 6/.test(line)),
    "un MJ qui écrase un total sans poser le terme qui le justifie l'apprend ici, pas à la table");
});

/* ══ LES REFUS DE CONTENU ════════════════════════════════════════════
   Ils se prouvent sur une PRIVATION DÉLIBÉRÉE — une couche fabriquée qui
   recouvre le record réel —, jamais sur une pénurie de circonstance qui
   cesserait de prouver le jour où la source s'enrichit (TRAPS.md). */

/** Recouvre l'Elfe par un `add` qui ne garde que le `data.destiny` donné. */
function elfeAvec(destiny) {
  const data = { size_key: "medium", speed_ft: 30 };
  if (destiny !== undefined) data.destiny = destiny;
  return uneCouche("scenario-lot19", {
    species: { "srd:species:en:elf": { op: "add", name: "Elf", slug: "elf", data } }
  });
}

test("UNE ESPÈCE SANS BASE DE DESTINÉE SE DÉCLARE — le moteur ne lui invente pas un 2", () => {
  const h = pileFH({ extra: elfeAvec(undefined) });
  const out = h.verbs.rebuild({ document: documentFH(h) });
  const stat = scoreDe(out.resolved);
  assert.deepEqual(stat.breakdown, [{ label: "Proficiency Bonus", value: 2 }], "la maîtrise seule");
  assert.equal(stat.value, 2, "et le total ne contient pas de Base fantôme");
  const declaration = out.underived.find((entry) => entry.field === `stats[${FH_DESTINY_ID}].base`);
  assert.match(declaration.reason, /ne porte pas `data\.destiny`/);
  assert.match(declaration.reason, /couche tierce ou amputée/, "la privation est nommée pour ce qu'elle est");
});

test("UN BONUS DE BASE DONT LE TRAIT N'A PAS DE NOM JETTE — le sauter rendrait le Score court en silence", () => {
  const h = pileFH({ extra: elfeAvec({ base: 2, base_bonus: 2, base_bonus_trait: "splinter-of-anon" }) });
  assert.throws(() => h.verbs.rebuild({ document: documentFH(h) }),
    /no trait of that id carries a name/,
    "le nombre est connu et le mot manque : sauter la ligne laisserait un Score court d'exactement ce bonus");
});

test("UNE BASE QUI N'EST PAS UN NOMBRE JETTE — un contenu faux n'est pas un travail à finir", () => {
  const h = pileFH({ extra: elfeAvec({ base: "two" }) });
  assert.throws(() => h.verbs.rebuild({ document: documentFH(h) }), /is not a whole number/);
});

test("SANS ESPÈCE, LA BASE SE DÉCLARE — poser 2 ferait passer la valeur d'Eric pour une règle du moteur", () => {
  const h = pileFH();
  const document = documentFH(h);
  document.build.choices = document.build.choices.filter((choice) => choice.path !== "species");
  const out = h.verbs.rebuild({ document });
  const declaration = out.underived.find((entry) => entry.field === `stats[${FH_DESTINY_ID}].base`);
  assert.match(declaration.reason, /aucun choix `species`/);
  assert.equal(scoreDe(out.resolved).value, 2, "le Score n'est plus que la maîtrise, et il le dit");
});

test("SANS MAÎTRISE DÉRIVÉE, LE TERME SE DÉCLARE — 0 rendrait un Score plus bas sans un mot", () => {
  /* La privation est délibérée : une couche de scénario recouvre la table de
     progression du magicien par une table qui ne porte aucun niveau. */
  const h = pileFH({
    extra: uneCouche("scenario-lot19-progression", {
      "class-progression": {
        "srd:class-progression:en:wizard": {
          op: "add", name: "Wizard", slug: "wizard", data: { class: "srd:class:en:wizard", levels: [] }
        }
      }
    })
  });
  const out = h.verbs.rebuild({ document: documentFH(h) });
  assert.equal(out.resolved.proficiency, undefined, "le pli n'a pas pu dériver la maîtrise");
  const stat = scoreDe(out.resolved);
  assert.deepEqual(stat.breakdown.map((line) => line.label), ["Destiny Base · Elf", "Splinter of Anon"],
    "la ligne de maîtrise est ABSENTE, pas nulle");
  assert.equal(stat.value, 4);
  assert.match(out.underived.find((entry) => entry.field === `stats[${FH_DESTINY_ID}].proficiency`).reason,
    /le compter pour 0/);
});

/* ══ LA FRONTIÈRE §0.12, TENUE PAR L'INJECTION ═══════════════════════ */

test("LE MODULE NE S'ALLUME QUE SUR SON DRAPEAU — monté sans la couche, il ne publie rien", () => {
  const module = createFhDestinyStat();
  assert.equal(module.flag, "fh.destiny", "le drapeau est celui que la couche FH lève");
  assert.equal(module.id, "fh:destiny");

  /* La couche FH montée SANS le module : la pile réclame la capacité, personne
     ne la sert, et la fiche le DIT au lieu de se taire. */
  const h = makeHarness({ layers: [SRD_EN, FH_SPECIES_EN], modules: [] });
  const out = h.verbs.rebuild({ document: documentFH(h) });
  assert.deepEqual(out.resolved.stats, []);
  const declaration = out.underived.find((entry) => entry.field === "stats");
  assert.match(declaration.reason, /Drapeaux levés par la pile : fh\.chaos, fh\.destiny/);
  assert.match(declaration.reason, /Drapeaux servis par les modules injectés : aucun/,
    "un module oublié se distingue d'une pile sans couche — sinon l'oubli serait invisible");
});

test("UN MODULE QUE LA DÉRIVATION NE SAIT PAS APPELER EST UN REFUS", () => {
  for (const bancal of [null, {}, { flag: "fh.destiny" }, { contribute: () => ({}) }]) {
    const h = makeHarness({ layers: [SRD_EN, FH_SPECIES_EN], modules: [bancal] });
    assert.throws(() => h.verbs.rebuild({ document: documentFH(h) }), /module de statistique doit déclarer/);
  }
});
