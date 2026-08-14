# INVENTAIRE — LOT 62 « Compétences »

> L'écran sur lequel Eric a le plus buté : **16 513 px, 266 boutons, six
> sections d'un coup**. Et celui qui force les deux dernières pièces
> communes — le **popup** et la **navigation interne horizontale**.

| | |
|---|---|
| **Avant** | **981** tests, 0 échec, `EXIT=0` |
| **Après** | **991** tests, 0 échec, `EXIT=0` |

## Les deux pièces communes, écrites UNE fois

**`ui/builder/popup.mjs`** — l'invariant III.4 le demandait en toutes lettres :
*« un popup se ferme en cliquant dehors ⛔ à coder UNE fois, pas trois »*.
Trois écrans l'emploient (B7.7, B8.2, B8.3) ; il en existe désormais une
seule implémentation, et un garde interdit à quiconque d'écouter le document
pour fermer quelque chose.

🔴 **Son piège, et c'est le seul qu'on ne verrait pas en relisant le code** :
le clic qui OUVRE le popup se produit forcément DEHORS. Un écouteur armé
tout de suite le refermerait dans le même geste — il clignoterait sans
jamais s'afficher. D'où l'armement différé, et le test qui l'exige.

**Le slot horizontal du cadre** (`.stage-topbar`) — la navigation interne
fixe de B0.19, dans sa forme horizontale. `SOCLE.md` l'avait annoncée sans la
construire : *« elle demandera son propre slot, et ce lot ne l'invente pas
d'avance »*. Compétences en a besoin aujourd'hui, elle entre aujourd'hui.

## Ce que B7 demandait, et qui est fait

| | |
|---|---|
| **B7.1** | la molette de catégories et la **ligne 1** du pool **flottent** ; la **ligne 2** (le calcul) défile |
| **B7.2** | le plancher est une **couleur**, plus un mot ; le toucher réveille le popup qui nomme d'où vient le verrou |
| **B7.2d** | le tableau « Species skill budget » a **dégagé** |
| **B7.3a/b** | une catégorie = une **dalle majeure**, **sans titre** |
| **B7.3c** | **une ligne par compétence** |
| **B7.3d** | `Validate` s'illumine quand le compte est bon |
| **B7.4** | le bouton « 0 » est **supprimé** — trois ronds, conventions D&D Beyond |
| **B7.7** | le commentaire est un **popup**, qui se réveille à chaque écart |
| **B7.8** | `Reset` est dans la **barre du pool**, donc toujours atteignable |

⭐ **Et la suppression du « 0 » n'était pas un détail d'affichage.** Les ronds
passent de 24 px — *« exactement le minimum absolu de WCAG 2.5.8 »* — au
seuil tactile de **44 px**. Avec quatre ronds, « une ligne » et « touches au
doigt » étaient **incompatibles** à 360 px. Avec trois, les deux passent.

## 🔴 LA MESURE DE B7.5 ÉTAIT OPTIMISTE — elle oubliait deux colonnes

B7.5 annonçait **124 px pour le nom** avec trois ronds à 44 px. Mesuré au
navigateur après construction : **65 px**, et « Academics » se coupait.

Deux causes, toutes deux invisibles au calcul :

1. **Le calcul oubliait les colonnes `ability` et `bonus`** (INT · +3), qui
   existent dans la grille depuis le lot 39 ;
2. **trois remplissages emboîtés** — marge de carte, remplissage de carte,
   remplissage de dalle — mangeaient **74 px** sur 360. La ligne ne faisait
   plus que **286 px**.

**Corrigé** : Compétences passe en **plein cadre** comme Class (l'écran est
composé de SES propres dalles, la carte-enveloppe n'ajoutait qu'une marge),
et l'écart entre les ronds tombe à zéro — chaque pixel repris retourne au
nom, et les cibles tactiles restent entières puisque c'est l'espace *entre*
elles qui part.

**Après** : ligne **328 px**, nom **135 px**. Et le résultat exact :

> **Zéro compétence ne se coupe** — « Sleight of Hand », le nom que B7.5
> mesurait, tient. **Trois OUTILS se coupent** : Calligrapher's Supplies,
> Leatherworker's Tools, Three-Dragon Ante Set.

B7.3c dit « le texte des **skills** doit tenir sur une ligne » : c'est tenu à
la lettre. Les noms d'outils sont d'une autre longueur — et B8.3 leur donne
justement **deux lignes** sur Equipment. ⏳ À poser à Eric quand cet écran-là
sera fait : les outils de Compétences suivent-ils la même règle ?

## ⚔️ Une erreur du lot 60, corrigée

Mon garde du catalogue interdisait `data-snap` hors de `catalogue.mjs`.
**C'était trop large, et ça a bloqué ce lot** : `SOCLE.md` désigne
explicitement `data-snap` comme un contrat du **socle** — *« le seul contrat
entre un écran et le spy »*. Compétences s'aimante sur ses catégories sans
être un catalogue (pas de records, pas de rail vertical).

Le garde ne protège plus que le **composant** (`.catalogue-card`,
`.catalogue-rail`). C'est ça, « B3 = B2, point » — pas le monopole d'un
attribut.

## Ce que le scrollspy gagne

L'ancienne barre de catégories avait **son propre `IntersectionObserver`**,
qui s'abonnait élément par élément — donc mourait à chaque remplacement de
contenu (le défaut §0). Le spy du socle relit `[data-snap]` à chaque lecture
et ne retient aucun nœud : **il survit par construction**. Il a maintenant
**deux propriétaires** — le rail vertical des catalogues, la molette
horizontale de Compétences — et un seul écouteur.

## ⚠️ B7.6 EMPIRE, ET IL FAUT LE DIRE

Eric avait signalé « quatre barres fixes empilées, ~20 % de la hauteur ».
Mesuré à 360 × 780 : molette **55** + ligne de commande **45** + barre de
Compétences **110** = **210 px, soit 27 %** de la hauteur figée avant la
première compétence. Le champ utile tombe à **570 px**.

🔴 **La barre de pool y est pour 66 px à elle seule** : ses trois comptes
sont empilés étiquette-au-dessus-de-valeur. Les mettre sur une ligne
(`Pool 0/10 · Invested 4 · Left 10`) rendrait ~30 px. **Non fait** — c'est un
arbitrage de lisibilité qui appartient à Eric, et il l'avait posé comme une
question ouverte, pas comme une consigne.

## Mesures

| | avant | après |
|---|---|---|
| hauteur de l'écran (360 px) | 3 592 | **3 750** |
| ronds par ligne | 4 × 24 px | **3 × 44 px** |
| largeur de la ligne | 286 | **328** |
| place au nom | 65 | **135** |

*(L'écran s'allonge de 158 px : c'est le prix des cibles tactiles, et il est
volontaire.)*
