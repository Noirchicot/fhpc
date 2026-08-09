# Inventaire — lot 27 `violations-clefs`

Base : `02efc1a`. Le lot ne modifie ni `derive.mjs`, ni les avertissements, ni
`src/schemas/invariants.mjs`. `rebuild` conserve son refus historique : seule
la frontière publique de `build.validate` enveloppe les invariants.

## Les treize clefs

| Clef | Producteur | `path` |
|---|---|---|
| `document.invariant-violated` | enveloppe de `charInvariantViolations()` à `build.validate` | absent : le texte source ne fournit pas une ancre sûre et le validateur reste distinct |
| `choice.query-threw` | `block.mjs`, refus de `layers.query` | `choice.path` |
| `choice.ref-missing` | `block.mjs`, ref absente de la pile | `choice.path` |
| `derive.threw` | `block.mjs`, entonnoir de `derive()` | absent : contenu/câblage cassé, pas une carte joueur |
| `skill-grant.count-mismatch` | `block.mjs`, compte de compétences déclaré | racine `species`/`class` concernée |
| `background.ability-key-invalid` | `block.mjs`, `ability_keys` hors des six | absent : faute de contenu |
| `background.boost-disallowed` | `block.mjs`, boost hors arrière-plan | `choice.path` |
| `background.feat-mismatch` | `block.mjs`, don différent de celui accordé | `background.feat` |
| `stat.entry-not-stat` | `validate.mjs`, entrée de stat invalide | `resolved.stats` |
| `stat.breakdown-missing` | `validate.mjs`, détail absent | `resolved.stats[<id>]` |
| `stat.term-not-integer` | `validate.mjs`, terme non entier | `resolved.stats[<id>]` |
| `stat.value-not-integer` | `validate.mjs`, `value` non entier | `resolved.stats[<id>]` |
| `stat.value-mismatch` | `validate.mjs`, somme contradictoire | `resolved.stats[<id>]` |

La mesure initiale comptait treize **sites** : les douze producteurs ci-dessus
et `block.mjs:357`, qui délègue par `...statSumViolations()`. Cette délégation
ne fabrique pas de treizième phrase ; la clef d'enveloppe des invariants rend la
surface publique entièrement structurée sans modifier l'autre collection.

## Libellés et imports

`createLabels()` a été extrait de `src/play/labels.mjs` vers `src/labels.mjs`.
Les paquets du jeu restent dans `play`; le paquet français des violations est
commun à `build` et à l'adaptateur MCP. Cela réutilise le mécanisme existant
sans importer `src/play/` depuis `src/build`, interdit par son garde, ni
importer `src/build/` depuis MCP, interdit par le sien.

Les clefs de violation autorisent le point :
`^[a-z][a-z0-9.:_-]{0,79}$`. Ce n'est pas un `overridePath` ni une ancre de
`resolved`; `derive.threw` est le nom explicitement arbitré.

## MCP

MCP conserve son texte français identique, rendu par le paquet commun. Son
`structuredContent` laisse passer les objets `{key, params, path?}` tels quels :
une IA peut donc agir sur la clef et le chemin sans analyser le texte. Aucun
`outputSchema` n'est ajouté : il dupliquerait le contrat du bloc sans
comparateur.

## Preuves et attaques

- Les treize phrases attendues sont écrites en dur dans
  `tests/build-violations.test.mjs`.
- La forme publique est vérifiée : aucune chaîne, clef valide, paramètres plats
  et scalaires, chemin exact d'une ref morte.
- Attaque du garde : une chaîne nue dans la collection jette.
- Attaque de libellé : une clef sans paquet jette, sans repli sur son id.
- Attaque de chemin : un chemin volontairement remplacé par un voisin fait
  rougir l'assertion d'ancre exacte.
- L'ancienne assertion `assert.match` sur une violation de somme reçoit
  maintenant `String(violation)`. C'est l'unique adaptation inévitable :
  `assert.match` exige une primitive chaîne, alors que la sortie publique est
  désormais un objet. Le texte vérifié ne change pas.
