/* Les fichiers de couche que la page monte — MÊME liste et MÊME ordre que
   `ui/builder/engine.mjs`. ⛔ Elle est recopiée ici plutôt qu'importée parce
   qu'`engine.mjs` ne s'importe pas sous Node (il n'existe que dans un
   navigateur : `fetch`, `import.meta.url` versionné). Un garde tient déjà les
   listes ensemble — `tests/fiche-360.test.mjs`, garde 3. */
export const LAYER_FILES = [
  "srd-5.2.1-en.layer.json",
  "srfh-shelving-en.layer.json",
  "fh-species-en.layer.json",
  "fh-skills-en.layer.json",
  "fh-trainings-en.layer.json",
  "fh-inheritance-en.layer.json",
  "fh-arcana-en.layer.json",
  "fh-feats-en.layer.json",
  "fh-spells-en.layer.json",
  "fh-soulforging-en.layer.json",
  "fh-gems-en.layer.json",
  "fh-fiche-en.layer.json",
  "fh-lore-en.layer.json"
];
