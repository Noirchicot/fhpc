# INVENTAIRE — LOT 67 « Review : les trois portes »

| | |
|---|---|
| **Avant** | **995** tests, 0 échec, `EXIT=0` |
| **Après** | **1 008** tests, 0 échec, `EXIT=0` |

## ⭐ Ce que le lot 65 avait ENLEVÉ, et qui revient par la fenêtre

L'écran Review déversait `resolved` en entier — **27 370 px**, chaque valeur
avec son chemin. Le lot 65 l'a remplacé par un masque de **691 px**. Ce lot
constate que **ce déversement EST le « mode expert » de B9.5** : il n'existe
rien d'autre dans le dépôt qui mérite ce nom, et c'est exactement ce dont un
expert a besoin — le chemin de chaque valeur, les `underived`, les ancres
d'override barrées quand elles sont INADRESSABLES.

Il n'est donc pas supprimé : **il est derrière une porte.**

| Porte | Ce qu'elle fait |
|---|---|
| **`Expert view`** | la même page, dans un onglet |
| **`Export HTML`** | la même page, dans un fichier |
| **`Export JSON`** | le document, **dans les octets du moteur** |

⭐ **Mesuré au navigateur** : `Export HTML` et `Expert view` produisent des
octets **strictement identiques** (117 417, les deux). Une seule fonction les
fabrique — deux chemins qui rendent « la même page » divergeraient.

## 🔴 Et ça se fait SANS rouvrir le seul `innerHTML` du dépôt

`render()` rend une **chaîne**. La poser dans la page demanderait l'`innerHTML`
que le lot 65 a fini d'éliminer, et qu'un garde attaque. La page part donc
**hors de la coquille** — onglet ou fichier. Ce n'est pas un contournement :
une page autonome est précisément ce que `src/tools/fiche.mjs` produit déjà en
ligne de commande. Le builder fait la même chose, avec le personnage vivant.

## Deux extractions, pour ne pas écrire deux fois la même règle

| | |
|---|---|
| **`src/doc/canonical.mjs`** | le corps de `toBytes`. `serialize.mjs` importe `node:crypto` (pour `digest`), donc **le navigateur ne peut pas le charger**. Recopier `JSON.stringify(doc, null, 2)` dans `ui/` aurait fait diverger l'export en silence — **un fichier exporté n'est relu par aucune suite** |
| **`injecte()` dans `render-fiche.mjs`** | l'injection dans la coquille quittait `fiche.mjs` (qui lit le disque). Le marqueur `<!--FICHE-->` n'est écrit **qu'une fois** |

## 👀 Deux défauts trouvés à l'œil

1. 🔴 **LA PAGE EXPORTÉE FAISAIT 8 205 px DE LARGE** dans une fenêtre de
   1 440. Cause : `.cell { white-space: nowrap }` dans la coquille du lot 25
   — et le **texte d'un sort est une `.cell` comme une autre**.
   Prestidigitation tenait sur **une ligne de 7 746 px**. Tant que la page
   était un outil de ligne de commande, personne ne l'avait ouverte sur un
   téléphone. **Elle est maintenant un livrable.** → **461 px, zéro
   débordement.**
2. Les trois portes ne tiennent pas sur une ligne à 360 px (mesuré) : elles
   s'enroulent, 2 + 1.

## 🔴 LE GARDE QUE CE LOT LAISSE DERRIÈRE LUI

**Un import `node:` dans le chemin du navigateur rend la page BLANCHE — et
`node`, lui, le résout très bien.** C'est le piège exact de ce lot :
`serialize.mjs` était à un import de distance. C'est la même famille que la
virgule du lot 66 — un défaut qui ne vit QUE dans le navigateur.

Le garde **marche le graphe d'imports en entier** depuis `ui/` : **41 fichiers
visités, dont 22 dans `src/`**. Il refuse aussi les spécificateurs nus (zéro
dépendance d'exécution, loi §0.1). Deux attaques : `node:crypto` réintroduit
**deux niveaux plus bas**, et un `import Ajv from "ajv"`.

## ⛔ CE QUI N'EST PAS FAIT, ET POURQUOI

**Il n'y a pas de bouton `sheet`.** B9.5 demande « un accès à `sheet` » —
`sheet` est **la fiche v2 jouable**, que la charte réserve deux fois à une
décision d'Eric, et qui n'existe pas. Un bouton vers rien serait le « faux
magasin » que le mandat interdit. Un test exige son absence, et **dit qu'il
devra changer le jour où la fiche existera**.
