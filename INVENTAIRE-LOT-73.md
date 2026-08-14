# INVENTAIRE — LOT 73 « le snap s'arrête où il faut »

| | |
|---|---|
| **Avant** | **1 049** tests, 0 échec |
| **Après** | **1 054** tests, 0 échec, `EXIT=0` |

## Le signalement, et pourquoi il visait juste

Eric, devant le site déployé : *« le snap défilement n'est pas fluide, ça
s'arrête n'importe où »* — capture à l'appui, la fiche Elf posée à mi-course.

C'était **mon** choix, au lot 58, et le CSS en portait le motif :

> *« `proximity`, PAS `mandatory`, ET C'EST MESURÉ : une fiche plus haute que
> le champ deviendrait partiellement inatteignable au repos. »*

## ⭐ Le motif était bon. Il a cessé d'être vrai.

Mesuré sur le site **déployé**, Species ET Class :

| | |
|---|---|
| Fiches par écran | **12** |
| Hauteur de chaque fiche | **614 px** — exactement le champ |
| Fiches plus hautes que le champ | **0** |
| Fiches dont le contenu déborde | **0** |

Depuis les lots 69/70, **une fiche EST un champ** — `.catalogue-card { height:
100% }` dans `.catalogue-cards { height: 100% }`, et le lot 69 l'avait déjà
écrit noir sur blanc. Le danger que `proximity` évitait n'existe plus. Son
prix, lui, se voyait à chaque geste : `proximity` lâche prise dès qu'on
relâche loin d'un cran, et **avec des fiches d'exactement un champ il n'y a
aucun endroit légitime où s'arrêter entre deux**.

## 🔴 Ce que ce lot fait de plus que changer un mot

`mandatory` n'est pas inconditionnellement bon : **il l'est parce qu'une fiche
fait un champ**. Cette condition n'était écrite nulle part — elle ne tenait
que par la mémoire de qui l'avait mesurée. Le jour où une fiche redeviendrait
plus haute, son bas serait inatteignable au repos : le danger du lot 58,
revenu par la fenêtre, **invisible dans une suite verte**.

`tests/snap.test.mjs` écrit la condition et la garde :

| | |
|---|---|
| **A** | la scène aimante en `mandatory` |
| **B** | la fiche est **verrouillée** à la hauteur du champ — `height`, et ⛔ **jamais `min-height`** |
| **C** | les deux moitiés du mécanisme sont posées (l'aimant sur la fiche, le type sur le conteneur) — le défaut du lot 58 rejoué en témoin |
| **⚔️ A** | revenir à `proximity` fait rougir |
| **⚔️ B** | 🔴 `height` → `min-height` fait rougir — **l'attaque qui compte** : elle ne casse pas l'aimantation, elle casse sa condition. C'est le geste raisonnable de quelqu'un qui voudrait laisser respirer une fiche bavarde |

## ⚠️ La limite, nommée

Ce garde **lit le CSS, il ne mesure pas un navigateur**. Il prouve que la
fiche ne peut pas GRANDIR ; il ne prouve pas que son CONTENU y tient. Aucune
fiche ne déborde aujourd'hui (mesuré : `scrollHeight === clientHeight` sur les
24 fiches de Species et Class) — le jour où ça arrivera, c'est un autre
défaut, et il se verra à l'œil.

📌 **Et c'est la troisième fois de la séance que le même motif revient** :
une décision juste au moment où elle est prise, dont la raison expire sans
que rien ne le signale. Le lot 43 avait laissé `background` en `pending` en
écrivant « ce n'est pas ce que ce lot répare » ; le lot 58 a choisi
`proximity` pour une raison qui a cessé d'être vraie. **Une raison mesurée
devrait porter sa date de péremption sous la forme d'un garde.**
