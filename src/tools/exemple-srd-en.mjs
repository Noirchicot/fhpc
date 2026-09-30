/* ══ 🧾 LOT 379 — L'EXEMPLE SRD ANGLAIS, GÉNÉRÉ ═══════════════════════════════════════════
   ⚖️ ARCHI 35, 30/09 (voie c) : *« l'exemple FR est figé et dit ce qu'il est, une fixture de la
   pile FR. Un exemple SRD anglais est généré par src/tools/exemple-srd-en.mjs sur la pile montée,
   gardé octet pour octet. C'est lui qui s'ouvre par Open a file… et prouve l'Initiative et la
   Perception passive. »*

   📏 POURQUOI UN SECOND EXEMPLE : `examples/personnage-srd-fr-niveau1.fh-char.json` déclare la pile
   `srd-5.2.1-fr` + `exemple-homebrew-fr`, que l'app ne monte jamais ; ouvert, il se recale sur la
   pile SRD et bute sur trois choix de la couche homebrew (mesuré au lot 379). Il reste la graine du
   personnage d'acceptation de treize suites — figé, et c'est `examples/README.md` qui le dit.

   ⭐ LE CAS DU TEXTE : un magicien elfe, Keen Senses sur Perception, arrière-plan Criminal — donc le
   don Alert. Sa fiche porte les trois phrases du SRD 5.2.1 que le lot 379 fait calculer :
   « Your Initiative score equals 10 plus your Dexterity modifier » ; « you can add your Proficiency
   Bonus to the roll » (Alert) ; « 10 plus the creature’s Wisdom (Perception) check bonus ».

   ⛔ GÉNÉRÉ, JAMAIS ÉCRIT À LA MAIN, par la MÊME mécanique que l'exemple FH (`plierUnExemple`) :
   `resolved` n'est écrit que par la dérivation. La pile est celle que l'app monte en SRD
   (`SRD_LAYER_ID` + `SRFH_LAYER_IDS`, universe-step.mjs) : le fichier s'ouvre sans recalage.
     · `exempleSrdEn()` — `{document, report}` en mémoire (les tests) ;
     · `node src/tools/exemple-srd-en.mjs` — écrit le document dans `examples/`. */

import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { plierUnExemple, octetsDe } from "./exemple-fh-en.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export const SORTIE = "examples/personnage-srd-en-niveau1.fh-char.json";

/** La pile SRD de l'app, de bas en haut (garde : `tests/fiche-vraie.test.mjs`, contre `SRD_LAYER_ID`
 *  et `SRFH_LAYER_IDS`). */
export const PILE = [
  "layers/srd-5.2.1-en.layer.json",
  "layers/srfh-shelving-en.layer.json",
  "layers/srfh-mecaniques-en.layer.json"
];

const CHOIX = [
  { path: "class", ref: { kind: "class", id: "srd:class:en:wizard" }, label: "Wizard" },
  { path: "species", ref: { kind: "species", id: "srd:species:en:elf" }, label: "Elf" },
  { path: "species.lineage[0]", value: "high-elf", label: "High Elf" },
  { path: "species.lineage[0].ability[0]", value: "int", label: "Elven Lineage: Intelligence" },
  /* Keen Senses : « proficiency in the Insight, Perception, or Survival skill » — Perception. */
  { path: "species.skills[0]", value: "perception", label: "Keen Senses: Perception" },
  { path: "background", ref: { kind: "background", id: "srd:background:en:criminal" }, label: "Criminal" },
  { path: "background.originFeat[0]", ref: { kind: "feat", id: "srd:feat:en:alert" }, label: "Alert" },
  { path: "abilities.mode", value: "standard", label: "Standard array" },
  { path: "abilities.str", value: 8 },
  { path: "abilities.dex", value: 14 },
  { path: "abilities.con", value: 13 },
  { path: "abilities.int", value: 15 },
  { path: "abilities.wis", value: 12 },
  { path: "abilities.cha", value: 10 },
  { path: "background.boost.int", value: 2 },
  { path: "background.boost.dex", value: 1 },
  { path: "class.skills[0]", value: "arcana" },
  { path: "class.skills[1]", value: "investigation" },
  { path: "class.cantrips[0]", ref: { kind: "spell", id: "srd:spell:en:ray-of-frost" } },
  { path: "class.cantrips[1]", ref: { kind: "spell", id: "srd:spell:en:light" } },
  { path: "class.cantrips[2]", ref: { kind: "spell", id: "srd:spell:en:mage-hand" } },
  { path: "class.prepared[0]", ref: { kind: "spell", id: "srd:spell:en:magic-missile" } },
  { path: "class.prepared[1]", ref: { kind: "spell", id: "srd:spell:en:shield" } },
  { path: "class.prepared[2]", ref: { kind: "spell", id: "srd:spell:en:detect-magic" } },
  { path: "class.prepared[3]", ref: { kind: "spell", id: "srd:spell:en:sleep" } },
  { path: "gear[0]", ref: { kind: "weapon", id: "srd:weapon:en:dagger" } },
  { path: "gear[0].quantity", value: 2 },
  { path: "gear[0].equipped", value: true },
  { path: "gear[1]", ref: { kind: "gear", id: "srd:gear:en:backpack" } },
  { path: "gear[1].quantity", value: 1 },
  { path: "gear[1].equipped", value: true },
  { path: "gear[2]", ref: { kind: "gear", id: "srd:gear:en:book" } },
  { path: "gear[2].quantity", value: 1 },
  { path: "gear[2].equipped", value: false },
  { path: "currency.cp", value: 0 },
  { path: "currency.sp", value: 0 },
  { path: "currency.gp", value: 16 },
  { path: "currency.pp", value: 0 }
];

/** Monte la pile SRD, plie le personnage, rend le document ET le rapport. */
export function exempleSrdEn() {
  return plierUnExemple({
    pile: PILE,
    modules: [],
    identite: { name: "Vesna Quickthorn", id: "example-vesna-srd-en", at: "2026-09-30T09:00:00Z",
      generator: { name: "src/tools/exemple-srd-en", version: "1.0.0" } },
    choix: CHOIX,
    overrides: []
  });
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { document, report } = exempleSrdEn();
  writeFileSync(join(ROOT, SORTIE), octetsDe(document));
  process.stdout.write(`écrit : ${SORTIE}\n`);
  process.stdout.write(`  rubriques de resolved   : ${Object.keys(document.resolved).length}\n`);
  process.stdout.write(`  déclarations non dérivé : ${report.underived.length}\n`);
  process.stdout.write(`  choix non consommés     : ${report.unconsumed.length}\n`);
  process.stdout.write(`  avertissements          : ${report.warnings.length}\n`);
}
