/* ══ LE DOCUMENT D'EXEMPLE DU LOT 25 — ANGLAIS, COUCHE FH MONTÉE ══════

   POURQUOI IL A FALLU EN FABRIQUER UN. `examples/personnage-srd-fr-niveau1
   .fh-char.json` est un magicien elfe FRANÇAIS, SRD SEUL : il porte
   `stats: []`. Or `stats` est la seule rubrique de `resolved` qui porte son
   propre détail (`breakdown`), et c'est celle que le lot 25 doit REGARDER.
   Avec ce document-là, l'écran n'en montrerait rien. La table d'Eric joue en
   anglais : l'exemple neuf l'est aussi.

   ⚠️ IL EST GÉNÉRÉ, JAMAIS ÉCRIT À LA MAIN. `resolved` n'est écrit que par la
   dérivation (invariant n°1) ; un `resolved` tapé au clavier serait une
   IMITATION du moteur, et elle divergerait au premier changement de règle.

   DÉTERMINISME. L'horloge est fixe, les dates sont fixes, la pile est lue
   depuis `layers/` : deux exécutions produisent des octets identiques, et un
   re-run laisse l'arbre propre (discipline `gen-srd-layer.mjs`).

   Deux usages :
     · `exempleFhEn()` — rend `{document, report}` EN MÉMOIRE. C'est par là que
       passent `fiche.mjs` et les tests : le rapport de dérivation n'a aucune
       place dans le document (voir INVENTAIRE-LOT-25.md, trou n°1), donc il
       n'existe qu'ici, au moment où le moteur vient de parler.
     · `node src/tools/exemple-fh-en.mjs` — écrit le document dans `examples/`.
*/

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { createLayers } from "../layers/index.mjs";
import { createBuild } from "../build/index.mjs";
import { createFhDestinyStat } from "../modules/fh/destiny-stat.mjs";
import { createFhSkillPoolStat } from "../modules/fh/skill-pool.mjs";
import { createFhSpeciesTraits } from "../modules/fh/species-traits.mjs";
import { itemsDeLEtape } from "../../ui/builder/parcours.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export const SORTIE = "examples/personnage-fh-en-niveau1.fh-char.json";

/** La pile, de bas en haut. Le SRD anglais porte la matière ; les trois
 *  couches Fate's Hand lèvent les drapeaux qui allument les modules. */
/* LOT 77 — `fh-fiche-en` et `fh-lore-en` ferment la pile. MÊME ORDRE que
   `ui/builder/engine.mjs` (LAYER_FILES) : elles `patch` des records posés
   plus bas, et une pile qui diverge de celle du navigateur ferait diverger
   les tests de l'écran sans qu'un seul rougisse. */
/* EXPORTÉE pour `tests/fiche-360.test.mjs` (garde 3), sur le précédent de
   `LAYER_FILES` : le garde compare les DEUX listes réelles, jamais deux
   recopies qui pourraient diverger de la même façon que les piles. */
/* 🔴 UNE DE CES COUCHES N'EST PAS ÉCRITE ICI — découvert le 2026-08-21, à la
   dure. `fh-lore-en.layer.json` est **produite par un AUTRE dépôt** :
   `~/tools/fh-phb/sync_from_vault.py:2074` l'écrit depuis les chapitres du
   vault, à chaque publication du site. La presse publie dans TROIS dépôts —
   `fh-phb`, celui-ci, et `fh-skills` — et rien ne le disait nulle part.

   ⚠️ CE QUE ÇA COÛTE QUAND ON L'IGNORE : une passe de publication modifie la
   couche, donc son empreinte SHA-256, donc `examples/personnage-fh-en-
   niveau1.fh-char.json` et `exports/fh-changes.json` cessent de correspondre.
   Deux suites rougissent en accusant « une couche a changé sans que la passe
   soit rejouée » — et elles ont raison, mais la passe en question n'est pas
   la nôtre. Trois fils ont cherché un quart d'heure avant de trouver.

   ⭐ ET CE N'EST PAS UN DÉFAUT D'ARCHITECTURE : le vault est le manuscrit, le
   lore des espèces en descend, et il est juste qu'il coule jusqu'ici. Ce qui
   manquait n'était pas une frontière, c'était sa DÉCLARATION. La voici. */
export const PILE = [
  "layers/srd-5.2.1-en.layer.json",
  /* LOT 95 — même place que dans `LAYER_FILES` : le rang 15 déclaré par
     fh-srd, juste au-dessus du livre. Le garde 3 de `fiche-360` compare les
     deux listes, donc une seule des deux ne peut pas bouger. */
  "layers/srfh-shelving-en.layer.json",
  "layers/fh-species-en.layer.json",
  "layers/fh-skills-en.layer.json",
  "layers/fh-arcana-en.layer.json",
  "layers/fh-feats-en.layer.json",
  "layers/fh-spells-en.layer.json",
  "layers/fh-fiche-en.layer.json",
  "layers/fh-lore-en.layer.json"
];

/* Un bus minimal : `layers` n'a besoin que d'`emit`, `build` a besoin d'`on`.
   Même forme qu'au noyau, sans le registre (qui est un singleton). */
function bus() {
  const ecoute = new Map();
  return {
    on(type, fn) {
      if (!ecoute.has(type)) ecoute.set(type, new Set());
      ecoute.get(type).add(fn);
      return () => ecoute.get(type).delete(fn);
    },
    emit(type, data) {
      const event = Object.assign({ type }, data);
      const set = ecoute.get(type);
      if (set) for (const fn of set) fn(event);
      return event;
    }
  };
}

/** Les choix du personnage. Tout ce qui se décide se décide ICI : `resolved`
 *  en découle, et rien ne s'y ajoute après coup. */
const CHOIX = [
  { path: "level", value: 1, label: "Level 1" },
  { path: "class", ref: { kind: "class", id: "srd:class:en:wizard" }, label: "Wizard" },
  { path: "species", ref: { kind: "species", id: "srd:species:en:elf" }, label: "Elf" },
  { path: "species.lineage", value: "high-elf", label: "High Elf" },
  /* LOT 34 — Keen Senses est un budget captif de 2 points sur trois
     compétences (survival, delve, vigilance), plus un choix compté :
     ½ sur deux d'entre elles est l'une des deux répartitions légales. */
  { path: "species.skillBudget.survival", value: "novice", label: "Keen Senses: Survival (Novice)" },
  { path: "species.skillBudget.vigilance", value: "novice", label: "Keen Senses: Vigilance (Novice)" },
  /* LOT 43 — PLUS DE CHOIX `background`. L'Inheritance (`fh:background:en:
     inheritance`) est le SEUL record du genre une fois les quatre du SRD
     éteints : elle est livrée, jamais choisie (contrat §1a). `decisions.mjs`
     la résout toute seule (le repli à une option) — c'est le document réel
     qui exerce ce chemin, pas seulement une suite dédiée.
     Le don d'origine est à SA place — celle que la table de couverture v1
     range sous `background.originFeat[n]`, et pas dans le namespace d'un
     module : un personnage ne déclare pas son don deux fois. */
  { path: "background.originFeat[0]", ref: { kind: "feat", id: "fh:feat:en:auspicious" }, label: "Origin feat" },
  /* La carte, par `ref`, comme l'espèce et la classe. */
  { path: "fh.destiny.arcana", ref: { kind: "arcana", id: "fh:arcana:en:the-hermit" }, label: "The Hermit" },
  { path: "abilities.mode", value: "standard", label: "Standard array" },
  { path: "abilities.str", value: 8 },
  { path: "abilities.dex", value: 14 },
  { path: "abilities.con", value: 13 },
  { path: "abilities.int", value: 15 },
  { path: "abilities.wis", value: 12 },
  { path: "abilities.cha", value: 10 },
  { path: "background.boost.int", value: 2 },
  { path: "background.boost.con", value: 1 },
  /* ⭐ LES POINTS LIÉS DE LA CLASSE — 2026-08-20. Le Magicien en a DEUX, et il
     les place lui-même dans sa liste (canon §B.1). Ils remplacent les deux
     `class.skills[n]` du système SRD, qui ne coûtaient rien au pool et
     n'accordaient rien : la compétence cochée ressortait `proficiency: "none"`,
     mesuré. Ici, deux novices — donc deux demi-maîtrises réelles. */
  { path: "class.skillBudget.arcana", value: "novice" },
  { path: "class.skillBudget.investigation", value: "novice" },
  { path: "class.cantrips[0]", ref: { kind: "spell", id: "srd:spell:en:ray-of-frost" } },
  { path: "class.cantrips[1]", ref: { kind: "spell", id: "srd:spell:en:light" } },
  { path: "class.cantrips[2]", ref: { kind: "spell", id: "srd:spell:en:prestidigitation" } },
  { path: "class.prepared[0]", ref: { kind: "spell", id: "srd:spell:en:magic-missile" } },
  { path: "class.prepared[1]", ref: { kind: "spell", id: "srd:spell:en:shield" } },
  { path: "class.prepared[2]", ref: { kind: "spell", id: "srd:spell:en:detect-magic" } },
  { path: "class.prepared[3]", ref: { kind: "spell", id: "srd:spell:en:sleep" } },
  /* ⭐ LES DEUX LANGUES DE L'HÉRITAGE — 2026-08-20. Elles remplacent
     `languages[0] = "draconic"`, un choix que PERSONNE NE LISAIT : le chemin
     n'était consommé par rien, et il ressortait `unconsumed` sur le personnage
     d'acceptation depuis le premier jour. Un exemple qui porte une intention
     sans effet apprend la mauvaise chose à qui le lit.
     ⛔ Et « Draconic » n'existe pas dans Fate's Hand : une langue porte le nom
     de son PEUPLE, et rien d'autre — Elf, Dwarf, Orc, jamais « elvish ». */
  { path: "background.languages[0]", ref: { kind: "training", id: "fh:training:en:language-elf" } },
  { path: "background.languages[1]", ref: { kind: "training", id: "fh:training:en:language-human" } },
  { path: "gear[0]", ref: { kind: "weapon", id: "srd:weapon:en:dagger" } },
  { path: "gear[0].quantity", value: 1 },
  { path: "gear[0].equipped", value: true },
  { path: "gear[1]", ref: { kind: "weapon", id: "srd:weapon:en:quarterstaff" } },
  { path: "gear[1].quantity", value: 1 },
  { path: "gear[1].equipped", value: true },
  { path: "gear[2]", ref: { kind: "gear", id: "srd:gear:en:book" } },
  { path: "gear[2].quantity", value: 1 },
  { path: "gear[2].equipped", value: false },
  { path: "gear[3]", ref: { kind: "gear", id: "srd:gear:en:component-pouch" } },
  { path: "gear[3].quantity", value: 1 },
  { path: "gear[3].equipped", value: true },
  { path: "gear[4]", ref: { kind: "tool", id: "srd:tool:en:calligrapher-s-supplies" } },
  { path: "gear[4].quantity", value: 1 },
  { path: "gear[4].equipped", value: false },
  { path: "gear[5]", ref: { kind: "gear", id: "srd:gear:en:backpack" } },
  { path: "gear[5].quantity", value: 1 },
  { path: "gear[5].equipped", value: true },
  { path: "gear[6]", ref: { kind: "gear", id: "srd:gear:en:rations" } },
  { path: "gear[6].quantity", value: 5 },
  { path: "gear[6].equipped", value: false },
  { path: "gear[7]", ref: { kind: "gear", id: "srd:gear:en:torch" } },
  { path: "gear[7].quantity", value: 2 },
  { path: "gear[7].equipped", value: false },
  { path: "currency.cp", value: 4 },
  { path: "currency.sp", value: 12 },
  { path: "currency.gp", value: 8 },
  { path: "currency.pp", value: 0 }
];

/* DEUX SURCHARGES, ET ELLES SONT LÀ POUR ÊTRE REGARDÉES. Le rendu apparie le
   chemin qu'il affiche avec `build.overrides[].path` — sans une seule
   surcharge dans l'exemple, cet appariement ne serait jamais exercé à l'œil. */
const OVERRIDES = [
  {
    path: "resolved.vitals.hpMax",
    value: 9,
    note: "The GM grants one extra hit point: the night of study counts as a Long Rest here.",
    by: "gm"
  },
  {
    path: "resolved.gear[torch].quantity",
    value: 4,
    note: "Two more torches bought on the road.",
    by: "player"
  }
];

/** Monte la pile, plie le personnage, rend le document ET le rapport. */
export function exempleFhEn() {
  const b = bus();
  const layers = createLayers({ bus: b });
  const dispatch = (route, payload) => {
    const [bloc, verbe] = route.split(".");
    if (bloc !== "layers") throw new Error(`exemple-fh-en : route inattendue « ${route} »`);
    return layers.verbs[verbe](payload);
  };

  /* Horloge FIXE. `derivation.at` en dépend, et c'est lui qui ferait diverger
     deux exécutions du générateur. */
  const now = () => "2026-08-09T09:00:00Z";
  const build = createBuild({
    bus: b,
    dispatch,
    now,
    modules: [createFhDestinyStat(), createFhSkillPoolStat(), createFhSpeciesTraits()]
  });

  for (const fichier of PILE) {
    layers.verbs.register({ bytes: readFileSync(join(ROOT, fichier)), origin: fichier });
  }

  const manifeste = layers.verbs.stack()
    .filter((couche) => couche.enabled)
    .map((couche) => ({ id: couche.id, version: couche.version, hash: couche.hash, name: couche.name }));

  const document = {
    schema: "fh-char/1",
    id: "example-ilyra-fh-en",
    name: "Ilyra Duskleaf",
    lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "src/tools/exemple-fh-en", version: "1.0.0" },
    created: "2026-08-09T09:00:00Z",
    modified: "2026-08-09T09:00:00Z",
    build: {
      layers: manifeste,
      choices: structuredClone(CHOIX),
      budgets: {},
      overrides: structuredClone(OVERRIDES)
    }
  };

  /* ══ LES SIGNATURES D'UN PERSONNAGE FINI — 27/08 ══════════════════════════
     Mesuré au banc par l'architecte en formation : Ilyra affichait « High Elf
     Lineage » et « Skill budget Spent » sur ses portes avec les DEUX voyants
     éteints — la contradiction exacte que la loi de la porte interdit, rendue
     sur le personnage TÉMOIN. L'écran disait vrai : ce document était rempli
     mais jamais signé (`build.confirmed` absent). Un exemple « fini » doit
     porter les signatures qu'un joueur aurait posées en le finissant.
     ⭐ LE CRITÈRE EST STRUCTUREL, pas une liste d'étapes : une racine de
     parcours est un plan SANS point (`species`, `class`, `background`) qui a
     des items dessous ; on signe la racine et ses items quand tout est
     répondu — les mêmes chemins que `pressDone` écrit, lus par le même organe
     (`itemsDeLEtape`). ⛔ `abilities` n'a pas de plan racine : pas un
     parcours, pas de signature. */
  const premier = build.verbs.rebuild({ document });
  const racines = premier.decisions
    .filter((plan) => plan && typeof plan.path === "string" && !/[.[]/.test(plan.path))
    .map((plan) => plan.path);
  const signatures = [];
  for (const racine of racines) {
    const items = itemsDeLEtape({ decisions: premier.decisions, document: premier.document, racine });
    if (items.length > 0 && items.every((item) => item.repondu)) {
      signatures.push(racine, ...items.map((item) => item.path));
    }
  }
  /* la même forme que l'écrivain `confirm` : uniques, triés — deux exécutions
     rendent le même octet. */
  document.build.confirmed = [...new Set(signatures)].sort();

  const report = build.verbs.rebuild({ document });
  return { document: report.document, report, layers, build };
}

/** Les octets tels qu'ils sont commités — deux espaces, un saut final. */
export function octetsDe(document) {
  return Buffer.from(JSON.stringify(document, null, 2) + "\n", "utf8");
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { document, report } = exempleFhEn();
  const cible = join(ROOT, SORTIE);
  writeFileSync(cible, octetsDe(document));
  process.stdout.write(`écrit : ${SORTIE}\n`);
  process.stdout.write(`  rubriques de resolved : ${Object.keys(document.resolved).length}\n`);
  process.stdout.write(`  stats publiées        : ${document.resolved.stats.map((stat) => stat.id).join(", ") || "(aucune)"}\n`);
  process.stdout.write(`  déclarations non dérivé : ${report.underived.length}\n`);
  process.stdout.write(`  avertissements          : ${report.warnings.length}\n`);
}
