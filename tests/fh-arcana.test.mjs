/* ══ LES TESTS D'ACCEPTATION DU LOT 20 — L'ARCANE ET LE DON ═══════════
   Le lot 19 avait publié le Score de Destinée terme par terme, et TROIS termes
   en étaient sortis « déclarés non dérivables ». Deux d'entre eux étaient du
   CONTENU manquant, pas du contrat : l'impact de l'Arcane majeur (7 des 7
   personnages réels d'Eric en portent un, et il vaut 0, 1 ou 2 SELON LA CARTE)
   et le don Auspicious (fh), +2. Ce lot pose ce contenu et apprend au
   module à le lire. Cette suite dit s'il a réussi.

   LE TEST QUI COMPTE EST LE DEUXIÈME, et il est le pendant du premier : un
   personnage dont la couche des cartes n'est PAS montée ne fabrique aucun
   nombre. Un Score qui compterait 0 à sa place serait faux de 0, 1 ou 2 points
   selon la carte — et il aurait l'air juste.

   ⚠️ AUCUNE ÉCRITURE HORS MÉMOIRE. `layers/` est un artefact commité et
   `tests/tree-immuable.test.mjs` rejoue toute la suite entre deux relevés de
   l'arbre : les couches tordues de cette suite sont FABRIQUÉES en mémoire et
   montées par-dessus, jamais posées sur le disque. */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";

import {
  ROOT, SRD_EN, FH_SPECIES_EN, FH_ARCANA_EN, FH_FEATS_EN, makeHarness, manifestOf, uneCouche
} from "./build-harness.mjs";
import { createFhDestinyStat, FH_DESTINY_FLAG, FH_DESTINY_ID } from "../src/modules/fh/destiny-stat.mjs";
/* LOT 41 — `underived[].reason` → `{key, params}`. Le personnage de ce
   fichier mélange des clefs génériques (`derive.mjs`) et des clefs FH
   (`destiny-stat.mjs`) dans le MÊME carnet : la table de lecture compose
   donc les deux paquets, exactement comme `render-fiche.mjs` le fera. */
import { createLabels, renderUnderived, FR_UNDERIVED } from "../src/labels.mjs";
import { FH_UNDERIVED_FR } from "../src/modules/fh/labels.mjs";

const ajv = new Ajv2020({ strict: true, allErrors: true });
const frUnderived = createLabels(FR_UNDERIVED, FH_UNDERIVED_FR);
const validateChar = ajv.compile(JSON.parse(readFileSync(join(ROOT, "schemas/fh-char.schema.json"), "utf8")));

const CARTES = JSON.parse(readFileSync(join(ROOT, FH_ARCANA_EN), "utf8"));
const DONS = JSON.parse(readFileSync(join(ROOT, FH_FEATS_EN), "utf8"));

const HERMITE = "fh:arcana:en:the-hermit";
/* REWRITTEN 2026-08-09 — le don est renommé « Auspicious (fh) » (décision
   d'Eric). L'id suit le nom : rien ne l'ancrait encore, et un id
   `destiny-touched` sous un nom `Auspicious` serait deux noms pour une chose. */
const DON = "fh:feat:en:auspicious";

/* ── LE PERSONNAGE ───────────────────────────────────────────────────
   La même elfe magicienne de niveau 1 que le lot 19 — l'Elfe parce qu'elle est
   la seule des douze espèces à porter un `base_bonus`, le niveau 1 parce qu'au
   delà `vitals.hpMax` n'est dérivable d'aucun champ mécanique du contrat et
   que le document ne passerait plus `fh-char/1`.

   ⚠️ LES CINQ TERMES VALENT 2. C'est un fait de la matière, pas un choix de
   confort, et il est DANGEREUX : un total juste ne prouverait rien. Toutes les
   assertions portent donc sur le détail LIGNE À LIGNE, et un test dédié fait
   varier la carte pour voir la ligne suivre le record au lieu d'être fixe. */
const CHOIX_DE_BASE = [
  { path: "level", value: 1, label: "Level 1" },
  { path: "class", ref: { kind: "class", id: "srd:class:en:wizard" }, label: "Wizard" },
  { path: "species", ref: { kind: "species", id: "srd:species:en:elf" }, label: "Elf" },
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

/** La carte, par `ref`. C'est la forme que l'espèce, la classe et l'historique
 *  emploient déjà — la révision du 2026-08-08 l'a rendue légale sans ajouter
 *  un seul champ au schéma. */
const carte = (id, label) => ({ path: `${FH_DESTINY_FLAG}.arcana`, ref: { kind: "arcana", id }, label });

/** Le don, à SA place. ⚠️ PAS dans le namespace du module : la table de
 *  couverture v1 range les dons d'origine sous `background.originFeat[n]`
 *  (tests/v1-coverage.test.mjs), et un personnage ne doit pas déclarer son don
 *  deux fois. C'est ce qui oblige la dérivation à les tendre aux modules. */
const don = (id, index = 0) => ({ path: `background.originFeat[${index}]`, ref: { kind: "feat", id }, label: "Origin feat" });

function pile(layers, options = {}) {
  return makeHarness(Object.assign({ layers, modules: [createFhDestinyStat()] }, options));
}

function documentDe(h, choices = []) {
  return {
    schema: "fh-char/1",
    id: "lot20-ilyra",
    name: "Ilyra",
    lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/fh-arcana", version: "1.0.0" },
    created: "2026-08-09T09:00:00Z",
    modified: "2026-08-09T09:00:00Z",
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
const ligne = (stat, label) => stat.breakdown.find((line) => line.label === label);
const declaration = (out, champ) => out.underived.find((entry) => entry.field === champ);

const PILE_COMPLETE = [SRD_EN, FH_SPECIES_EN, FH_ARCANA_EN, FH_FEATS_EN];

/* ══ LA COUCHE, AVANT MÊME QU'ON LA LISE ══════════════════════════════ */

test("LES 22 CARTES ENTRENT, ET LEURS IMPACTS SE RÉPARTISSENT SUR 0, 1 ET 2", () => {
  const h = pile(PILE_COMPLETE);
  const vues = h.layers.verbs.query({ kind: "arcana" });
  assert.equal(vues.length, 22, "les vingt-deux Arcanes majeurs, ni vingt-et-un ni vingt-trois");

  /* LA RÉPARTITION EST LA PREUVE QU'AUCUN NOMBRE N'EST ÉCRIT EN DUR. Si les
     22 cartes valaient toutes 2, une constante dans le module passerait tous
     les tests de ce fichier. Elles ne valent pas toutes 2 — et c'est très
     exactement pourquoi l'impact a besoin d'un record. */
  const compte = { 0: 0, 1: 0, 2: 0 };
  for (const vue of vues) {
    const impact = vue.record.data.destiny.impact;
    assert.ok(Object.hasOwn(compte, impact), `impact hors de {0,1,2} sur « ${vue.id} » : ${impact}`);
    compte[impact] += 1;
  }
  assert.ok(compte[0] > 0 && compte[1] > 0 && compte[2] > 0,
    `les trois valeurs sont représentées (0:${compte[0]}, 1:${compte[1]}, 2:${compte[2]})`);
  assert.equal(compte[0] + compte[1] + compte[2], 22);

  /* Chaque carte porte AUSSI ce dont ce lot ne se sert pas encore : le chiffre
     romain, le sens, le pouvoir, la vibration. On ne jette pas une donnée de
     la carte parce qu'un lot n'en a pas l'usage — c'est ainsi qu'une source
     s'appauvrit sans que personne le remarque. */
  const numeros = new Set();
  for (const vue of vues) {
    const data = vue.record.data;
    for (const champ of ["numeral", "meaning", "power", "vibration"]) {
      assert.equal(typeof data[champ], "string", `« ${vue.id} » porte \`${champ}\``);
      assert.ok(data[champ].length > 0, `« ${vue.id} » : \`${champ}\` n'est pas vide`);
    }
    assert.equal(numeros.has(data.numeral), false, `le chiffre « ${data.numeral} » n'est porté qu'une fois`);
    numeros.add(data.numeral);
  }
  assert.equal(numeros.size, 22, "vingt-deux chiffres romains distincts, de 0 à XXI");

  /* L'ATTRIBUTION N'EST PAS CELLE DE LA COUCHE DES ESPÈCES, et ce n'est pas
     un détail de forme : les Arcanes sont du contenu 100 % original, ils ne
     modifient AUCUN matériel SRD. Recopier la phrase « Portions of the SRD
     material … have been modified » serait une déclaration de licence FAUSSE
     sur un dépôt public. */
  const especes = JSON.parse(readFileSync(join(ROOT, FH_SPECIES_EN), "utf8"));
  assert.match(especes.attribution.text, /have been modified/, "la couche des espèces, elle, modifie bien le SRD");
  for (const couche of [CARTES, DONS]) {
    assert.equal(couche.attribution.license, "all-rights-reserved");
    assert.doesNotMatch(couche.attribution.text, /have been modified/,
      `« ${couche.id} » ne modifie aucun matériel SRD, et son attribution ne doit pas prétendre le contraire`);
    assert.match(couche.attribution.text, /modifies NO material/);
    assert.deepEqual(couche.flags, [FH_DESTINY_FLAG], "elle lève le drapeau qui allume le module, et lui seul");
  }
  assert.deepEqual(Object.keys(CARTES.records), ["arcana"]);
  assert.deepEqual(Object.keys(DONS.records), ["feat"]);

  /* AUCUN `disable`. Mesuré par l'architecte : la note « replaces Lucky » vise
     le don *Lucky* du PHB 2024, qui n'est PAS dans le SRD 5.2 — il n'y a rien
     à désactiver, et désactiver un record absent serait un geste sans objet
     qui ferait croire à une dépendance.

     ⚠️ LES CARTES SONT TOUJOURS DES `add` PURS. LES DONS, NON — ET LE COMPTE
     A CHANGÉ LE 2026-08-20. Le lot 24 patchait `srd:feat:en:skilled` ;
     `srd:feat:en:magic-initiate` le rejoint pour recevoir `data.blurb`, le
     texte court que sa fiche de catalogue affiche (sa description SRD rendait
     643 px dans une boîte de 343 — 300 px rognés en silence, mesuré).

     🔴 CE GARDE NE COMPTE DONC PLUS LES PATCHS, IL LES JUGE — et il mord plus
     fort qu'avant. Un compte (« un seul ») ne protégeait rien : il aurait
     laissé passer un patch qui RÉÉCRIT `data.description`, c'est-à-dire du
     texte SRD, sous une attribution qui jure le contraire. Ce qu'on garde
     vraiment, c'est la promesse de l'attribution : **aucune clef d'un patch
     de cette couche ne touche du contenu SRD**. Un champ FH ajouté, oui ; une
     phrase du SRD réécrite, jamais.
     ⛔ Et toujours aucun `disable`. */
  for (const entree of Object.values(CARTES.records.arcana)) {
    assert.equal(entree.op, undefined, "chaque carte est un `add` — la couche des Arcanes ne patche rien");
  }
  /* Les clefs qui portent du TEXTE SRD — les seules qu'un patch de cette
     couche n'a pas le droit d'écrire. */
  const TEXTE_SRD = ["name", "slug", "data.name", "data[name]", "data.description", "data[description]"];
  for (const [id, entree] of Object.entries(DONS.records.feat)) {
    assert.notEqual(entree.op, "disable", `« ${id} » n'est jamais désactivé`);
    if (id.startsWith("fh:")) {
      assert.equal(entree.op, undefined, `« ${id} » est du contenu FH : c'est un \`add\`, jamais un patch`);
      continue;
    }
    /* Un id SRD ne peut être qu'un `patch` — on n'AJOUTE pas un record sous
       l'identifiant de quelqu'un d'autre. */
    assert.equal(entree.op, "patch", `« ${id} » porte un id SRD : il ne peut être qu'un \`patch\``);
    assert.equal(entree.remove, undefined, `« ${id} » ne retire rien du SRD`);
    for (const chemin of Object.keys(entree.changes || {})) {
      assert.equal(TEXTE_SRD.includes(chemin), false,
        `« ${id} » patche « ${chemin} » — c'est du texte SRD, et l'attribution de cette couche jure qu'elle n'en réécrit aucun`);
    }
  }
  assert.equal(h.layers.verbs.query({ kind: "feat", id: "srd:feat:en:lucky" }), null,
    "*Lucky* n'existe pas dans le SRD 5.2 : la note du don le dit, et le dépôt n'a rien à désactiver");
});

/* ══ ACCEPTATION 1 — LE TEST QUE LE LOT DOIT PASSER ═══════════════════ */

test("ACCEPTATION 1 — la carte et le don entrent dans le Score, chacun citant sa source", () => {
  const h = pile(PILE_COMPLETE);
  const out = h.verbs.rebuild({ document: documentDe(h, [carte(HERMITE, "The Hermit"), don(DON)]) });
  const stat = scoreDe(out.resolved);

  assert.deepEqual(stat.breakdown, [
    { label: "Proficiency Bonus", value: 2 },
    { label: "Destiny Base · Elf", value: 2, source: { kind: "species", id: "srd:species:en:elf" } },
    { label: "Splinter of Anon", value: 2, source: { kind: "species", id: "srd:species:en:elf" } },
    { label: "The Hermit", value: 2, source: { kind: "arcana", id: HERMITE } },
    { label: "Auspicious (fh)", value: 2, source: { kind: "feat", id: DON } }
  ]);
  assert.equal(stat.value, 10);
  assert.equal(stat.value, somme(stat), "et `value` EST la somme de son détail");

  /* LES DEUX MOTS SONT RECOPIÉS DES RECORDS, pas fabriqués — la règle que le
     lot 19 avait appliquée au bonus de l'Elfe (loi §0.13). */
  assert.equal(ligne(stat, "The Hermit").label, CARTES.records.arcana[HERMITE].name);
  assert.equal(ligne(stat, "Auspicious (fh)").label, DONS.records.feat[DON].name);
  /* ET LES DEUX NOMBRES SONT LUS DANS LES RECORDS, pas écrits en dur. */
  assert.equal(ligne(stat, "The Hermit").value, CARTES.records.arcana[HERMITE].data.destiny.impact);
  assert.equal(ligne(stat, "Auspicious (fh)").value, DONS.records.feat[DON].data.destiny.bonus);

  /* Les deux termes ne sont PLUS déclarés non dérivés : ils le sont. La ligne
     « Other », elle, reste — elle n'est pas de ce lot. */
  const champs = out.underived.map((entry) => entry.field);
  assert.equal(champs.includes(`stats[${FH_DESTINY_ID}].arcana`), false);
  assert.equal(champs.includes(`stats[${FH_DESTINY_ID}].feat`), false);
  assert.ok(champs.includes(`stats[${FH_DESTINY_ID}].other`), "« Other » reste déclarée : elle n'est pas de ce lot");

  assert.equal(validateChar(out.document), true, ajv.errorsText(validateChar.errors));
  const verdict = h.verbs.validate({ document: out.document });
  assert.equal(verdict.ok, true, verdict.violations.join(" | "));
});

test("ACCEPTATION 1 (suite) — le total SURVIT À DEUX RECONSTRUCTIONS DE SUITE", () => {
  const h = pile(PILE_COMPLETE);
  const choix = [carte(HERMITE, "The Hermit"), don(DON)];
  const un = h.verbs.rebuild({ document: documentDe(h, choix) });
  const deux = h.verbs.rebuild({ document: un.document });
  const trois = h.verbs.rebuild({ document: deux.document });

  for (const [rang, out] of [["premier", un], ["deuxième", deux], ["troisième", trois]]) {
    const stat = scoreDe(out.resolved);
    assert.equal(stat.value, 10, `${rang} pli`);
    assert.equal(stat.value, somme(stat), `${rang} pli : le total se démontre encore`);
    assert.deepEqual(ligne(stat, "The Hermit").source, { kind: "arcana", id: HERMITE }, `${rang} pli`);
    assert.deepEqual(ligne(stat, "Auspicious (fh)").source, { kind: "feat", id: DON }, `${rang} pli`);
  }
  /* CE QUI REND LA SURVIE POSSIBLE : les deux termes vivent dans
     `build.choices`, que la reconstruction RELIT et ne réécrit jamais. */
  assert.deepEqual(
    trois.document.build.choices.filter((choice) => /arcana|originFeat/.test(choice.path)),
    choix, "les deux choix sont intacts, à l'octet près, après trois plis");
  assert.equal(validateChar(trois.document), true, ajv.errorsText(validateChar.errors));
});

test("LE DON N'EST PLUS SIGNALÉ COMME INERTE — il compte, donc il est RÉCLAMÉ", () => {
  /* Un don qui vaut +2 au Score et qui ressortirait `unconsumed` ferait dire à
     `validate` « il ne change rien à la fiche ». Ce n'est pas une omission,
     c'est un faux témoignage : c'est pour ça que le module le réclame. */
  const h = pile(PILE_COMPLETE);
  const out = h.verbs.rebuild({ document: documentDe(h, [carte(HERMITE, "The Hermit"), don(DON)]) });
  assert.equal(out.unconsumed.includes("background.originFeat[0]"), false, "le module l'a lu, donc il l'a réclamé");
  assert.deepEqual(h.verbs.validate({ document: out.document }).warnings
    .filter((line) => line.includes("background.originFeat[0]")), []);

  /* ET LA RÉCIPROQUE, qui est la moitié du garde : un don ORDINAIRE, qui ne
     porte aucune valeur de Destinée, reste signalé comme n'entrant dans aucune
     règle. Réclamer tous les dons ferait taire l'avertissement pour de bon. */
  const ordinaire = h.verbs.rebuild({
    document: documentDe(h, [carte(HERMITE, "The Hermit"), don("srd:feat:en:skilled", 1)])
  });
  assert.ok(ordinaire.unconsumed.includes("background.originFeat[1]"),
    "un don sans valeur de Destinée n'est réclamé par personne, et c'est dit");
  assert.equal(scoreDe(ordinaire.resolved).value, 8, "2 + 2 + 2 + 2 : *Skilled* n'ajoute rien au Score");
  /* REWRITTEN 2026-08-13 (lot 41) — `.reason` → `{key, params}`. */
  const feat = declaration(ordinaire, `stats[${FH_DESTINY_ID}].feat`);
  assert.equal(feat.key, "underived.fh.destiny-feat-no-bonus");
  assert.match(renderUnderived(feat, frUnderived),
    /aucun des dons choisis ne porte/, "et la raison NOMME les dons regardés, au lieu de dire « aucun don »");
  assert.match(renderUnderived(feat, frUnderived), /srd:feat:en:skilled/);
});

test("LA LIGNE DE LA CARTE SUIT LE RECORD — ce n'est pas une constante", () => {
  /* Les cinq termes du personnage d'acceptation valent 2 : un impact écrit en
     dur y passerait inaperçu. On rejoue donc le même personnage avec une carte
     à 1 et une carte à 0, lues dans le fichier de couche. */
  const h = pile(PILE_COMPLETE);
  const parImpact = (cible) => Object.entries(CARTES.records.arcana)
    .find(([, record]) => record.data.destiny.impact === cible);

  for (const cible of [0, 1, 2]) {
    const [id, record] = parImpact(cible);
    const out = h.verbs.rebuild({ document: documentDe(h, [carte(id, record.name), don(DON)]) });
    const stat = scoreDe(out.resolved);
    assert.deepEqual(ligne(stat, record.name), { label: record.name, value: cible, source: { kind: "arcana", id } });
    assert.equal(stat.value, 8 + cible, `« ${record.name} » : 2 + 2 + 2 + 2 + ${cible}`);
    assert.equal(stat.value, somme(stat));
  }
});

/* ══ ACCEPTATION 2 — LE PENDANT, ET IL COMPTE AUTANT ══════════════════ */

test("ACCEPTATION 2 — SANS LA COUCHE DES CARTES, aucun nombre n'est fabriqué : le terme se DÉCLARE", () => {
  /* Le MÊME personnage, la même carte nommée, et la couche des 22 cartes qui
     n'est pas montée. Compter 0 lui coûterait ici 2 points, en silence. */
  const h = pile([SRD_EN, FH_SPECIES_EN, FH_FEATS_EN]);
  const out = h.verbs.rebuild({ document: documentDe(h, [carte(HERMITE, "The Hermit"), don(DON)]) });
  const stat = scoreDe(out.resolved);

  assert.deepEqual(stat.breakdown.map((line) => line.label),
    ["Proficiency Bonus", "Destiny Base · Elf", "Splinter of Anon", "Auspicious (fh)"],
    "la ligne de la carte est ABSENTE, pas nulle");
  assert.equal(stat.value, 8, "et le total ne contient pas d'impact fantôme");
  assert.equal(stat.value, somme(stat));

  /* REWRITTEN 2026-08-13 (lot 41) — `.reason` → `{key, params}`. */
  const arcanaEntry = declaration(out, `stats[${FH_DESTINY_ID}].arcana`);
  assert.equal(arcanaEntry.key, "underived.fh.destiny-arcana-layer-not-mounted");
  const raison = renderUnderived(arcanaEntry, frUnderived);
  assert.match(raison, /fh:arcana:en:the-hermit/, "la raison NOMME la carte que le personnage porte");
  assert.match(raison, /GAP-KIND clos/,
    "elle renvoie au trou NOMMÉ ET CLOS : le contrat est là, c'est le contenu qui n'est pas monté");
  assert.match(raison, /fh-arcana-en/, "et elle nomme la couche à monter, plutôt que de laisser chercher");
  assert.doesNotMatch(raison, /toujours ouvert/, "le trou du contrat est bouché — le dire encore enverrait réviser un schéma déjà révisé");

  /* Le genre RÉPOND, et il répond VIDE — c'est cette différence-là que le
     module lit pour distinguer « contenu absent » de « ref mort ». */
  assert.deepEqual(h.layers.verbs.query({ kind: "arcana" }), []);
  /* Et le `ref` orphelin n'est pas avalé pour autant : `validate` le NOMME. Le
     personnage est jouable, il est incomplet, et les deux sont dits. */
  const verdict = h.verbs.validate({ document: out.document });
  assert.equal(verdict.ok, false);
  assert.ok(verdict.violations.some((line) => /la pile ne porte aucun arcana/.test(line)));
});

test("SANS LA COUCHE DES DONS, le don se DÉCLARE aussi — et le reste du Score tient", () => {
  const h = pile([SRD_EN, FH_SPECIES_EN, FH_ARCANA_EN]);
  const document = documentDe(h, [carte(HERMITE, "The Hermit")]);
  const out = h.verbs.rebuild({ document });
  const stat = scoreDe(out.resolved);
  assert.deepEqual(stat.breakdown.map((line) => line.label),
    ["Proficiency Bonus", "Destiny Base · Elf", "Splinter of Anon", "The Hermit"]);
  assert.equal(stat.value, 8);
  /* REWRITTEN 2026-08-13 (lot 41) — `.reason` → `{key, params}`. */
  assert.match(renderUnderived(declaration(out, `stats[${FH_DESTINY_ID}].feat`), frUnderived),
    /aucun choix ne désigne de record `feat`/);
});

test("SANS CARTE NOMMÉE, le terme se déclare en nommant LE CHOIX — pas un contenu absent", () => {
  const h = pile(PILE_COMPLETE);
  const out = h.verbs.rebuild({ document: documentDe(h, [don(DON)]) });
  const stat = scoreDe(out.resolved);
  assert.equal(stat.breakdown.some((line) => line.source && line.source.kind === "arcana"), false);
  assert.equal(stat.value, 8);
  /* REWRITTEN 2026-08-13 (lot 41) — `.reason` → `{key, params}`. */
  const arcanaEntry = declaration(out, `stats[${FH_DESTINY_ID}].arcana`);
  assert.equal(arcanaEntry.key, "underived.fh.destiny-arcana-no-choice");
  const raison = renderUnderived(arcanaEntry, frUnderived);
  assert.match(raison, /aucun choix `fh\.destiny\.arcana`/);
  assert.match(raison, /0, 1 ou 2/, "et elle redit pourquoi aucun défaut n'est possible");
});

/* ══ LE GARDE DU `ref`, RESTREINT ET NON OUVERT ═══════════════════════
   Le module refusait TOUT choix portant un `ref`. Le lot ouvre ce refus pour
   le chemin de la carte, et pour lui seul. Un garde qu'on remplace par une
   porte est le défaut que ce test existe pour empêcher. */

test("LE REFUS DU `ref` MORD TOUJOURS HORS DU CHEMIN DE LA CARTE", () => {
  const h = pile(PILE_COMPLETE);
  for (const chemin of ["glory[0]", "awakening[0]"]) {
    assert.throws(() => h.verbs.rebuild({
      document: documentDe(h, [{ path: `${FH_DESTINY_FLAG}.${chemin}`, ref: { kind: "arcana", id: HERMITE } }])
    }), /carries a `ref`/, `« ${chemin} » est un NOMBRE décidé à la table, pas un record à lire`);
  }
  /* Et la forme indicée du chemin de la carte n'est pas un chemin de la
     carte : un personnage porte UNE carte, pas une liste. */
  assert.throws(() => h.verbs.rebuild({
    document: documentDe(h, [{ path: `${FH_DESTINY_FLAG}.arcana[0]`, ref: { kind: "arcana", id: HERMITE } }])
  }), /does not carry under the indexed form/);
});

test("LE CHEMIN DE LA CARTE N'ACCEPTE QUE LE GENRE DE LA CARTE — et pas une valeur", () => {
  const h = pile(PILE_COMPLETE);
  /* Un `ref` d'espèce sous ce chemin irait lire `data.destiny.base` : la Base
     d'espèce, DÉJÀ comptée par ailleurs. Le Score vaudrait 12 au lieu de 10 et
     rien ne le dirait. */
  assert.throws(() => h.verbs.rebuild({
    document: documentDe(h, [{ path: `${FH_DESTINY_FLAG}.arcana`, ref: { kind: "species", id: "srd:species:en:elf" } }])
  }), /count that term TWICE/);
  assert.throws(() => h.verbs.rebuild({
    document: documentDe(h, [{ path: `${FH_DESTINY_FLAG}.arcana`, value: 2, label: "The Hermit" }])
  }), /carries a value, not a `ref`/);
});

test("UNE CARTE QUE LA PILE NE PORTE PLUS JETTE — un `ref` mort n'est pas un contenu manquant", () => {
  /* La distinction que tout le lot repose dessus : le genre est PEUPLÉ (22
     cartes) et cette carte-là n'y est pas. Ce n'est plus « la couche n'est pas
     montée », c'est « le personnage a été construit sur une couche qui n'est
     plus là », et compter 0 lui volerait jusqu'à 2 points. */
  const h = pile(PILE_COMPLETE);
  assert.throws(() => h.verbs.rebuild({
    document: documentDe(h, [carte("fh:arcana:en:the-twenty-third", "Nowhere")])
  }), /is in none of the 22/);
});

/* ══ LES REFUS DE CONTENU, PROUVÉS SUR UNE PRIVATION DÉLIBÉRÉE ════════
   Jamais sur une pénurie de circonstance : une preuve qui tient à la pauvreté
   de sa source cesse de prouver le jour où la source s'enrichit, et elle cesse
   EN RESTANT VERTE (TRAPS.md). */

/** Recouvre l'Ermite par un `add` qui ne garde que ce qu'on lui donne. */
function hermiteAvec(data) {
  return uneCouche("scenario-lot20", {
    arcana: { [HERMITE]: { op: "add", name: "The Hermit", slug: "the-hermit", data } }
  });
}

test("UN IMPACT FABRIQUÉ FAUX FAIT ÉCHOUER LA RECONSTRUCTION — il n'atteint jamais le document", () => {
  for (const [data, motif, pourquoi] of [
    [{ destiny: { impact: "two" } }, /is not a whole number/, "un impact que le moteur ne sait pas additionner"],
    [{ destiny: { impact: 1.5 } }, /is not a whole number/, "ni un demi-point"],
    [{ destiny: {} }, /is not a whole number/, "ni un `destiny` sans impact"],
    [{}, /is not a whole number/, "ni un record de carte sans `destiny` du tout"]
  ]) {
    const h = pile(PILE_COMPLETE, { extra: hermiteAvec(data) });
    assert.throws(() => h.verbs.rebuild({ document: documentDe(h, [carte(HERMITE, "The Hermit")]) }), motif, pourquoi);
  }
});

test("UNE CARTE SANS NOM JETTE — le libellé de la ligne EST le nom du record, recopié", () => {
  const h = pile(PILE_COMPLETE, {
    extra: uneCouche("scenario-lot20-anonyme", {
      arcana: { [HERMITE]: { op: "patch", changes: { name: "   " }, note: "carte sans nom" } }
    })
  });
  assert.throws(() => h.verbs.rebuild({ document: documentDe(h, [carte(HERMITE, "The Hermit")]) }),
    /carries no usable `name`/,
    "l'impact est CONNU et le mot manque : nommer la ligne d'après l'id mettrait un identifiant " +
    "là où un humain lit une carte");
});

test("UN DON QUI ANNONCE UNE VALEUR DE DESTINÉE SANS SAVOIR LA DIRE JETTE", () => {
  for (const [destiny, motif] of [
    [{ bonus: "two" }, /is not a whole number/],
    [{}, /is not a whole number/],
    [2, /is not an object/]
  ]) {
    const h = pile(PILE_COMPLETE, {
      extra: uneCouche("scenario-lot20-don", {
        feat: { [DON]: { op: "add", name: "Auspicious (fh)", slug: "auspicious", data: { destiny } } }
      })
    });
    assert.throws(() => h.verbs.rebuild({ document: documentDe(h, [don(DON)]) }), motif);
  }
});

test("UN DON SANS `data.destiny` N'EST PAS UN REFUS — c'est le cas des dix-sept dons du SRD", () => {
  /* La frontière du lot : un champ ABSENT dit « ce don ne touche pas au
     Score », et c'est un fait. Un champ PRÉSENT et illisible est du contenu
     faux. Confondre les deux ferait jeter la fiche de tout personnage qui
     prend un don ordinaire. */
  const h = pile(PILE_COMPLETE);
  const srdFeats = h.layers.verbs.query({ kind: "feat" }).filter((vue) => vue.id.startsWith("srd:"));
  assert.ok(srdFeats.length >= 17, `les dons du SRD sont bien là (${srdFeats.length})`);
  for (const vue of srdFeats) {
    assert.equal(vue.record.data.destiny, undefined, `« ${vue.id} » ne porte aucune valeur de Destinée`);
  }
  const out = h.verbs.rebuild({ document: documentDe(h, [don(srdFeats[0].id)]) });
  assert.equal(scoreDe(out.resolved).value, 6, "2 + 2 + 2 : le don ordinaire n'ajoute rien, et ne casse rien");
});

/* ══ LA FRONTIÈRE DU CANAL `consumed` ═════════════════════════════════ */

test("UN MODULE NE RÉCLAME QUE CE QU'ON LUI A TENDU — sinon il ferait taire n'importe quel choix", () => {
  /* Sans ce garde, un module pourrait nommer `class.skills[0]` dans son
     `consumed` et faire disparaître l'avertissement de `validate` sur
     n'importe quel choix du document. */
  const menteur = {
    flag: FH_DESTINY_FLAG,
    id: "faux:score",
    contribute: () => ({
      stat: { id: "faux:score", flag: FH_DESTINY_FLAG, name: "Menteur", value: 1, breakdown: [{ label: "un", value: 1 }] },
      underived: [],
      consumed: ["class.skills[0]"]
    })
  };
  const h = makeHarness({ layers: PILE_COMPLETE, modules: [menteur] });
  assert.throws(() => h.verbs.rebuild({ document: documentDe(h) }),
    /déclare avoir lu le choix « class\.skills\[0\] », que la dérivation ne lui a pas tendu/);

  const tordu = Object.assign({}, menteur, { contribute: () => ({ stat: null, underived: [], consumed: "background.originFeat[0]" }) });
  const h2 = makeHarness({ layers: PILE_COMPLETE, modules: [tordu] });
  assert.throws(() => h2.verbs.rebuild({ document: documentDe(h2, [don(DON)]) }),
    /`consumed` qui n'est pas une liste/);
});

/* ══ LE CANAL HORS-NAMESPACE EST GÉNÉRIQUE ════════════════════════════
   Généralisation d'architecte du 2026-08-08. Le lot 20 avait dû ouvrir un
   canal `feats` ; il est devenu `refs`, qui porte TOUS les genres. Ces deux
   tests existent parce que le reste de la suite ne prouverait que l'absence
   de casse : ils prouvent que la généralisation SERT À QUELQUE CHOSE. Sans
   eux, le chapitre 4 découvrirait à ses dépens que le canal ne tend que des
   dons. */

test("UN MODULE VOIT LA CLASSE ET L'ARRIÈRE-PLAN, pas seulement les dons", () => {
  /* C'est LE besoin du chapitre 4, vérifié avant qu'il soit écrit : le pool de
     compétences vient de la classe, les choix imposés de l'arrière-plan, et
     les deux sont désignés par un `ref` hors du namespace de tout module. */
  let vus = null;
  const espion = {
    flag: FH_DESTINY_FLAG,
    id: "espion:refs",
    contribute: ({ refs }) => {
      vus = refs;
      return { stat: null, underived: [] };
    }
  };
  const h = makeHarness({ layers: PILE_COMPLETE, modules: [espion] });
  /* L'arrière-plan n'est pas dans la fixture partagée : on l'ajoute ICI plutôt
     que de la modifier, parce que c'est CE test qui en a besoin — et c'est le
     genre dont le chapitre 4 tirera les choix imposés. */
  const arrierePlan = { path: "background", ref: { kind: "background", id: "srd:background:en:sage" }, label: "Sage" };
  h.verbs.rebuild({ document: documentDe(h, [carte(HERMITE, "The Hermit"), don(DON), arrierePlan]) });

  assert.ok(Array.isArray(vus), "le module reçoit bien `refs`");
  const genres = [...new Set(vus.map((ref) => ref.kind))].sort();
  for (const attendu of ["background", "class", "feat", "species"]) {
    assert.ok(genres.includes(attendu), `le genre « ${attendu} » doit être tendu (genres vus : ${genres.join(", ")})`);
  }

  /* Et chaque entrée est UTILISABLE : le chemin qui l'a nommée, son genre, et
     le contenu du record — sinon le module devrait le relire lui-même. */
  const classe = vus.find((ref) => ref.kind === "class");
  assert.match(classe.path, /^class/);
  assert.ok(classe.id && classe.name && classe.data, "le record est aplati, pas un simple identifiant");

  /* ⚠️ ET CE QUI EST DANS SON NAMESPACE N'Y EST PAS. La carte arrive par
     `choices`, et la tendre DEUX FOIS inviterait à la compter deux fois. */
  assert.equal(vus.some((ref) => ref.path.startsWith(FH_DESTINY_FLAG)), false,
    "un `ref` du namespace du module ne repasse pas par `refs`");
});

test("ATTAQUE — le garde de réclamation mord sur TOUS les genres, pas seulement les dons", () => {
  /* Le garde ne validait `consumed` que contre les dons. S'il était resté
     ainsi, un module réclamant un chemin de CLASSE aurait été refusé pour la
     mauvaise raison — et le jour où le chapitre 4 réclame légitimement sa
     classe, on aurait relâché le garde au lieu de le corriger. */
  const honnete = {
    flag: FH_DESTINY_FLAG,
    id: "honnete:refs",
    contribute: ({ refs }) => ({
      stat: null,
      underived: [],
      consumed: refs.filter((ref) => ref.kind === "class").map((ref) => ref.path)
    })
  };
  const h = makeHarness({ layers: PILE_COMPLETE, modules: [honnete] });
  assert.doesNotThrow(() => h.verbs.rebuild({ document: documentDe(h) }),
    "réclamer un chemin de classe qu'on lui a TENDU est légitime");

  /* Et l'inverse tient toujours : un chemin qui n'a pas de `ref` du tout ne se
     réclame pas, quel que soit le genre invoqué. */
  const menteur2 = Object.assign({}, honnete, {
    contribute: () => ({ stat: null, underived: [], consumed: ["abilities.str"] })
  });
  const h2 = makeHarness({ layers: PILE_COMPLETE, modules: [menteur2] });
  assert.throws(() => h2.verbs.rebuild({ document: documentDe(h2) }),
    /déclare avoir lu le choix « abilities\.str »/);
});

/* ══ LE GARDE DE LA SOMME, NON MODIFIÉ, TOUJOURS VERT ═════════════════ */

test("LE GARDE DE LA SOMME RESTE VERT SANS AVOIR ÉTÉ TOUCHÉ — et il mord encore sur ces termes-ci", () => {
  const h = pile(PILE_COMPLETE);
  const bon = h.verbs.rebuild({ document: documentDe(h, [carte(HERMITE, "The Hermit"), don(DON)]) });
  assert.equal(h.verbs.validate({ document: bon.document }).ok, true);

  /* Un MJ qui écrase le total de 10 sans poser le terme qui le justifie
     l'apprend ici, pas à la table. */
  const tordu = structuredClone(bon.document);
  tordu.build.overrides.push({ path: `resolved.stats[${FH_DESTINY_ID}].value`, value: 20, by: "gm", note: "haut fait" });
  const apres = h.verbs.rebuild({ document: tordu });
  assert.equal(scoreDe(apres.resolved).value, 20, "l'override passe — il est appliqué en dernier");
  const verdict = h.verbs.validate({ document: apres.document });
  assert.equal(verdict.ok, false);
  assert.ok(verdict.violations.some((line) => /vaut 20.*somme à 10/.test(line)),
    "les deux nombres, et le détail qui les démontre");
});
