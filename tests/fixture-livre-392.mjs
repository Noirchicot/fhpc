/* ══ 🎖️ LOT 392 — UN CHAPITRE DE DONS POUR LES TESTS, JAMAIS LE PHB ════════════════════════════════
   ARCHI 35 : les gardes se prouvent *« sur une fixture inventée »*. Cette fixture a la FORME de
   `sources-livres/phb-2024-feats.json` (des faits de jeu relevés sur les pages du compendium) ; ses
   dons propres sont INVENTÉS (Test Stance, Lantern Scholar, Boon of Testing). Ses dons partagés
   reprennent les faits de la couche SRD 5.2.1 (CC-BY), pour que la comparaison ait un frère — un écart
   y est planté (Grappler : un prérequis amputé de la Dextérité).
   ⛔ Ce fichier n'est pas une suite : il n'a pas le suffixe `.test.mjs`. */
import { readJson } from "./build-harness.mjs";
import { construireDons } from "../src/tools/gen-livre-layer.mjs";
import { coucheAvecSorts } from "./fixture-livre-389.mjs";

export const URL_DONS = "https://www.dndbeyond.com/feats/test";

export function sourceDons({ complet = false } = {}) {
  return {
    meta: { livre: "test", complet },
    feats: [
      { name: "Archery", category: "fighting-style", prerequisite: "Fighting Style Feature", repeatable: false, shared: true },
      { name: "Grappler", category: "general", prerequisite: "Level 4+, Strength 13+", repeatable: false, shared: true },
      { name: "Ability Score Improvement", category: "general", prerequisite: "Level 4+", repeatable: true, shared: true },
      { name: "Boon of Truesight", category: "epic-boon", prerequisite: "Level 19+", repeatable: false, shared: true },
      { name: "Test Stance", category: "fighting-style", prerequisite: "Fighting Style Feature", repeatable: false,
        url: `${URL_DONS}/test-stance`, page: 1, resume: "An invented style: a steadier guard while you hold a shield.",
        faits: { senses: [{ id: "blindsight", name: "Blindsight", range_ft: 10 }] } },
      { name: "Lantern Scholar", category: "general", prerequisite: "Level 4+, Intelligence 13+", repeatable: true,
        url: `${URL_DONS}/lantern-scholar`, page: 2, resume: "An invented feat: +1 Intelligence, training with Medium armor, and a once-per-rest insight.",
        ability_increase: { from: ["int"], amount: 1, max: 20 },
        faits: { armor_training: "Medium armor", uses: [{ id: "flash-of-insight", name: "Flash of Insight", max: 1, recharge: "short" }], tool: "Cartographer's Tools" } },
      { name: "Boon of Testing", category: "epic-boon", prerequisite: "Level 19+", repeatable: false,
        url: `${URL_DONS}/boon-of-testing`, page: 3, resume: "An invented boon: +1 to any ability, and 30 more feet of Speed.",
        ability_increase: { from: ["str", "dex", "con", "int", "wis", "cha"], amount: 1, max: 30 }, faits: { speed_bonus_ft: 30 } }
    ]
  };
}

export function donsFixture(options) {
  return construireDons(sourceDons(options), { srd: readJson("layers/srd-5.2.1-en.layer.json") });
}

/** La couche du livre de test : origines (387), sorts (389) ET dons (392), dans un seul fichier, comme le PHB. */
export function coucheAvecDons() {
  const layer = coucheAvecSorts();
  return { ...layer, records: { ...layer.records, feat: { ...(layer.records.feat || {}), ...donsFixture().records.feat } } };
}
