# INVENTAIRE — LOT 64 « Inheritance »

| | |
|---|---|
| **Avant / Après** | **993** tests, 0 échec, `EXIT=0` *(les tests existants ont suivi la nouvelle forme ; aucun n'a été perdu)* |

## Ce que B4 demandait

**B4.1** deux dalles **centrées**, chacune avec un **cercle** qui est un
indicateur, pas un bouton — et ✅ **l'ordre est libre**. **B4.2** ouvrir l'une
fait **DISPARAÎTRE** l'autre : pas grisée, pas repliée, absente — c'est ce qui
rend la scène lisible à 360 px. **Six colonnes côte à côte**, molette
**verticale**, trois crans `0` / `+1` / `+2`. **B4.4** `Validate` **ferme** le
panneau ; les deux cercles cochés, il avance. **B4.5** — rien à coder : la
molette des étapes marche déjà, et c'est précisément ce qu'Eric voulait dire.

🔴 **L'ordre est celui du SRD** (STR·DEX·CON·INT·WIS·CHA), alors que **le plan
publie ses options en ordre ALPHABÉTIQUE** — mesuré : `cha, con, dex, int,
str, wis`. On réordonne pour l'affichage, sans jamais rien ajouter ni retirer.
Un test l'exige.

## 📏 B4.3 : la crainte est levée, avec le chiffre

Ta mesure annonçait **44,0 px par colonne**, « tout juste et sans marge », et
**40,7 avec gouttière** — sous le seuil de Google. Et tu avais nommé le
coupable : *« ce n'est pas le nombre de colonnes, c'est le PADDING de 32 px »*.

Il est tombé à 16 px au lot 59, et cet écran est en **plein cadre**. Mesuré au
navigateur : **50 px par colonne**, gouttière comprise, aucun débordement.

## Ce que le lot a réutilisé

**Le don d'origine passe par le catalogue partagé** — B4.4 dit « exactement
comme Class et Species », donc défilement aimanté + rail, pas une troisième
copie. Ses cinq fiches portent enfin leur **description en entier**, ce que
les petites cartes du lot 46 n'avaient pas la place de faire.

## 👀 Trouvés à l'œil

**Deux, et tous deux invisibles aux tests.**

1. `renderBoostColumns` déstructurait `document` du `ctx` — **le document du
   personnage masquait le `document` global**, et `createElement` disparaissait.
   Le fichier s'en sortait jusqu'ici parce que seul `el()` créait des nœuds, et
   `el()` ferme sur le global. Dès qu'on crée un bouton à la main, le piège mord.
2. **La cellule « FINAL » débordait sur sa voisine** — elle vient d'Abilities,
   où elle a `min-width: 9ch`, et une colonne fait 50 px. À l'écran :
   « 8 (-1)14 (+2)14 (+2) » collés.

## Ce que j'ai failli perdre

En réécrivant l'écran, j'avais laissé tomber la **liste des quatre
arrière-plans SRD** (le cas « pile sans FH ») au profit de la simple mention
du cas FH. Un test du lot 46 l'a rattrapé : les deux formes existent, et les
confondre aurait fait disparaître un choix réel sur un personnage SRD pur.
