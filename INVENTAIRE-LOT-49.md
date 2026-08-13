# Inventaire — Lot 49 `equipement`

Branche `49-equipement`, coupée de `main` à `69af803` (lot 51 fusionné,
confirmé — lot 50 y est aussi). Commit du lot : `c24786a`.
Arbre propre au départ comme à l'arrivée.

**Tests** : 816 verts au départ (`npm ci && npm test`, conforme à la
commande) → **835 verts à l'arrivée** (19 tests neufs, `tests/equipment-step.test.mjs`).
Une réexécution intermédiaire de la suite complète a vu échouer un test
sans rapport (`dice.test.mjs`, RNG) — reconfirmé vert au run suivant, donc
flaky, pas une régression de ce lot (mesuré, pas supposé).

---

## 1. Comment le joueur trouve un objet parmi 133

Un seul champ de recherche (`Search gear, weapons, armor…`), sous la liste
des lignes déjà posées. Les 133 résultats (`query({kind})` sur `gear`,
`weapon`, `armor` — jamais une liste composée à la main) sont **rendus une
fois**, repliés par défaut derrière `hidden` (même geste que le plan
escamotable de `shell.mjs`, jamais `display:none` en dur — le garde
`tests/ui-jetons.test.mjs` l'interdit). Taper un nom les filtre en direct,
sans passer par `onAction`/`rebuild` (c'est un filtre d'écran, pas une
mutation du document) ; l'affichage se plafonne à 25 résultats visibles à
la fois avec une note « N matches — showing the first 25 » au-delà, pour
qu'une recherche large (« a ») reste lisible.

Chaque résultat affiche son nom, son coût et son poids (`data.cost`/
`data.weight`, recopiés tels quels — jamais reformatés) et un bouton
« Add » qui pose la ligne avec `quantity:1, equipped:false` par défaut —
le joueur ajuste ensuite sur la ligne elle-même.

## 2. Ce que j'ai fait de la phrase de classe

Rien. C'est exactement le choix d'Eric (§1a) : `data.starting_equipment`
s'affiche **telle quelle**, en entier, sans découpage en « A »/« B »/« C ».
Vérifié sur les douze classes (test 6) et attaqué spécifiquement sur le
Fighter, qui en a trois (test 6b) — la phrase complète s'affiche, rien ne
suppose deux options. Sans classe choisie, une phrase le dit
(« Choose a class first — its starting equipment text will show here. »),
lue dans `document.build.choices` directement (`path === "class"`), jamais
dans `resolved` — ça marche même si la dérivation entière échouerait pour
une autre raison.

## 3. Comment la bourse se dit

Quatre champs numériques TOUJOURS visibles (`cp`/`sp`/`gp`/`pp`) — le piège
de §0.2 n'est jamais caché : `resolved.currency` ne s'affiche
(« On the sheet: … ») que quand le moteur l'a vraiment produit ; sinon une
phrase dit qu'il manque une des quatre clefs (zéros compris). Un bouton
« Add the inherited purse (50 GP) » pose les quatre d'un coup et **ajoute**
50 à `gp` sans jamais toucher aux trois autres ni écraser un `gp` déjà posé
— le paquet de classe et les 50 PO s'additionnent (Barbare option A : 15 +
50 = 65, testé). Une phrase sous le bouton dit d'où viennent ces 50 PO
(ADDENDUMS §4, hérité de l'option B des arrière-plans SRD supprimés).
`INHERITED_PURSE_GP` est nommé une seule fois, dans `equipment-step.mjs`,
importé par `shell.mjs` — jamais un `50` nu recopié.

## 4. Ce que j'ai mesuré sur `clear`

**`clear` est SÛR sur `gear[N]`** — contrairement aux six caractéristiques
(lot 45, où `clear` fait jeter `rebuild`). Mesuré directement avec le
harnais réel avant d'écrire une ligne d'écran (script jetable, effacé) :
poser `gear[0]` + `.quantity` + `.equipped`, `rebuild()`, puis `clear`
seulement `gear[0]` (le ref) → `rebuild()` **ne jette pas** ; la ligne
disparaît de `resolved.gear`, et les deux entrées `.quantity`/`.equipped`
restantes remontent simplement dans `unconsumed` (pas d'erreur). Le geste
« Remove » est donc **offert**, et il retire les trois chemins ensemble
(`gear[N]`, `.quantity`, `.equipped`) pour ne laisser aucune entrée
orpheline dans `build.choices` — testé (test 7) avec l'assertion explicite
qu'aucun `unconsumed` ne commence par `gear[N]` après coup.

## 5. Ce qui m'a surpris

- **Le format `hidden` + rendu-une-fois** pour le chercheur a fonctionné du
  premier coup avec `dom-stub.mjs` (aucune méthode de retrait d'enfants
  n'y est simulée — `removeChild`/`innerHTML` en sont absents à dessein) :
  ça a confirmé que la bonne technique pour ce dépôt est de rendre une fois
  et de basculer la visibilité, jamais de reconstruire le DOM à la frappe.
- **L'attaque manuelle sur `shell.mjs` est passée inaperçue par toute la
  suite au premier essai.** Neutraliser `key === "gp" ? base + 
  INHERITED_PURSE_GP : base` → `base` (plus d'ajout des 50 PO) a laissé
  les 833 tests d'alors VERTS — parce que `shell.mjs` n'a aucun export
  (même limite documentée dans `tests/abilities-step.test.mjs`, « garde
  11 ») et que mon test 3 rejoue la logique à la main, sans jamais relire
  le fichier. Le garde d'octets que j'avais écrit ne vérifiait que la
  PRÉSENCE du mot `addInheritedPurse`, pas son arithmétique — un test
  « vert » qui ne prouvait rien sur ce point précis. Corrigé en ajoutant
  deux gardes qui lisent l'EXPRESSION exacte (même patron que « garde
  11 »), reconfirmés en rejouant l'attaque : ils rougissent, et eux seuls.
  Restauré, diff byte-à-byte nul (`md5` avant/après identique), suite
  complète rejouée verte.
- **`resolved.gear` ne porte aucun index positionnel** — seulement
  `{id, name, quantity, equipped}`, `id` étant le slug du RECORD, pas la
  clef `gear[N]`. Deux dagues posées comme deux lignes distinctes
  produiraient donc deux entrées identiques dans `resolved.gear` : rien à
  corriger (le moteur n'a pas besoin d'un index pour la fiche), mais ça
  écarte l'idée de faire correspondre l'écran à `resolved.gear` par
  contenu — l'écran s'appuie sur `document.build.choices` (indexé par
  `gear[N]`) pour tout ce qui s'édite, et sur `resolved` seulement pour
  ce qui se lit (AC, bourse).

## 6. Ce que j'ai changé de cette commande

- **Les trois gestes composites (`addGearLine`/`removeGearLine`/
  `addInheritedPurse`) vivent dans `shell.mjs`**, pas dans
  `equipment-step.mjs` — même patron que `resetSkills`/`assignAbilityRoll`
  (un seul `rebuild` par geste utilisateur, plutôt que trois `onAction`
  successifs qui rebuildraient trois fois). La commande ne tranchait pas
  ce point ; j'ai suivi le précédent déjà posé dans le dépôt plutôt que
  d'ouvrir une deuxième convention.
- **Renforcé le garde d'octets de `shell.mjs`** au-delà de ce que la
  commande demandait, après l'avoir vu manquer une vraie régression
  (§5 ci-dessus) — deux gardes de plus, sur l'expression exacte plutôt que
  sur la présence d'un mot.
- **Le plafond de 25 résultats affichés** dans le chercheur n'est écrit
  nulle part dans la commande — un choix d'écran pur (lisibilité d'une
  recherche large), pas une règle de jeu, ajustable sans toucher au moteur.
