# INVENTAIRE — LOT 71 « Inheritance se valide »

> ⚠️ La branche s'appelle `71-plans-sorts` : c'était l'intention de départ
> (publier les plans de sorts). Le signalement d'Eric — *« inheritance ne se
> valide pas »* — est passé devant, et il touchait le même fichier. Les plans
> de sorts restent à faire ; la mesure qui les rend possibles est en bas.

| | |
|---|---|
| **Avant** | **1 026** tests, 0 échec |
| **Après** | **1 026** tests, 0 échec, `EXIT=0` *(aucun test neuf : deux tests existants CHANGENT de verdict, et c'est le sujet)* |

## Le défaut, de bout en bout

La couche FH **éteint les quatre arrière-plans du SRD** (`op: "disable"`) et
n'en publie **qu'un** : `fh:background:en:inheritance`. C'est délibéré — le
lot 43 l'écrit : *« l'inheritance est **livrée, non choisie** »*.

Le moteur appliquait bien ce repli **pour les sous-plans** — d'où
`background.boost` et `background.originFeat[0]` « répondus ». Mais `refPlan`
l'ignorait :

```
le repli résout le record   →  les sous-plans sont « done »
refPlan l'ignore            →  background reste « 0 of 1 », POUR TOUJOURS
Review lit le carnet        →  « Inheritance : 0 of 1 · done · done »
                               la SEULE étape non faite, sur CHAQUE perso FH
inheritanceValidate l'ignore → Validate s'allume quand même et avance
```

**Un plan qui réclame un choix que personne ne peut faire est un moteur qui
ment.** Et ce mensonge était visible : Eric a vu l'écran Review dire que
l'étape n'était pas terminée, il est allé sur Inheritance, tout y paraissait
fait, il a validé, et Review disait toujours `0 of 1`.

## 🔴 La cause de fond : deux écrivains pour une seule question

« Quel record est retenu pour ce genre ? » était répondu **à deux endroits** —
`refPlan`, et le repli en dur dans `projectDecisions`. Ils divergeaient.

C'est la faute que ce dépôt nomme depuis toujours : *une règle écrite deux
fois diverge*. Le correctif n'est donc pas une rustine sur `refPlan` mais
**`resolvedRef(query, choices, kind)` — un seul écrivain**, que les deux
appellent. Le repli en dur a disparu ; sa portée est **inchangée au mot
près** : un menu à plusieurs options ne se résout jamais tout seul (le test
qui le prouve était déjà là et passe toujours).

📌 **Et le plan le DIT** : `delivered: true`. Un écran a le droit de savoir
que ce record est arrivé avec la pile au lieu d'avoir été choisi — sans quoi
il afficherait un menu à une seule entrée déjà cochée. *(L'écran Inheritance
le traitait déjà comme livré : seul le carnet disait le contraire.)*

## ⚠️ Deux tests changent de verdict, et c'est assumé

`tests/inheritance-lot43.test.mjs:92` **exigeait** `pending`, avec ce
commentaire : *« rien n'a changé là, et **ce n'est pas ce que ce lot
répare** »*. Le report était donc **conscient et écrit**. Il a coûté un
défaut visible deux lots plus tard.

📌 La leçon vaut plus que le correctif : **une dette qu'un test grave devient
une loi.** Le commentaire disait « pas maintenant » ; l'assertion, elle,
disait « jamais ».

## Mesuré à l'écran (worktree servi, thème clair, 1440)

| | avant | après |
|---|---|---|
| Review, ligne Inheritance | `0 of 1 · done · done`, **non faite** | **`done · done · done`, faite** |
| Étapes marquées inachevées | **1 sur 9** | **0 sur 9** |

## 🔎 Ce que ce lot a mesuré pour la suite : les sorts SONT dérivables

Le vrai manque d'Eric — *« un mago n'a pas de sorts à choisir »* — n'est pas
un trou de contenu. **Tout est déjà dans la couche** :

| | |
|---|---|
| `class-progression:wizard`, niveau 1 | `resources: { cantrips: 3, prepared_spells: 4 }` — exactement les 3 + 4 du personnage d'exemple |
| Les **339** sorts | portent **tous** `classes: ["Sorcerer","Wizard"]`, `level`, `school` |
| `spell_slots` | par niveau, déjà lus par `derive.mjs` |

Un plan `class.cantrips` / `class.prepared` est donc **dérivable sans inventer
une seule règle** : `expected` vient de `resources`, les options du croisement
`spell.classes × spell.level`. ⚠️ Seule réserve à nommer : l'appariement se
fait sur le **nom d'affichage** de la classe (« Wizard »), pas sur un id —
c'est la forme que la donnée publie, mais elle est fragile.

C'est le lot suivant, et il ne touche que `src/build/`.
