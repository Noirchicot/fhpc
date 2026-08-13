# INVENTAIRE — LOT 60 « Species »

> **Ce que le lot devait faire** : l'étape 3, « identique à la 2 » (Eric).
> **Ce qu'il a fait** : Species, oui — mais surtout **le catalogue extrait**,
> parce que « identique » écrit deux fois n'est plus identique bien longtemps.

| | |
|---|---|
| **Avant** | **953** tests, 0 échec, `EXIT=0` |
| **Après** | **968** tests, 0 échec, `EXIT=0` |

## Le geste principal : ne pas recopier

`ERGONOMIE-BUILDER.md` le demandait mot pour mot : ⛔ *« Ne recopie pas B2
ici. Une règle écrite deux fois diverge — c'est la loi du dépôt, et elle a
déjà coûté. B3 = B2, point. »*

Le lot 58 avait construit le catalogue à défilement aimanté **dans**
`class-step.mjs`. La pente naturelle était de le dupliquer. Il est donc sorti
dans **`ui/builder/catalogue.mjs`**, et les deux écrans en deviennent des
**configurations** :

| | Ce qui est partagé | Ce que l'écran fournit |
|---|---|---|
| `catalogue.mjs` | les douze fiches aimantées · le rail · les deux paliers · l'ordre du plan | — |
| `class-step.mjs` | — | le corps d'une fiche de classe · le menu `class.skills` |
| `species-step.mjs` | — | le corps d'une fiche d'espèce · la bourse **ou** le QCM |

Même précédent que `carnet.mjs` au lot 42. Et dans la coquille, **les deux
branches sont devenues une** : une table `CATALOGUES` de deux lignes. Ajouter
un troisième écran à catalogue serait une ligne de plus.

## 🔴 CE QUE LE LOT A DÛ TRANCHER, ET QU'ERIC N'AVAIT PAS DIT

**Une espèce qui n'accorde rien n'a QU'UN SEUL palier.** Loroka (et huit
autres) ne publie ni bourse captive ni QCM : un 2ᵉ appui l'aurait poussée
dans un **menu vide**. L'invariant I.4 le prévoit — *« un écran peut en
compter un, deux ou trois »* — mais personne ne l'avait appliqué à un écran
dont le nombre de paliers **dépend du record choisi**.

⚠️ **Et ça ne peut se savoir qu'APRÈS le `choose`** : le plan du 2ᵉ palier
décrit le record **choisi**, pas celui qui était sous le curseur. `shell.mjs`
ré-interroge donc la porte une fois le carnet reconstruit, et avance d'une
étape si le second palier n'existe pas. Vérifié au navigateur : Loroka →
`Validate` → **étape 4 directement** ; Elestu → `Validate` → **le menu de la
bourse captive**, trois lignes, puis `Validate` → étape 4.

**Une seconde inférence, signalée plutôt que fondue dans le code** : que le
2ᵉ palier de Species soit **le budget d'espèce** n'a jamais été dit par Eric.
`ERGONOMIE-BUILDER.md` le signale lui-même comme inféré. C'est la lecture
retenue — elle découle de « B3 = B2 » et c'est la seule qui donne un sens au
2ᵉ appui — et elle est écrite en clair au-dessus de `speciesPalier2`.

## Ce que la fiche d'espèce montre

Taille · vitesse · type de créature · sens — puis les deux apports Fate's
Hand, **Destinée** (`destiny.base`) et **points de compétence**
(`skill_points.by_level["1"]`) — puis les **noms** des traits. Les
descriptions restent dehors, même raison qu'au lot 58 : les couper serait
effacer des mots, les afficher en entier referait les 6 628 px d'Inheritance.

⚠️ **Ce ne sont PAS les lignes de Class**, et un test l'exige : *aucune ligne
commune entre les deux fiches*. « Partager » en aplatissant les deux écrans
sur un contenu unique serait une régression déguisée en factorisation.

## Le garde

`tests/catalogue.test.mjs`, trois preuves :

- **A** — `data-snap`, `.catalogue-card` et `.catalogue-rail` ne sont écrits
  que par `catalogue.mjs`. Attaqué sur une source inventée qui recopierait le
  catalogue dans un troisième écran ;
- **B** — les deux écrans rendent la **même forme** : autant de fiches que
  d'options, dans l'ordre du plan, aucun bouton au palier 1 (II.1), un seul
  cran courant au rail, curseur d'arrivée sur le record déjà posé ;
- **C** — et **ce qui les distingue reste distinct** (aucune ligne commune),
  les apports FH n'apparaissant que parce que la couche est montée ;
- **D** — la coquille les branche sur la **même table**, et plus aucune
  branche ne nomme Species à part.

## Ce qui a suivi mécaniquement

Le CSS `.class-*` est devenu `.catalogue-*` — un seul jeu de classes pour un
seul composant. `.species-step` a disparu avec son balisage (loi §0.6). Les
tests des lots 42/58 ont suivi la nouvelle API ; **ce qu'ils prouvent n'a pas
bougé**, seule la porte d'entrée a changé.

## Vérifié à l'œil, 360 × 780

Species et Class : **12 fiches, 12 crans de rail, pas 680 = champ 680** sur
les deux. Le décor du lot 59 respire entre le rail et la fiche. Les deux
parcours de `Validate` joués en entier.
