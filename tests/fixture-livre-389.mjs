/* ══ 🪄 LOT 389 — UN CHAPITRE DE SORTS POUR LES TESTS, JAMAIS LE PHB ═══════════════════════════════
   ARCHI 35 : les gardes se prouvent *« sur une fixture inventée »*. Cette fixture a la FORME de
   `sources-livres/phb-2024-spells.json` (des faits de jeu tels que le compendium les écrit) ; ses sorts
   propres sont INVENTÉS (Test Ember, Lantern Ward, Test Bolt). Ses sorts partagés sont RÉÉCRITS depuis
   la couche SRD 5.2.1 (CC-BY) dans la forme du compendium, pour que la comparaison ait un frère — un
   écart y est planté (Light), et un nom y est changé (le SRD nomme « Acid Arrow » un sort que le livre
   inventé appelle « Zanthor's Acid Arrow »).
   ⛔ Ce fichier n'est pas une suite : il n'a pas le suffixe `.test.mjs`. */
import { readJson } from "./build-harness.mjs";
import { construireSorts } from "../src/tools/gen-livre-layer.mjs";
import { coucheFixture } from "./fixture-livre-387.mjs";

export const URL_SORTS = "https://www.dndbeyond.com/spells/test";

/** Un sort SRD, écrit comme le compendium l'écrit (« 1 Action », « 90 ft. », « 1 Minute » + drapeau). */
export function commeLeCompendium(srd, nom, retouches = {}) {
  const r = Object.values(srd.records.spell).find((s) => s.name === nom);
  if (!r) throw new Error(`fixture 389 : « ${nom} » n'est pas au SRD`);
  const d = r.data;
  const titre = (s) => s.replace(/\b[a-z]/g, (c) => c.toUpperCase());
  const temps = d.casting_time.replace(/ or Ritual$/, "").replace(/^(Action|Bonus Action|Reaction)(,.*)?$/s, "1 $1");
  const duree = d.duration.replace(/^Concentration,? up to /, "");
  return {
    name: nom, level: d.level, school: d.school, components: d.components.replace(/\s*\(.*$/s, "").split(", "),
    casting_time: /^\d/.test(temps) && !/^1 (Action|Bonus Action|Reaction)$/.test(temps) ? titre(temps) : temps,
    duration: /^\d/.test(duree) ? titre(duree) : duree, range: d.range.replace(/ feet$/, " ft."), area: null,
    concentration: d.concentration, ritual: d.ritual, attack_save: null, ...retouches
  };
}

export function sourceSorts({ complet = false } = {}) {
  const srd = readJson("layers/srd-5.2.1-en.layer.json");
  return {
    meta: { livre: "test", complet },
    spells: [
      commeLeCompendium(srd, "Fireball"),
      commeLeCompendium(srd, "Light", { level: 1 }),
      { ...commeLeCompendium(srd, "Acid Arrow"), name: "Zanthor's Acid Arrow", srd_name: "Acid Arrow" },
      { name: "Test Ember", level: 0, school: "evocation", components: ["V", "S"], casting_time: "1 Action",
        duration: "Instantaneous", range: "60 ft.", area: null, concentration: false, ritual: false, attack_save: "DEX Save",
        url: `${URL_SORTS}/test-ember`, classes: ["Sorcerer", "Wizard"], damage: [{ types: ["fire"], dice: "1d8" }],
        resume: "An invented cantrip: a spark that burns a creature that fails a Dexterity save." },
      { name: "Lantern Ward", level: 1, school: "abjuration", components: ["V", "S", "M"], casting_time: "1 Action",
        duration: "10 Minutes", range: "Self", area: "(10 ft. )", concentration: true, ritual: true, attack_save: null,
        url: `${URL_SORTS}/lantern-ward`, classes: ["Cleric", "Wizard"],
        resume: "An invented ritual: a ward of light around you while you concentrate." },
      { name: "Test Bolt", level: 2, school: "evocation", components: ["V", "S"], casting_time: "1 Bonus Action *",
        duration: "1 Minute", range: "120 ft.", area: null, concentration: true, ritual: false, attack_save: "Ranged",
        url: `${URL_SORTS}/test-bolt`, classes: ["Wizard"], damage: [{ types: ["lightning"], dice: "3d6" }],
        resume: "An invented bolt: a ranged spell attack, then more lightning while you concentrate." }
    ]
  };
}

export function sortsFixture(options) {
  return construireSorts(sourceSorts(options), { srd: readJson("layers/srd-5.2.1-en.layer.json") });
}

/** La couche du livre de test : les origines du lot 387 ET les sorts, dans un seul fichier, comme le PHB. */
export function coucheAvecSorts() {
  const { layer } = coucheFixture();
  return { ...layer, records: { ...layer.records, spell: sortsFixture().records.spell } };
}
