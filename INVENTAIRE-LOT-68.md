# INVENTAIRE — LOT 68 « le spy, et l'instrument qui mentait »

| | |
|---|---|
| **Avant** | **1 008** tests, 0 échec |
| **Après** | **1 016** tests, 0 échec, `EXIT=0` |

## 🔴 Ce que ce lot devait corriger — et qui n'était pas cassé

Eric, au navigateur : *« pas de snap… pas de spy ? »*. J'ai mesuré, annoncé
**« le spy est mort, et je viens de le prouver »**, et ouvert ce lot.

**C'était faux. Deux fois.**

| Ce que j'ai observé | Ce que ça valait |
|---|---|
| Le rail reste sur « Barbarian » pendant que les fiches défilent | volet du navigateur **masqué** |
| `evenementsScrollRecus: 0` alors que `scrollTop` bouge | idem |
| `st.scrollTop = x` sans effet, six fois | idem |

🔴 **`watchSnap` s'étrangle par `requestAnimationFrame` — et rAF NE TOURNE PAS
DANS UN ONGLET MASQUÉ.** Mon instrument désactivait précisément la pièce que
je prétendais mesurer. Dès qu'une capture d'écran a forcé le volet à se
peindre : carte = Fighter, rail = **Fighter**. Synchrone.

📌 **La forme de la faute** — c'est la consigne n°5 du majordome, dans une
variante que je n'avais pas prévue : *un instrument peut mentir en silence*.
Un `ls | wc -l` qui répond 17 au lieu de 22, on le repère. Un volet masqué
qui gèle rAF rend des chiffres **cohérents et faux**.

## Ce que le lot livre quand même — et pourquoi ça valait le détour

En cherchant **comment** tester le spy, j'ai trouvé le vrai trou :

> **`watchSnap` — la pièce dont l'invariant II.3 dit « le scrollspy EST le
> sélecteur » — n'avait AUCUN test, sous 1 008 verts.**

Son arithmétique (`nearestIndex`) en avait cinq. Mais le **câblage** qui la
nourrit — lire le DOM, écouter `scroll`, appeler `onSettle` — n'était exercé
nulle part, **parce que le `dom-stub` n'avait ni rectangle, ni hauteur, ni
événement `scroll`**.

⭐ **Troisième occurrence de la même forme dans la séance** : *la partie pure
est prouvée, la partie qui touche le monde ne l'est pas.* (Les deux autres :
`shell.mjs` qu'aucun test n'importe — la virgule du lot 66 ; et
`scroll-snap-type` absent sous 935 verts.)

### Le stub apprend deux choses, et refuse d'en inventer une troisième

| | |
|---|---|
| **`scrollTop` émet un `scroll`** | comme un vrai navigateur. C'est ce mot que le stub ne prononçait jamais, donc aucun écouteur `scroll` n'était appelé par aucune suite |
| **`poserUneColonne()`** | le SEUL modèle de mise en page accepté : des enfants de hauteur égale empilés. `enfant[i].top = champ.top − scrollTop + i × hauteur` — exactement le catalogue |
| ⛔ **`getBoundingClientRect()` JETTE sans géométrie déclarée** | un rectangle de zéros ferait passer un test du spy en mesurant du vide. Le stub refuse de mentir plutôt que de rendre `{top: 0}` |

⚠️ **Ce que le stub ne modélise pas, et qu'il ne faut pas lui faire dire** :
marges, `scroll-snap`, hauteurs inégales, `sticky`, transformées. Le spy ne
lit **que** des `top`, donc une colonne suffit à l'exercer honnêtement — mais
un test qui aurait besoin d'autre chose ment s'il utilise ce helper.

### Les huit preuves

`A` le spy prononce le bon cran (800→1, 2400→3, 8800→11, 0→0, mesures réelles
de l'écran Class) · `A bis` **sans événement, il est muet** — le trou d'avant,
rejoué · `B` il ne se répète pas sur la même fiche (un rail qui clignote, et
ça rame sur mobile) · `C` `settle()` rattrape un changement de contenu, que
rien n'annonce · `D` aucune fiche → il se tait, il ne dit jamais « la
première » · `E` il ne retient aucun nœud : 3 fiches remplacées par 12, il
compte jusqu'à 11 · **deux gardes** : le stub jette sans géométrie, et sa
colonne produit exactement les cinq `top` mesurés au navigateur
(`-2300, -1500, -700, 100, 900`).

## Ce qui reste vrai du signalement d'Eric

Il a vu quelque chose. Ce n'est pas le spy — **c'est que le rail est
illisible** : ses libellés font ~9 px à 1 440 px de large, et chaque fiche
occupe la totalité des 800 px du champ, donc défiler ressemble à changer de
page sans indice. **C'est de la mise en page**, donc le périmètre du lot 69
(Fable), pas celui-ci.
