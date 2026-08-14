# INVENTAIRE — LOT 65 « Review »

| | |
|---|---|
| **Avant / Après** | **993** tests, 0 échec, `EXIT=0` |

## La mesure

| | |
|---|---|
| **Avant** | **14 770 px** *(et 27 370 mesurés sur un personnage plus abouti)* |
| **Après** | **691 px** — et **il ne grandit plus avec le personnage** |

C'était le défaut nommé au §3bis : *« l'écran devient d'autant plus illisible
que le personnage est abouti — le contraire de ce qu'on veut d'un
récapitulatif. »* Le masque de B9 l'inverse : **une ligne par étape**, quel
que soit le personnage.

## ⭐ Ce que le masque lit, et pourquoi il ne peut pas diverger

Il **ne juge rien**. « Fait / pas fait » est déjà prononcé par le moteur : le
carnet porte `answered`, `expected`, `status` et `lock` sur chaque plan. Ce
fichier les **groupe par étape** et les met en phrases.

⛔ **C'est délibérément le carnet, pas une liste de conditions écrite écran
par écran.** Deux définitions de « terminé » — celle qui allume `Validate` et
celle qui remplit Review — auraient divergé au premier lot suivant.

Ce qu'il montre en plus, tel quel : **les refus du moteur**, et **les choix
qu'aucune règle ne consomme** (`species.lineage`, `abilities.mode`,
`languages[0]`) — le joueur a le droit de savoir qu'ils ne laisseront aucune
trace, avant de s'en étonner.

Et **chaque ligne mène à son écran** : voir qu'il manque quelque chose sans
pouvoir y aller ferait de Review un constat, pas un récapitulatif.

## ⭐ LA COQUILLE N'A PLUS AUCUN `innerHTML` — la fin du défaut §0

Les trois sites ont disparu l'un après l'autre :
`app.innerHTML = ""` **(lot 58, la cause de fond)** · les crans de la molette
**(lot 58)** · la fiche de Review **(ici)**.

Le garde du socle pouvait jusqu'ici n'interdire que l'assignation **vide** —
un seul site garnissait légitimement. Il **ferme la porte entièrement**
maintenant : zéro `innerHTML` dans tout `ui/`.

📌 `src/tools/render-fiche.mjs` **vit toujours** et reste testé (35 tests) :
c'est l'outil autonome de rendu de fiche. Il n'a simplement plus de raison
d'être appelé depuis le builder.

## ⏳ Ce que ce lot NE fait PAS, et c'est nommé

| | |
|---|---|
| **B9.4, l'export** | *« POSSIBLEMENT un export JSON ou HTML »*. *Possiblement* n'est pas *décidé*, et le mandat est ferme : « ne publier un bouton d'export que s'il exporte vraiment ». **Aucun bouton n'est posé.** |
| **B9.5, `sheet` et `mode expert`** | mentionnés, jamais spécifiés — et la charte réserve la fiche jouable à une décision d'Eric |
