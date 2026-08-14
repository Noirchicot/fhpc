# INVENTAIRE — LOT 63 « Abilities »

| | |
|---|---|
| **Avant** | **991** tests, 0 échec, `EXIT=0` |
| **Après** | **993** tests, 0 échec, `EXIT=0` |

## Ce que B5 demandait

**B5.1** un texte + des **dalles-boutons**, et ⛔ **rien de déplié d'avance**.
**B5.2** `Roll dice` ouvre une molette `FH 3D6` / `4D6` avec une explication
qui **change avec le choix** — et 🔴 **tourner la molette ne jette rien** :
c'est `Validate` qui jette (motif d'Eric : *« pour éviter de faire ramer le
mobile »*). **B5.2b** le 4D6 écarte le plus bas et garde les trois meilleurs
— sa correction, pas une déduction. **B5.4/5** deux temps, six molettes en
ordre SRD. **B5.7** `Standard array` = la même chose **sans dés**.

**B5.6, le piège des deux 14 : rien à faire.** Il était déjà résolu au lot 50
— une caractéristique pointe vers l'**index** d'un dé, jamais vers sa valeur.
`Standard array` passe par la même carte `assign`, donc par le même remède.

## 🔴 UNE MÉTHODE SUR QUATRE MANQUE, ET C'EST DÉLIBÉRÉ

B5.1b en nomme quatre. **`Point buy` n'est pas offerte.** Mesuré : son budget
de points et ses coûts non linéaires n'existent **nulle part** — ni dans
`layers/srd-5.2.1-en.layer.json`, ni dans le moteur.

Les écrire dans l'écran mettrait **une règle du jeu dans l'interface** (loi du
dépôt), et publierait des nombres dont on ne sait pas s'ils sont SRD — ce que
**§0.8 interdit**. Une tuile morte serait un faux magasin : il y en a trois,
et un test garde cette absence pour qu'on ne la prenne pas pour un oubli.

⭐ **`Standard array` est offerte, et la distinction se défend** : ce n'est
pas un barème à appliquer mais une **liste de six valeurs** que le widget
propose — la même famille que `MANUAL_ENTRY_RANGE`, déjà déclaré « un choix
cosmétique de widget, PAS une règle ». Rien n'est calculé, rien n'est opposé.

## Ce que j'ai gardé plutôt que perdu

`abilities.mode` **reste écrit au document**. Aucune règle ne le consomme
(Review le classe dans « player choices no rule consumed »), mais c'est un
champ que le joueur remplit : cesser de l'écrire aurait perdu une intention
en silence. Un garde d'octets le vérifie.

## 👀 Trouvé à l'œil

**La molette d'affectation s'empilait en colonne** — les six valeurs sous le
`flex-wrap` du picker partagé, six lignes de haut par caractéristique, l'écran
à 2 000 px. B5.5 dit « une molette » : une molette **défile**, elle ne se
replie pas. `nowrap` + défilement horizontal → **rangée de 52 px, écran de
680 px, tout tient dans une hauteur d'écran.**

Et un import manquant (`rollAbilityBatch`) : `Validate` ne jetait rien, sans
qu'aucun test ne le voie — ils montent les fonctions, pas la coquille.
