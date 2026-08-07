# schemas

Deux documents, un seul JSON chacun, JSON Schema 2020-12.

| Fichier | Ce qu'il décrit |
|---|---|
| `fh-char.schema.json` | `fh-char/1` — un personnage : `resolved` (la fiche jouable) + `build` (les couches, les choix, les overrides) |
| `fh-layer.schema.json` | `fh-layer/1` — une couche de règles : manifeste + records par genre, en `add` / `patch` / `disable` |

Exemples et suite : `examples/`, `tests/schemas.test.mjs`, `tests/v1-coverage.test.mjs`.
Les choix de forme et les trous restant à arbitrer : **[`CHOIX-LOT-B.md`](CHOIX-LOT-B.md)**.

## Les trois choses à savoir avant d'écrire du code contre ces schémas

**1. Une grammaire de chemin, deux enracinements.** Segments séparés par `.`,
sélection dans une collection par l'**id** du record entre crochets — jamais par
index, qui se décale à la reconstruction :

```
resolved.gear[torche].quantity      ← un override : toujours enraciné dans resolved
data.cost                            ← un patch de couche : enraciné dans le record visé
class.skills[0]                      ← un choix : là, le crochet est une position de décision
```

**2. `resolved` n'est écrit que par la dérivation.** Pli de la pile
SRD → FH → homebrew, puis les overrides **en dernier**. `build` n'est jamais
réécrit par une reconstruction : les tweaks survivent, et l'écart
règles↔décision reste affichable.

**3. Aucun état de séance dans un document.** Transaction de jet, main,
sélection, plateau, historique appartiennent au bloc `play` et ne voyagent pas.
Tous les objets sont fermés (`additionalProperties: false`) : une clef inconnue
est un rejet bruyant, jamais un strip silencieux.

## Ce que le schéma ne peut pas dire

JSON Schema n'exprime pas « unique par champ » (`uniqueItems` compare des objets
entiers). Trois invariants vivent donc dans `src/schemas/invariants.mjs`, module
pur sans dépendance :

- deux `choices` ou deux `overrides` sur le même chemin → ambigu, rejeté ;
- la même couche montée deux fois dans la pile ;
- `resolved.derivation.stack` qui ne correspond plus à `build.layers` → `resolved`
  est périmé, et il le dit.

## Empreintes de couche

`build.layers[].hash` est le **SHA-256 des octets du fichier de couche**. Une
couche ne contient jamais son propre hash : il est calculé au chargement par le
bloc `layers`, et un écart est une erreur bruyante — la couche a changé sous le
personnage.

## Validation

`ajv` (8.20.0, épinglé) est une dépendance de **dev** : elle ne sert qu'aux
tests. Le runtime reste zéro-dépendance.

```bash
npm install && npm test
```
