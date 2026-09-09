/* ══ LA COUCHE DE L'INHERITANCE — L'ORIGINE FATE'S HAND ════════════════
   Lot 184-fh-skills-fendu-en-trois. Ces gardes vivaient dans
   `tests/fh-skills.test.mjs` depuis les lots 43 et 182 ; ils suivent l'origine
   dans sa couche à elle.

   🔴 POURQUOI LA COUCHE EXISTE. Eric, 08/09, en lisant `fh-skills-en` :
   *« FH skills contient des feats, LOL »*. Une couche appelée « Skills &
   tools » portait le don d'origine gratuit, les deux langues et les 50 GP.
   `Inheritance` est l'un des six interrupteurs de l'écran `Rules`
   (ARCHITECTURE.md, « La coupe des couches »).

   ⚖️ ET ELLE DÉPEND DES TRAININGS — dicté par Eric le 2026-09-08. Le dernier
   bloc de ce fichier MESURE cette dépendance sur la vraie pile, dans les deux
   sens, plutôt que de la déclarer.

   ⚠️ CETTE SUITE N'ÉCRIT QUE DANS UN RÉPERTOIRE TEMPORAIRE. `layers/` est un
   artefact commité. */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createLayers } from "../src/layers/index.mjs";
import {
  ROOT,
  SRD_EN,
  FH_INHERITANCE_EN,
  fileBytes,
  makeBus,
  makeHarness,
  manifestOf
} from "./build-harness.mjs";
import { PILE } from "../src/tools/exemple-fh-en.mjs";
import { createFhLayer } from "../src/modules/fh/index.mjs";
import {
  buildLayer,
  generate,
  readSrdLayer,
  serialize,
  GenError
} from "../src/tools/gen-fh-inheritance-layer.mjs";
import {
  BACKGROUND_INHERITANCE,
  BACKGROUNDS_EXTINGUISHED
} from "../src/tools/fh-inheritance-source.mjs";

const SRD_PATH = join(ROOT, SRD_EN);

function pile({ fh = true } = {}) {
  const bus = makeBus();
  const layers = createLayers({ bus });
  layers.verbs.register({ bytes: fileBytes(SRD_EN), origin: SRD_EN });
  if (fh) layers.verbs.register({ bytes: fileBytes(FH_INHERITANCE_EN), origin: FH_INHERITANCE_EN });
  return layers.verbs;
}

/** Une couche SRD amputée : la privation est DÉLIBÉRÉE, pas une pénurie de
 *  circonstance qui cesserait de prouver le jour où la source s'enrichit. */
function srdAmputé(mutate) {
  const srd = JSON.parse(JSON.stringify(readSrdLayer(SRD_PATH)));
  mutate(srd);
  return srd;
}

/** RENOMMER plutôt que SUPPRIMER : retirer un record change aussi le COMPTE,
 *  si bien que c'est le contrôle des quatre qui mordrait, et le garde de
 *  nommage ne serait jamais atteint. */
function renomme(genre, de, vers) {
  return (s) => {
    s.records[genre][vers] = s.records[genre][de];
    delete s.records[genre][de];
  };
}

/* ══ L'ARRIÈRE-PLAN, RETIRÉ — REMPLACÉ PAR L'INHERITANCE (lot 43) ══════
   Addendums §4, réécrit le 2026-08-13 : « IL N'Y A PLUS DE RECORD
   D'ARRIÈRE-PLAN DU TOUT ». Le lot 35 avait seulement PATCHÉ les quatre
   records SRD (retrait de `skill_ids`, `tool_id`/`tool_choice`) : ils
   restaient choisissables. Ce lot les ÉTEINT (`op: "disable"`) et ajoute
   `fh:background:en:inheritance`, le seul arrière-plan de la pile FH,
   livré et jamais choisi (contrat §1a). */

test("les quatre arrière-plans du SRD sont ÉTEINTS — la pile FH ne les rend plus", () => {
  const verbs = pile();
  for (const entry of BACKGROUNDS_EXTINGUISHED) {
    assert.equal(verbs.query({ kind: "background", id: entry.target }), null,
      `« ${entry.target} » : disable() retire le record entier de la pile FH`);
  }
  /* ⛔ Et sous le SRD nu, sans la couche FH, les quatre existent toujours —
     `disable` retire de la PILE, jamais du SRD commité (§L7, `op:"disable"`
     rend « ce qu'elle avait désactivé » quand la couche se retire). */
  const srdSeul = pile({ fh: false });
  for (const entry of BACKGROUNDS_EXTINGUISHED) {
    assert.ok(srdSeul.query({ kind: "background", id: entry.target }),
      `« ${entry.target} » : intact sous le SRD pur, hors de la pile Fate's Hand`);
  }
});

test("l'Inheritance est le SEUL arrière-plan de la pile Fate's Hand", () => {
  const verbs = pile();
  const tous = verbs.query({ kind: "background" });
  assert.equal(tous.length, 1, "les quatre du SRD sont éteints, un seul record les remplace");
  assert.equal(tous[0].id, BACKGROUND_INHERITANCE.id);
  assert.equal(tous[0].record.name, "Inheritance");
});

test("l'Inheritance ne porte NI `ability_keys` NI `feat_id` — c'est la règle, pas un oubli", () => {
  const verbs = pile();
  const data = verbs.query({ kind: "background", id: BACKGROUND_INHERITANCE.id }).record.data;
  /* §1c — l'absence D'`ability_keys` EST la règle : un record qui ne nomme pas
     ses clefs ne les restreint pas, donc les SIX caractéristiques sont
     proposées (`decisions.mjs`, `backgroundBoostPlan`). */
  assert.equal(Object.hasOwn(data, "ability_keys"), false);
  /* §1b/§3d — pas de `feat_id` (imposé) : à la place, `feat_choice.from`, le
     don d'origine libre. */
  assert.equal(Object.hasOwn(data, "feat_id"), false);
  assert.deepEqual(data.feat_choice, { from: "origin" });
});

/* ⚠️ PAS DE TEST SÉPARÉ « disable() vise un record absent du SRD » ICI : le
   supprimer changerait aussi le COMPTE (3 au lieu de 4), et c'est le contrôle
   `EXPECTED.backgrounds` qui mordrait, jamais `srdRecord()`. Le test « REFUS —
   un arrière-plan du SRD oublié par la table d'extinction » l'exerce déjà en
   RENOMMANT (compte inchangé, cible introuvable) : ce garde-là, pas un
   nouveau. */

test("REFUS — un cinquième arrière-plan au SRD ferait jeter, au lieu de rester intact en silence", () => {
  const srd = srdAmputé((s) => {
    s.records.background["srd:background:en:hermit"] = {
      name: "Hermit", slug: "hermit", data: { skill_ids: [], ability_keys: ["wis"] }
    };
  });
  assert.throws(() => buildLayer({ srd }), /5 arrière-plans|quatre/i);
});

test("REFUS — un arrière-plan du SRD oublié par la table d'extinction fait jeter", () => {
  const srd = srdAmputé(renomme("background", "srd:background:en:criminal", "srd:background:en:outlaw"));
  assert.throws(() => buildLayer({ srd }), /srd:background:en:criminal/);
});

/* ══ LOT 182 — L'OR DE DÉPART DE L'ORIGINE, RENDU À LA DONNÉE ════════════
   🔴 CE QUE CE GARDE DÉFEND, MESURÉ LE 2026-09-09 : les quatre arrière-plans
   du SRD portent chacun `data.equipment`, dont l'option B est « 50 GP ».
   L'Inheritance les éteint et ne portait AUCUN or — le montant ne vivait plus
   que dans `ui/builder/equipment-step.mjs`, sous la forme d'un
   `INHERITED_PURSE_GP = 50` écrit en dur, hors de toute couche.
   ⛔ Le champ ne vise QUE l'or : §4 a retiré les CHOIX d'arrière-plan
   (compétences, outil, don imposé, clefs), jamais la bourse de départ. */

test("182 — l'Inheritance porte l'or de départ des quatre arrière-plans qu'elle éteint", () => {
  const verbs = pile();
  const data = verbs.query({ kind: "background", id: BACKGROUND_INHERITANCE.id }).record.data;
  assert.equal(typeof data.equipment, "string",
    "sans ce champ, l'or de l'origine ne vit dans aucune couche et un écran le réécrit en dur");
  assert.equal(data.equipment, "50 GP");

  /* ⭐ ET LE 50 N'EST PAS UNE INVENTION DE FATE'S HAND : il est mesuré sur les
     quatre records SRD éteints, qui le portent tous les quatre. */
  const srd = readSrdLayer(SRD_PATH);
  for (const entry of BACKGROUNDS_EXTINGUISHED) {
    const phrase = srd.records.background[entry.target].data.equipment;
    assert.match(phrase, /;\s*or\s*\(B\)\s*50 GP$/,
      `« ${entry.target} » : son option B est l'or que l'Inheritance reprend`);
  }
});

test("REFUS — une Inheritance sans or, alors que les quatre éteints en portent, fait jeter", () => {
  /* ⚔️ LE GARDE, ÉPROUVÉ ROUGE. `BACKGROUND_INHERITANCE` est lu par le
     générateur à l'import : on le prive de son champ le temps d'une passe, et
     on le rend — un garde qu'on n'a jamais vu accuser ne protège rien. */
  const or = BACKGROUND_INHERITANCE.equipment;
  try {
    delete BACKGROUND_INHERITANCE.equipment;
    assert.throws(() => buildLayer({ srd: readSrdLayer(SRD_PATH) }),
      (e) => e instanceof GenError && /equipment/.test(e.message));
    /* ✅ ET IL NE CRIE PAS SUR CE QUI EST JUSTE : si le SRD lui-même ne portait
       plus cet or, il n'y aurait plus rien à reprendre — le garde se tait. */
    const sansOrAuSrd = srdAmputé((s) => {
      for (const entry of BACKGROUNDS_EXTINGUISHED) delete s.records.background[entry.target].data.equipment;
    });
    assert.doesNotThrow(() => buildLayer({ srd: sansOrAuSrd }));
  } finally {
    BACKGROUND_INHERITANCE.equipment = or;
  }
  /* ⛔ ET LA SOURCE EST RENDUE INTACTE — la passe normale repasse. */
  assert.doesNotThrow(() => buildLayer({ srd: readSrdLayer(SRD_PATH) }));
});

/* ══ LOT 184 — LA COUCHE EST UN INTERRUPTEUR, ET ELLE NE FAIT QUE ÇA ═══ */

test("🔴 LOT 184 — la couche ne porte QUE le genre `background` : 4 extinctions + 1 addition", () => {
  const couche = JSON.parse(readFileSync(join(ROOT, FH_INHERITANCE_EN), "utf8"));
  assert.deepEqual(Object.keys(couche.records), ["background"],
    "un genre de plus ici, et l'interrupteur `Inheritance` recommence à emporter autre chose que lui");
  assert.deepEqual(couche.flags, ["fh.inheritance"]);
  const ops = Object.entries(couche.records.background)
    .map(([id, r]) => `${r.op || "add"} ${id}`).sort();
  assert.deepEqual(ops, [
    "add fh:background:en:inheritance",
    "disable srd:background:en:acolyte",
    "disable srd:background:en:criminal",
    "disable srd:background:en:sage",
    "disable srd:background:en:soldier"
  ], "l'extinction des quatre voyage AVEC l'origine qui les remplace : les séparer laisserait " +
     "une pile sans arrière-plan du tout, ou avec cinq");
});

test("🔴 LOT 184 — sans la couche, les quatre du SRD reviennent, et l'Inheritance disparaît", () => {
  /* ⚔️ LE TÉMOIN QUI FAIT DE L'AUTRE UN GARDE. C'est la définition même d'un
     interrupteur : on le coupe, et le SRD reprend sa place. */
  const verbs = pile({ fh: false });
  assert.equal(verbs.query({ kind: "background" }).length, 4);
  assert.equal(verbs.query({ kind: "background", id: BACKGROUND_INHERITANCE.id }), null);
});

/* ══ LE GÉNÉRATEUR — REPRODUCTIBILITÉ ET REFUS ═════════════════════════ */

test("le fichier commité est EXACTEMENT ce que le générateur produit", () => {
  const { layer } = buildLayer({ srd: readSrdLayer(SRD_PATH) });
  assert.equal(serialize(layer), readFileSync(join(ROOT, FH_INHERITANCE_EN), "utf8"),
    "un re-run doit laisser l'arbre propre (loi §0.3)");
});

test("deux générations d'affilée rendent le même octet", () => {
  const dir = mkdtempSync(join(tmpdir(), "fh-inheritance-"));
  try {
    const a = generate({ outDir: dir, srdPath: SRD_PATH });
    const premier = readFileSync(a.outPath, "utf8");
    const b = generate({ outDir: dir, srdPath: SRD_PATH });
    assert.equal(readFileSync(b.outPath, "utf8"), premier, "le générateur est déterministe");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("⭐ LA LISTE DES LANGUES EST RÉSOLUE SUR L'AUTRE COUCHE, jamais recopiée ici", () => {
  /* Elle sort de `gen-fh-trainings-layer.mjs`, et les identifiants qu'elle
     porte désignent des records que CETTE couche ne porte pas. C'est la
     dépendance, écrite dans la donnée. */
  const couche = JSON.parse(readFileSync(join(ROOT, FH_INHERITANCE_EN), "utf8"));
  const octroi = couche.records.background[BACKGROUND_INHERITANCE.id].data.granted_language_choice;
  assert.equal(octroi.count, 2);
  assert.equal(octroi.cost, 0);
  assert.equal(octroi.from.length, 12);
  for (const id of octroi.from) {
    assert.match(id, /^fh:training:en:language-/,
      "les langues offertes sont des records de `fh-trainings-en` : l'octroi PART de cette couche-ci " +
      "et ATTERRIT dans l'autre");
    assert.equal(Object.hasOwn(couche.records.background, id), false);
  }
});

/* ══ LA DÉPENDANCE INHERITANCE → TRAININGS, MESURÉE SUR LA VRAIE PILE ══
   ⚖️ ERIC, 2026-09-08 : *sans la couche `Trainings`, l'Inheritance n'offre plus
   de langue.* Ce n'est pas une règle inventée par ce lot — c'est le
   comportement du moteur, et ce bloc le MESURE au lieu de le déclarer.

   📏 CE QUI A ÉTÉ MESURÉ LE 2026-09-09, sur la pile de la page privée de
   `fh-trainings-en` :
     · le montage NE JETTE PAS, et `rebuild` non plus ;
     · le plan `background.languages` continue de publier ses DOUZE options —
       ce sont des `ref` qui ne désignent plus rien ;
     · `resolved.languages` est VIDE, et la fiche déclare
       `underived.no-language-chosen` ;
     · une langue DÉJÀ choisie devient un refus NOMMÉ, `choice.ref-missing`,
       un par langue — le moteur ne l'avale pas en silence.
   ⇒ IL DÉGRADE, IL N'ÉCHOUE PAS. */

const SANS_TRAININGS = PILE.filter((f) => !f.includes("fh-trainings-en"));

function documentDe(h, choices) {
  return {
    schema: "fh-char/1", id: "lot184-dependance", name: "Dependance", lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/fh-inheritance", version: "1.0.0" },
    created: "2026-09-09T09:00:00Z", modified: "2026-09-09T09:00:00Z",
    build: { layers: manifestOf(h.layers), choices: structuredClone(choices), budgets: {}, overrides: [] }
  };
}

const CHOIX_DE_BASE = [
  { path: "level", value: 1 },
  { path: "class", ref: { kind: "class", id: "srd:class:en:wizard" } },
  { path: "species", ref: { kind: "species", id: "srd:species:en:human" } },
  { path: "background", ref: { kind: "background", id: BACKGROUND_INHERITANCE.id } },
  { path: "abilities.str", value: 10 }, { path: "abilities.dex", value: 10 },
  { path: "abilities.con", value: 10 }, { path: "abilities.int", value: 10 },
  { path: "abilities.wis", value: 10 }, { path: "abilities.cha", value: 10 },
  { path: "currency.cp", value: 0 }, { path: "currency.sp", value: 0 },
  { path: "currency.gp", value: 0 }, { path: "currency.pp", value: 0 }
];

const DEUX_LANGUES = [
  { path: "background.languages[0]", ref: { kind: "training", id: "fh:training:en:language-human" } },
  { path: "background.languages[1]", ref: { kind: "training", id: "fh:training:en:language-elf" } }
];

function replier(couches, choix) {
  const h = makeHarness({ layers: couches, modules: createFhLayer() });
  const doc = documentDe(h, choix);
  const out = h.verbs.rebuild({ document: doc });
  const validation = h.verbs.validate({ document: documentDe(h, choix) });
  return { h, out, validation };
}

/* ⚠️ `underived` EST SUR LA SORTIE DE `rebuild`, PAS SOUS `resolved` — mesuré,
   après avoir lu un `undefined` sans broncher. Un accès qui rend `undefined`
   se lit comme « rien à déclarer », et le témoin serait resté vert sur une
   pile qui déclare tout. D'où le refus juste dessous. */
const clefsUnderived = (out) => {
  assert.ok(Array.isArray(out.underived),
    "témoin de l'outil — `rebuild().underived` doit être une liste ; si le champ déménage, ce garde " +
    "doit rougir, pas lire un `undefined` et conclure « rien de déclaré »");
  return out.underived.map((d) => d.key);
};
const clefsDeRefus = (validation) => (validation.violations || []).map((v) => v.key);

test("⚖️ TÉMOIN — pile COMPLÈTE : les deux langues se résolvent, et rien n'est déclaré non dérivé", () => {
  /* ⚔️ SANS CE TÉMOIN, le test suivant serait vrai d'une pile qui n'a JAMAIS
     su résoudre une langue — « rien n'arrive » ne distingue pas la dégradation
     de la panne permanente. C'est lui qui donne son sens à l'autre. */
  const { out, validation } = replier(PILE, [...CHOIX_DE_BASE, ...DEUX_LANGUES]);
  assert.deepEqual(out.resolved.languages,
    [{ id: "language-human", name: "Human" }, { id: "language-elf", name: "Elf" }]);
  assert.equal(clefsUnderived(out).includes("underived.no-language-chosen"), false);
  assert.equal(clefsDeRefus(validation).includes("choice.ref-missing"), false,
    "aucune référence morte tant que la couche des trainings est là");
});

test("⚖️ LA DÉPENDANCE — sans `fh-trainings-en`, l'Inheritance n'offre plus de langue : le moteur DÉGRADE", () => {
  /* ⛔ ET LE PREMIER FAIT MESURÉ EST QU'IL NE JETTE PAS. Si un jour ce montage
     échouait au lieu de dégrader, ce serait un arbitrage d'Eric à rouvrir, pas
     une réparation à faire ici — d'où cette assertion, qui est la plus
     importante des trois. */
  let mesure;
  assert.doesNotThrow(() => { mesure = replier(SANS_TRAININGS, [...CHOIX_DE_BASE, ...DEUX_LANGUES]); },
    "le montage et la reconstruction traversent : une couche absente est une ABSENCE, pas une panne");
  const { h, out, validation } = mesure;

  assert.equal(h.layers.verbs.query({ kind: "training" }).length, 0,
    "témoin — la pile mesurée est bien privée de son catalogue de trainings");
  assert.ok(h.layers.verbs.query({ kind: "background", id: BACKGROUND_INHERITANCE.id }),
    "témoin — et l'Inheritance, elle, est toujours là : c'est ELLE qu'on observe dégrader");

  assert.deepEqual(out.resolved.languages, [],
    "aucune langue résolue — `derive.mjs` lit chaque `ref` par `reader.maybe(\"training\", …)` " +
    "et n'en trouve aucune");
  assert.ok(clefsUnderived(out).includes("underived.no-language-chosen"),
    "la fiche DÉCLARE le manque plutôt que d'afficher une rubrique vide sans raison");

  /* ⚠️ ET LA NUANCE, MESURÉE : le plan continue de PUBLIER ses douze options.
     Ce sont des identifiants qui ne désignent plus rien. Le moteur ne les
     avale pas pour autant — une langue déjà choisie devient un refus NOMMÉ. */
  const plan = out.decisions.find((d) => d.path === "background.languages");
  assert.equal(plan.options.length, 12,
    "l'octroi est écrit dans la couche de l'Inheritance : il survit à l'absence de sa cible");
  assert.deepEqual(clefsDeRefus(validation).filter((k) => k === "choice.ref-missing"),
    ["choice.ref-missing", "choice.ref-missing"],
    "un refus par langue morte, nommé — le silence aurait été le vrai défaut");
});

test("⚖️ ET SANS AUCUNE LANGUE CHOISIE, la pile amputée ne produit AUCUN refus — juste la déclaration", () => {
  /* 📏 La distinction qui compte pour un joueur qui ouvre le builder : il ne
     lit pas une erreur, il lit une rubrique qui manque et qui le dit. */
  const { out, validation } = replier(SANS_TRAININGS, CHOIX_DE_BASE);
  assert.deepEqual(out.resolved.languages, []);
  assert.ok(clefsUnderived(out).includes("underived.no-language-chosen"));
  assert.equal(clefsDeRefus(validation).includes("choice.ref-missing"), false,
    "rien à refuser : le personnage n'a pas choisi de langue, il n'en a simplement aucune à choisir");
});
