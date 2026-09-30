# Les exemples du dépôt

| fichier | ce qu'il est | pile déclarée | s'ouvre dans l'app (`Open a file…`) |
|---|---|---|---|
| `personnage-fh-en-niveau1.fh-char.json` | Ilyra, magicienne haut-elfe **Fate's Hand**, **générée** par `node src/tools/exemple-fh-en.mjs` | la pile FH de l'app | ✅ |
| `personnage-srd-en-niveau1.fh-char.json` | Vesna, magicienne haut-elfe **SRD**, Criminal (don Alert), **générée** par `node src/tools/exemple-srd-en.mjs` (lot 379) | la pile SRD de l'app (`srd-5.2.1-en`, `srfh-shelving-en`, `srfh-mecaniques-en`) | ✅ |
| `personnage-srd-fr-niveau1.fh-char.json` | Sylvane, magicienne elfe **française** : une **FIXTURE FIGÉE**, pas un fichier de joueur | `srd-5.2.1-fr` + `exemple-homebrew-fr`, qu'aucune pile de l'app ne monte | ⛔ |
| `layer-homebrew-fr.fh-layer.json` | la couche homebrew d'exemple que la fixture française déclare | — | — |
| `catalog-modele.layer.json` | le **modèle d'un catalog de créateur** (lot 390) : un record de chaque genre qu'un créateur ajoute, tout inventé. Le juge l'accepte (`src/catalog/juge.mjs`, garde `tests/catalog-390.test.mjs`) ; le guide est `docs/CATALOG.md` | — | ✅ par `Import a book` (Layers) |

## ⚠️ La fixture française est figée — lot 379, ARCHI 35, 30/09

`personnage-srd-fr-niveau1.fh-char.json` est la **graine du personnage d'acceptation** : `tests/build-harness.mjs`
en tire `acceptanceDocument`, et treize suites la lisent. Son `resolved` est **écrit à la main**, et c'est voulu :
`tests/build-acceptance.test.mjs` compare la dérivation à ce fichier et **nomme chaque divergence**. Le régénérer
effacerait la cible de cette comparaison.

⛔ **Il ne s'ouvre pas dans l'app** : sa pile n'y est jamais montée. Ouvert quand même, il se recale sur la pile
SRD (`socle-perso-sauve-s-ouvre-toujours`) et bute sur trois choix de la couche homebrew (`gear[8]`, `feat.extra`,
`feat.magicInitiate.cantrip`) ; Sheet nomme chacun avec son étape (lot 379). Le schéma n'admet aucun champ libre à
la racine d'un `fh-char/1` : c'est **ce fichier-ci** qui le dit, pas le document.

➡️ Pour ouvrir un personnage SRD dans l'app, c'est `personnage-srd-en-niveau1.fh-char.json`.

⛔ Les deux exemples générés ne s'éditent **jamais à la main** : on corrige le générateur ou la couche, puis on
rejoue la commande. Un garde compare le fichier commité à une génération fraîche, octet pour octet.
