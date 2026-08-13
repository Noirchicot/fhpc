# Les règles du socle de rendu — lot 58

> À côté du code exprès. **Les lots d'écran lisent ce fichier au lieu de
> deviner.** Il tient sur une page ; s'il grandit, c'est que le socle a
> grandi, et c'est ça qu'il faut regarder.

## La règle de rendu tranchée : **B**

`ERGONOMIE-BUILDER.md` §RENDU laissait trois issues à `app.innerHTML = ""` :
**A** mémoriser/restaurer le défilement · **B** ne redessiner que ce qui
change · **C** garder la coquille, remplacer l'intérieur de la scène.

**Tranché : B**, et il contient A comme cas particulier.

| Niveau | Ce qui se passe |
|---|---|
| **Le cadre** (molette, ligne de commande, scène, chevrons) | **Construit UNE FOIS, jamais remplacé.** On y écrit des attributs, jamais des nœuds. C'est le **B**. |
| **L'intérieur de la scène** | Encore reconstruit d'un coup, **mais le défilement survit** (`swapContent`). C'est le **A**, à l'intérieur du seul endroit qui reconstruit encore. |

> ⚠️ **DEUX MOTS POUR NE PAS LES CONFONDRE.** Eric appelle la surface qui
> défile « **la fiche** » (B0.21), et le français du dépôt le suit. Mais en
> CODE elle s'appelle **`.stage`** : `src/tools/render-fiche.mjs` émet déjà
> `<article class="fiche">` pour la **feuille de personnage**. Les deux sous
> le même nom, mesuré : la feuille de Review héritait `position: absolute` et
> s'affichait dans une boîte de hauteur zéro. **`fiche` = la feuille ;
> `stage` = la surface qui défile.**

📌 **Pourquoi pas B partout.** Descendre le « ne redessine que ce qui
change » jusqu'à la ligne de compétence, c'est écrire un moteur de diff —
le mini-framework de 2 000 lignes que la commande interdit. Le cadre suffit
à tenir les cinq invariants ; le reste est un coût qu'aucun défaut mesuré
ne réclame aujourd'hui.

## Qui possède quoi

| L'état | Où il vit | Qui l'écrit |
|---|---|---|
| Le **document** du personnage | `state.document` | `applyDecisionAction` seul, par un verbe du moteur |
| L'**étape** courante, le **palier** de Validate, le plan ouvert | `state` (`shell.mjs`) | `shell.mjs` seul |
| Le **cran d'aimantation** (quelle fiche est sous le doigt) | `state.classCursor` | **le scrollspy**, et lui seul |
| La **position de défilement** | le nœud DOM lui-même | personne — elle se conserve, elle ne se stocke pas |
| Le **minuteur** des chevrons | la fermeture de `mountChevrons` | lui-même |

## Les trois verbes, et rien d'autre

| Verbe | Quand | Ce qu'il fait au défilement |
|---|---|---|
| **`refresh()`** | un choix a été fait, l'écran doit se remettre à jour | **il survit** |
| **`openSurface()`** | une **nouvelle surface** apparaît : changement d'étape, ou changement de palier | **il repart en haut**, délibérément |
| *(rien)* | on **défile** | 🔴 **le défilement ne redessine JAMAIS.** Il écrit l'état et met à jour la surbrillance à la main |

⛔ **La troisième ligne est la plus importante du fichier.** Un scrollspy qui
appelle `refresh()` se mord la queue : le redessin bouge le défilement, qui
rappelle le spy. Le spy **écrit `state`, touche un attribut, et s'arrête là.**

## Ce qui ne se redessine JAMAIS

- `.belt` et ses dix crans — **les nœuds sont créés une fois**, seuls
  `data-status` / `aria-current` changent ;
- `.command` — les deux boutons (`Show plan`, `Validate`) sont les **mêmes
  nœuds** du début à la fin de la session ;
- `.stage` — **le conteneur qui défile** ne meurt jamais (son contenu, si) ;
- `.stage-chevrons` — avec son minuteur ;
- `.stage-aside` — la barre de navigation interne (B0.19) : le **slot**
  persiste, ce qu'un écran y met peut changer.

## Ce qui doit survivre à une mise à jour

Les cinq de `ERGONOMIE-BUILDER.md` §RENDU, et où chacune est logée :

| Ce qui survit | Comment |
|---|---|
| la position de défilement (**II.1**) | `swapContent` la relit et la repose |
| l'observation du défilement (**II.3**) | `watchSnap` pose **un** écouteur sur un nœud qui ne meurt pas, et **ne retient aucun élément** — il relit `[data-snap]` à chaque lecture |
| le minuteur des chevrons (**I.7**) | `mountChevrons`, fermeture posée une fois |
| l'état d'un popup (**III.4**) | ⏳ **pas construit** — aucun écran de ce lot n'en a. Il vivra dans `state` comme le reste, jamais dans le DOM |
| le palier de `Validate` (**I.4**) | `state.palier`, hors du DOM par construction |

## Les quatre fonctions du socle

`socle.mjs` — et le fichier doit rester lisible d'un coup d'œil.

- **`swapContent(node, children)`** — 🔴 **le SEUL endroit du dépôt qui
  remplace le contenu d'un nœud.** Un garde le prouve
  (`tests/socle.test.mjs`), sur le modèle de `markPressed()` (lot 57) :
  une brique, un écrivain, un garde.
- **`keepInView(scroller, child, axis)`** — remplace `scrollIntoView`, qui
  remonte toute la chaîne des ancêtres et **déplaçait la page entière**
  (défaut §0, seconde moitié). Un garde interdit `scrollIntoView` dans
  `ui/`.
- **`watchSnap(scroller, onSettle)`** + **`nearestIndex(offsets, target)`** —
  le scrollspy-sélecteur. La décision est une fonction **pure**, testée ; la
  géométrie se regarde dans le navigateur.
- **`mountChevrons(host, scroller)`** — les chevrons flottants et leur
  minuteur.

⛔ **N'ajoute rien ici sans un écran qui en a besoin AUJOURD'HUI.** Le piège
nommé par la commande du lot : un socle écrit pour des besoins imaginés,
avant qu'un seul écran fonctionne.

## Le contrat d'un écran

Un module d'écran exporte une fonction qui **rend un nœud** et ne connaît
ni la coquille ni les verbes du moteur (loi des lots 39/42, inchangée).

Ce que le lot 58 ajoute, et **seulement pour les écrans qui en ont besoin** :

- **des paliers.** Un écran peut exporter un descripteur de paliers lu par
  `shell.mjs` — `{ label, ready, commit }`. Un écran qui n'en exporte pas a
  **un** palier par défaut : *avancer*. C'est exactement ce que faisait le
  bouton `Continue` d'avant — aucun écran n'a donc à mentir sur des paliers
  qu'il n'a pas ;
- **un rail** (`.stage-aside`). La navigation interne fixe de **B0.19**, dans
  sa forme **verticale** (celle de Class). ⚠️ La forme **horizontale** (la
  molette de catégories de Compétences, B7.1) **n'est pas construite** —
  elle demandera son propre slot, et ce lot ne l'invente pas d'avance ;
- **`data-snap`** sur les fiches d'un défilement aimanté. C'est ce que
  `watchSnap` lit — le seul contrat entre un écran et le spy.
