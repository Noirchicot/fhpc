# INVENTAIRE — LOT 61 « Destiny »

> L'écran théâtral. Un texte qu'on chasse · **une** carte, de dos · **on la
> tape** · le texte une seconde après · deux boutons qui restent.

| | |
|---|---|
| **Avant** | **968** tests, 0 échec, `EXIT=0` |
| **Après** | **981** tests, 0 échec, `EXIT=0` |

## 🔴 Le changement de fond : plus rien ne s'écrit avant `Validate`

Au lot 45, le bouton « Draw » posait `choose({path:"fh.destiny.arcana"})` dans
le document **sur-le-champ**. B6.2 dit l'inverse : *« tant que Valid n'est pas
tapé, ça n'est pas acté »*, et *« Draw again est ILLIMITÉ »*.

Le tirage vit donc en **état d'écran** (`state.destinyDraw`), et `Validate`
seul le commet. Vérifié au navigateur : taper la carte ne produit **aucun**
verbe ; `Draw again` la remet **de dos**, Validate **s'éteint**.

📌 Cohérent avec ta décision du 2026-08-13 — *« seul le résultat compte, aucun
historique »* : relancer ne laisse aucune trace, ni dans le document ni ailleurs.

## Les assets — mesurés, et un piège désamorcé

| | |
|---|---|
| **22 faces** | Tarot de Marseille, domaine public · 42–59 Ko pièce |
| **Le dos** | ton candidat FH, **720 px** (ton arbitrage) · 246 Ko |
| **Le jeu entier** | **1,37 Mo** |

### 🔴 LE PIÈGE, ET IL EST SILENCIEUX PAR NATURE

**Marseille numérote la Justice en 8 et la Force en 11. Le moteur suit
Rider-Waite** — `strength` porte **VIII**, `justice` porte **XI** (mesuré dans
le layer). Un mapping **par numéro** intervertit les deux : le joueur tire
« Strength », voit la Justice, et **rien ne plante**. Deux fichiers valides,
deux ids valides, zéro erreur. **Aucun test de rendu ne peut voir ça**, parce
que du point de vue du code tout est correct.

Le mapping est donc fait **par nom**, et un garde le vérifie sur le fichier de
mesure — avec l'attaque qui rejoue la faute pour prouver que les deux mappings
divergent bien. C'est la partie du lot qui a le plus de valeur à long terme.

*(Second décalage connu et normal : le Mat porte 0 chez Rider-Waite et 22 chez
Marseille — il n'est pas numéroté à l'origine. Gardé aussi.)*

### Pourquoi 720 px pour le dos est le bon chiffre

La source fait 959 px, et un écran ×3 en demanderait ~990. Mais **les faces de
Marseille ne font que 350 px** : un dos net sur des faces molles serait pire
qu'un jeu homogène. Ton chiffre était juste pour une raison que je n'avais pas
donnée.

## ⏳ Ce qui est provisoire, et le test l'exige

**Ton art FH couvre 12 des 22 arcanes** (statuts `locked` / `pilot` /
`approved`, et un `restart-candidate` sur la Papesse). Marseille tient l'écran
en attendant ; le remplacement sera **un échange de fichiers**, l'écran ne
change pas.

⭐ Un test exige que ce caractère provisoire **reste écrit** dans le fichier de
mesure — pour que personne ne prenne le provisoire pour du définitif dans six
semaines.

## Ce que le lot a réutilisé plutôt que réécrit

**« Choose yourself » passe par le catalogue partagé du lot 60** — et ce n'est
pas une élégance, c'est le garde de ce lot-là qui l'a imposé : il interdit
d'écrire un second catalogue. Il a fonctionné exactement comme prévu.

Une seule extension, étroite et nommée : Destiny n'a **aucun plan** dans
`decisions[]` (mesuré au lot 45, toujours vrai), ses 22 options viennent donc
du catalogue de couches. `catalogueOptions` accepte une liste fournie — avec,
en commentaire, l'interdiction de s'en servir pour composer une liste à la main
quand un plan existe.

## 👀 Trouvé à l'œil

**L'écran Destiny ne s'affichait plus du tout.** La branche de rendu testait
`CATALOGUES[step.id]` — or Destiny EST dans la table, mais n'est un catalogue
qu'en mode « Choose yourself ». En mode tirage, la branche l'attrapait et
rendait un catalogue vide. `catalogueCourant()` au lieu de la table brute.
**Zéro test ne le voyait** : les tests montent les fonctions, pas la coquille.

## ⚔️ Deux gardes m'ont attrapé, et ils avaient raison

1. **Le garde du vocabulaire** (`ui-jetons`, test 10) : j'avais écrit des
   classes `.destiny-*` dans `shell.css`. La convention du lot 45 est que le
   module nomme sa mécanique en clair, mais que **les classes qu'il pose sont
   neutres** (`card-…`) — pour que la feuille de style ne connaisse aucune
   couche. Renommées.
2. **Le garde du défaut n°4, durci au lot 59** — celui que j'ai renforcé
   hier — a mordu sur **ma propre règle** : `.card-face` est un `<button>`
   avec un fond et sans encre déclarée. Encre posée.

## Ce que le lot NE fait PAS

- **Le retournement est une animation simple** (l'image apparaît en pivotant),
  pas un vrai retournement 3D à deux faces. Le geste et le timing sont
  conformes à B6 ; l'effet peut être enrichi sans toucher à la logique.
- **`prefers-reduced-motion` coupe le mouvement**, pas le geste.
- Les **mineurs** (56 cartes) sont dans le Drop mais **n'entrent pas** : aucune
  mécanique du moteur ne les utilise.
