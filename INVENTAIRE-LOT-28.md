# Inventaire — lot 28 `projection-decision`

Base : `cec7291eaa1587670de123196ab313713ee98042` (`main`, 570/570).

## Audit de contrat et arbitrages

Aucun conflit bloquant n'a été trouvé avant le code.

- `rebuild` rendait six carnets publics : `underived`, `unconsumed`,
  `overridesApplied`, `shadowed`, `warnings`, `diff`. `decisions` est le
  septième ; il n'entre ni dans `resolved`, ni dans le document.
- **Les décisions déjà prises restent incluses.** Une décision multiple rend
  le plan entier et ses étapes consommables. Une complète est `answered`, une
  partielle porte le compte `remaining` et seulement ses places manquantes
  sont `pending`.
- **Un choix illégal ne disparaît pas.** Il reste dans le carnet avec
  `status: "locked"` et un `lock` du contrat lot 27 `{key, params, path?}`.
  Les nouvelles clefs `decision.kind-mismatch` et
  `decision.option-unavailable` sont dans le paquet commun de libellés ; les
  verrous de boost, de don et de compte réutilisent les clefs existantes.
- **`validate` ne publie pas la projection.** Son appel interne historique à
  `derive` reste nécessaire à ses contrôles de compte ; sa sortie demeure
  `{ok, violations, warnings}` et ne devient pas un second rapport.
- **MCP publie le carnet.** C'est le choix explicite de ce lot : l'IA appelle
  les mêmes `choose` / `set` / `clear` et doit recevoir la même projection
  stable sans analyser des phrases. `structuredContent.decisions` traverse
  tel quel et le texte de l'outil nomme le carnet et les statuts.

## Ce qui est projeté — et rien de plus

| Source réelle | Chemins publics | Options |
|---|---|---|
| `takeRef` | `class`, `species`, `background` | ids des records du genre monté |
| `class.skill_choice` | plan `class.skills` + étapes | slugs posables ; `from: any` = catalogue réel |
| `species.granted_skill_choice` | plan `species.skills` + chemins déjà posés | slugs posables ; Araag = tout, Elestu = sa liste |
| `background.ability_keys` | `background.boost` + boosts posés | clefs machine de la liste |
| `background.feat_id` | `background.feat` | id du don imposé |
| `background.tool_id` | `background.tool`, déjà `answered` | id accordé, provenance `required` |
| `background.tool_choice` | `background.tool` ou son chemin déjà posé | ids de `from`, provenance `offered` |

Aucun sort, équipement, rendu de fiche, document, trait, ressource ou palier
de compétence n'est projeté. `cost` est facultatif et n'est recopié que si la
déclaration le porte réellement ; la matière actuelle n'en porte pas sur ces
déclarations, donc le moteur n'en invente aucun depuis `tier_costs`.

## Preuves

- SRD pur : liste exacte des chemins, aucune famille surnuméraire.
- boucle `set` → `rebuild` → `clear` → `rebuild`, avec plan partiel puis
  restauré ; les statuts fantômes disparaissent.
- faux choix gardé `locked`, clef traduite par le mécanisme existant.
- Araag `from: any` = 26 slugs de la vraie pile ; Elestu = exactement
  `delve`, `survival`, `vigilance`.
- `tool_choice` réel du Soldat parcouru par `choose`, `clear`, `rebuild`.
- MCP : chemin, options, compte et statut dans `structuredContent`, carnet
  nommé dans le texte.
- `validate` : absence stricte de `decisions` dans sa forme publique.
